import csv
import re
from pathlib import Path

import requests


API_URL = "http://127.0.0.1:8000/api/v1/market/search"

BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "stocks_to_validate.csv"
OUTPUT_FILE = BASE_DIR / "validated_stocks.sql"


COMMON_SUFFIXES = {
    "inc",
    "inc.",
    "ltd",
    "ltd.",
    "limited",
    "corp",
    "corp.",
    "corporation",
    "co",
    "co.",
    "company",
    "plc",
    "sa",
    "s.a",
    "sca",
    "se",
    "ag",
    "nv",
    "n.v",
    "holdings",
    "holding",
    "group",
    "class",
}


EXCHANGE_ALIASES = {
    "NASDAQ": {"NASDAQ", "NMS", "NGM", "NCM"},
    "NYSE": {"NYSE", "NYQ"},
    "NSE": {"NSE", "NSI"},
    "BSE": {"BSE", "BOM"},
    "EURONEXT": {"EURONEXT", "PAR", "AMS", "BRU", "LIS", "OSL"},
}


QUERY_ALIASES = {
    "Amazon.com, Inc.": "Amazon.com Inc",
    "Tesla, Inc.": "Tesla Inc",
    "Meta Platforms, Inc.": "Meta Platforms Inc",
    "Goldman Sachs Group, Inc.": "Goldman Sachs Group Inc",
    "Home Depot, Inc.": "Home Depot Inc",
    "L'Oreal SA": "L'Oréal S.A.",
    "Hermes International SCA": "Hermès International SCA",
    "LVMH Moet Hennessy Louis Vuitton SE": "LVMH Moët Hennessy Louis Vuitton SE",
    "Nestle India Limited": "Nestlé India Limited",
}


def normalize_text(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("&", " and ")
    value = value.replace("moët", "moet")
    value = value.replace("l'oréal", "loreal")
    value = value.replace("hermès", "hermes")
    value = value.replace("nestlé", "nestle")
    value = re.sub(r"[^\w\s]", " ", value)
    tokens = value.split()
    cleaned = [token for token in tokens if token not in COMMON_SUFFIXES]
    return " ".join(cleaned)


def tokenize(value: str) -> set[str]:
    normalized = normalize_text(value)
    return set(normalized.split()) if normalized else set()


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def expected_symbol_suffix(market: str) -> str | None:
    market = market.upper()
    if market == "NSE":
        return ".NS"
    if market == "BSE":
        return ".BO"
    return None


def symbol_matches_market(symbol: str, market: str) -> bool:
    market = market.upper()
    symbol = symbol.upper()

    if market in {"NASDAQ", "NYSE"}:
        return "." not in symbol and not symbol.endswith(".NS") and not symbol.endswith(".BO")

    if market == "NSE":
        return symbol.endswith(".NS")

    if market == "BSE":
        return symbol.endswith(".BO")

    if market == "EURONEXT":
        return "." in symbol

    return True


def exchange_matches_market(exchange: str, market: str) -> bool:
    exchange = (exchange or "").upper()
    market = market.upper()
    allowed = EXCHANGE_ALIASES.get(market, {market})
    return exchange in allowed


def get_search_query(company_name: str) -> str:
    return QUERY_ALIASES.get(company_name, company_name)


def fetch_search_results(company_name: str) -> list[dict]:
    query = get_search_query(company_name)

    response = requests.get(
        API_URL,
        params={"query": query},
        timeout=10,
    )
    response.raise_for_status()

    payload = response.json()
    return payload.get("results", [])


def score_result(company_name: str, candidate: dict, market: str) -> int:
    score = 0

    candidate_name = candidate.get("name", "")
    candidate_symbol = candidate.get("symbol", "")
    candidate_exchange = candidate.get("exchange", "")

    requested_tokens = tokenize(company_name)
    candidate_tokens = tokenize(candidate_name)
    common_tokens = requested_tokens.intersection(candidate_tokens)

    score += len(common_tokens) * 20

    if normalize_text(company_name) == normalize_text(candidate_name):
        score += 120

    if requested_tokens and candidate_tokens:
        overlap_ratio = len(common_tokens) / max(len(requested_tokens), 1)
        score += int(overlap_ratio * 60)

    if exchange_matches_market(candidate_exchange, market):
        score += 50

    if symbol_matches_market(candidate_symbol, market):
        score += 35

    suffix = expected_symbol_suffix(market)
    if suffix and candidate_symbol.upper().endswith(suffix):
        score += 30

    normalized_company = normalize_text(company_name)
    normalized_candidate = normalize_text(candidate_name)

    if normalized_company in normalized_candidate or normalized_candidate in normalized_company:
        score += 25

    return score


def find_best_match(company_name: str, market: str, results: list[dict]) -> dict | None:
    filtered = []

    for candidate in results:
        candidate_exchange = candidate.get("exchange", "")
        candidate_symbol = candidate.get("symbol", "")
        candidate_name = candidate.get("name", "")

        if not exchange_matches_market(candidate_exchange, market):
            continue

        if not symbol_matches_market(candidate_symbol, market):
            continue

        requested_tokens = tokenize(company_name)
        candidate_tokens = tokenize(candidate_name)

        if requested_tokens and not requested_tokens.intersection(candidate_tokens):
            continue

        filtered.append(candidate)

    if not filtered:
        return None

    ranked = sorted(
        filtered,
        key=lambda candidate: score_result(company_name, candidate, market),
        reverse=True,
    )

    best = ranked[0]
    best_score = score_result(company_name, best, market)

    requested_tokens = tokenize(company_name)
    best_tokens = tokenize(best.get("name", ""))
    overlap = requested_tokens.intersection(best_tokens)

    if best_score < 80:
        return None

    if requested_tokens and len(overlap) == 0:
        return None

    return best


def get_market_value(row: dict) -> str:
    if "expected_market" in row and row["expected_market"]:
        return row["expected_market"].strip()

    if "stock_market" in row and row["stock_market"]:
        return row["stock_market"].strip()

    raise KeyError("CSV must contain 'expected_market' or 'stock_market'")


def main():
    rows_to_insert = []
    stock_id = 1

    with open(INPUT_FILE, "r", newline="", encoding="utf-8") as file:
        stocks = csv.DictReader(file)

        for stock in stocks:
            company_name = stock["stock_name"].strip()
            market = get_market_value(stock).upper()

            print(f"Checking: {company_name} [{market}]")

            try:
                results = fetch_search_results(company_name)
            except requests.RequestException as exc:
                print(f"Error while searching {company_name}: {exc}")
                print(f"Skipped: {company_name}")
                continue

            match = find_best_match(company_name, market, results)

            if not match:
                print(f"Skipped: {company_name} (no confident match for {market})")
                continue

            symbol = match["symbol"]
            matched_name = match.get("name", "")
            matched_exchange = match.get("exchange", "")

            rows_to_insert.append(
                f"({stock_id}, '{sql_escape(company_name)}', '{sql_escape(symbol)}', '{sql_escape(market)}')"
            )

            print(
                f"Added: {company_name} -> {symbol} "
                f"| exchange: {matched_exchange} "
                f"| matched with: {matched_name}"
            )

            stock_id += 1

    with open(OUTPUT_FILE, "w", encoding="utf-8") as sql_file:
        if rows_to_insert:
            sql_file.write("INSERT IGNORE INTO stocks\n")
            sql_file.write("(stock_id, stock_name, ticker, stock_market)\n")
            sql_file.write("VALUES\n")
            sql_file.write(",\n".join(rows_to_insert))
            sql_file.write(";\n")
        else:
            sql_file.write("-- No validated stocks found.\n")


if __name__ == "__main__":
    main()