import asyncio
import logging
import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import httpx
import pandas as pd
import yfinance as yf

from app.exceptions import YahooDataUnavailable, SymbolNotFound
from app.models.requests import MarketHistoryRequest
from app.models.responses import MarketHistoryResponse, CandleData, QuoteResponse, SearchResponse, SearchResultItem
from app.utils.validators import SYMBOL_REGEX, validate_interval_supported

logger = logging.getLogger("market_data_server.yahoo_service")

class YahooService:
    """Service layer for fetching and processing market data from Yahoo Finance."""

    def __init__(self, max_retries: int = 3, backoff_factor: float = 0.5):
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    def _download_sync(
        self,
        symbol: str,
        start_str: str,
        end_str: str,
        interval: str,
        adjusted: bool
    ) -> pd.DataFrame:
        """Synchronous wrapper around yfinance download."""
        df = yf.download(
            tickers=symbol,
            start=start_str,
            end=end_str,
            interval=interval,
            auto_adjust=adjusted,
            progress=False,
            threads=False,
        )
        return df

    def _download_by_period_sync(
        self,
        symbol: str,
        period: str,
        interval: str,
        adjusted: bool
    ) -> pd.DataFrame:
        """Synchronous wrapper around yfinance download using period."""
        df = yf.download(
            tickers=symbol,
            period=period,
            interval=interval,
            auto_adjust=adjusted,
            progress=False,
            threads=False,
        )
        return df

    async def fetch_history(self, req: MarketHistoryRequest) -> MarketHistoryResponse:
        """
        Fetch historical stock market data with retry logic and data normalization.

        :param req: MarketHistoryRequest containing validated query parameters.
        :return: MarketHistoryResponse populated with candles and metadata.
        """
        start_str = req.start.strftime("%Y-%m-%d") if req.interval in {"1d", "5d", "1wk", "1mo", "3mo"} else req.start.isoformat()
        end_str = req.end.strftime("%Y-%m-%d") if req.interval in {"1d", "5d", "1wk", "1mo", "3mo"} else req.end.isoformat()

        df: Optional[pd.DataFrame] = None
        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(
                    f"Fetching yfinance data for symbol={req.symbol}, interval={req.interval}, "
                    f"attempt={attempt}/{self.max_retries}"
                )
                df = await asyncio.to_thread(
                    self._download_sync,
                    req.symbol,
                    start_str,
                    end_str,
                    req.interval,
                    req.adjusted
                )
                
                if df is not None and not df.empty:
                    break
            except Exception as exc:
                last_error = exc
                logger.warning(
                    f"Attempt {attempt} failed for symbol={req.symbol}, interval={req.interval}: {exc}"
                )

            if attempt < self.max_retries:
                sleep_time = self.backoff_factor * (2 ** (attempt - 1))
                await asyncio.sleep(sleep_time)

        if df is None or df.empty:
            msg = f"No historical market data found for symbol '{req.symbol}' between {req.start} and {req.end}"
            logger.warning(msg)
            if last_error:
                raise YahooDataUnavailable(f"{msg}. Details: {str(last_error)}")
            raise YahooDataUnavailable(msg)

        # Normalize MultiIndex columns if present
        if isinstance(df.columns, pd.MultiIndex):
            if req.symbol in df.columns.levels[1]:
                df = df.xs(req.symbol, level=1, axis=1)
            else:
                df.columns = df.columns.get_level_values(0)

        # Verify required columns exist
        required_cols = {"Open", "High", "Low", "Close", "Volume"}
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            col_map = {col.lower(): col for col in df.columns}
            if all(rc.lower() in col_map for rc in required_cols):
                df = df.rename(columns={col_map[rc.lower()]: rc for rc in required_cols})
            else:
                raise YahooDataUnavailable(f"Market data DataFrame is missing expected OHLCV columns for '{req.symbol}'")

        # Clean NaN rows and sort ascending
        df = df.dropna(subset=["Open", "High", "Low", "Close", "Volume"])
        df = df.sort_index(ascending=True)

        if df.empty:
            raise YahooDataUnavailable(f"No valid non-NaN market data available for symbol '{req.symbol}'")

        # Extract Timezone info
        tz_name = "America/New_York"
        if hasattr(df.index, "tz") and df.index.tz is not None:
            tz_name = str(df.index.tz)

        candles: List[CandleData] = []
        for idx, row in df.iterrows():
            if isinstance(idx, pd.Timestamp):
                if idx.tz is None:
                    ts_str = idx.tz_localize("UTC").isoformat()
                else:
                    ts_str = idx.isoformat()
            else:
                ts_str = str(idx)

            candle = CandleData(
                timestamp=ts_str,
                open=round(float(row["Open"]), 4),
                high=round(float(row["High"]), 4),
                low=round(float(row["Low"]), 4),
                close=round(float(row["Close"]), 4),
                volume=int(row["Volume"]),
            )
            candles.append(candle)

        return MarketHistoryResponse(
            symbol=req.symbol,
            interval=req.interval,
            timezone=tz_name,
            start=req.start.isoformat(),
            end=req.end.isoformat(),
            count=len(candles),
            data=candles,
        )

    async def fetch_latest_quote(self, symbol: str) -> QuoteResponse:
        """Fetch the latest price quote and summary metrics for a given symbol."""
        symbol = symbol.strip().upper()
        if not re.match(SYMBOL_REGEX, symbol):
            raise ValueError(f"Invalid symbol format: '{symbol}'")

        df = await asyncio.to_thread(self._download_by_period_sync, symbol, "5d", "1d", True)

        if df is None or df.empty:
            raise SymbolNotFound(symbol)

        # Normalize MultiIndex columns if present
        if isinstance(df.columns, pd.MultiIndex):
            if symbol in df.columns.levels[1]:
                df = df.xs(symbol, level=1, axis=1)
            else:
                df.columns = df.columns.get_level_values(0)

        df = df.dropna(subset=["Open", "High", "Low", "Close", "Volume"])
        df = df.sort_index(ascending=True)

        if df.empty:
            raise SymbolNotFound(symbol)

        latest_row = df.iloc[-1]
        latest_ts = latest_row.name.isoformat() if isinstance(latest_row.name, pd.Timestamp) else str(latest_row.name)

        price = round(float(latest_row["Close"]), 4)
        open_price = round(float(latest_row["Open"]), 4)
        high_price = round(float(latest_row["High"]), 4)
        low_price = round(float(latest_row["Low"]), 4)
        volume = int(latest_row["Volume"])

        prev_close = round(float(df.iloc[-2]["Close"]), 4) if len(df) >= 2 else None
        change = round(price - prev_close, 4) if prev_close else None
        pct_change = round(((price - prev_close) / prev_close) * 100, 2) if prev_close and prev_close != 0 else None

        return QuoteResponse(
            symbol=symbol,
            price=price,
            currency="USD",
            timestamp=latest_ts,
            open=open_price,
            high=high_price,
            low=low_price,
            previous_close=prev_close,
            change=change,
            percent_change=pct_change,
            volume=volume,
        )

    async def fetch_recent_history(
        self,
        symbol: str,
        interval: str = "5m",
        days: Optional[int] = None
    ) -> MarketHistoryResponse:
        """Convenience method to fetch recent history using period to avoid weekend empty data issues."""
        validate_interval_supported(interval)
        symbol = symbol.strip().upper()
        if not re.match(SYMBOL_REGEX, symbol):
            raise ValueError(f"Invalid symbol format: '{symbol}'")

        # Map requested days to yfinance supported periods
        if days is None or days <= 0:
            if interval in {"1m"}:
                period = "1d"
            elif interval in {"2m", "5m", "15m", "30m", "90m"}:
                period = "5d"
            else:
                period = "1mo"
        else:
            if days <= 1:
                period = "1d"
            elif days <= 5:
                period = "5d"
            elif days <= 30:
                period = "1mo"
            elif days <= 90:
                period = "3mo"
            elif days <= 180:
                period = "6mo"
            elif days <= 365:
                period = "1y"
            else:
                period = "max"

        # List of periods to try in case of empty data (e.g. weekend/holidays)
        periods_to_try = [period]
        if period == "1d":
            periods_to_try.append("5d")  # Try 5d if 1d has no data (weekend)
        elif period == "5d":
            periods_to_try.append("1mo")

        df = None
        last_error = None

        for current_period in periods_to_try:
            for attempt in range(1, self.max_retries + 1):
                try:
                    logger.info(
                        f"Fetching recent data for symbol={symbol}, interval={interval}, "
                        f"period={current_period}, attempt={attempt}/{self.max_retries}"
                    )
                    df = await asyncio.to_thread(
                        self._download_by_period_sync,
                        symbol,
                        current_period,
                        interval,
                        True
                    )
                    if df is not None and not df.empty:
                        break
                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        f"Attempt {attempt} failed for recent symbol={symbol}, interval={interval}: {exc}"
                    )

                if attempt < self.max_retries:
                    sleep_time = self.backoff_factor * (2 ** (attempt - 1))
                    await asyncio.sleep(sleep_time)

            if df is not None and not df.empty:
                break

        if df is None or df.empty:
            msg = f"No recent market data found for symbol '{symbol}' using interval {interval}"
            logger.warning(msg)
            if last_error:
                raise YahooDataUnavailable(f"{msg}. Details: {str(last_error)}")
            raise YahooDataUnavailable(msg)

        # Normalize MultiIndex columns if present
        if isinstance(df.columns, pd.MultiIndex):
            if symbol in df.columns.levels[1]:
                df = df.xs(symbol, level=1, axis=1)
            else:
                df.columns = df.columns.get_level_values(0)

        # Verify required columns exist
        required_cols = {"Open", "High", "Low", "Close", "Volume"}
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            col_map = {col.lower(): col for col in df.columns}
            if all(rc.lower() in col_map for rc in required_cols):
                df = df.rename(columns={col_map[rc.lower()]: rc for rc in required_cols})
            else:
                raise YahooDataUnavailable(f"Market data DataFrame is missing expected OHLCV columns for '{symbol}'")

        # Clean NaN rows and sort ascending
        df = df.dropna(subset=["Open", "High", "Low", "Close", "Volume"])
        df = df.sort_index(ascending=True)

        if df.empty:
            raise YahooDataUnavailable(f"No valid non-NaN market data available for symbol '{symbol}'")

        # Extract Timezone info
        tz_name = "America/New_York"
        if hasattr(df.index, "tz") and df.index.tz is not None:
            tz_name = str(df.index.tz)

        candles: List[CandleData] = []
        for idx, row in df.iterrows():
            if isinstance(idx, pd.Timestamp):
                if idx.tz is None:
                    ts_str = idx.tz_localize("UTC").isoformat()
                else:
                    ts_str = idx.isoformat()
            else:
                ts_str = str(idx)

            candle = CandleData(
                timestamp=ts_str,
                open=round(float(row["Open"]), 4),
                high=round(float(row["High"]), 4),
                low=round(float(row["Low"]), 4),
                close=round(float(row["Close"]), 4),
                volume=int(row["Volume"]),
            )
            candles.append(candle)

        first_ts = candles[0].timestamp if candles else ""
        last_ts = candles[-1].timestamp if candles else ""

        return MarketHistoryResponse(
            symbol=symbol,
            interval=interval,
            timezone=tz_name,
            start=first_ts,
            end=last_ts,
            count=len(candles),
            data=candles,
        )

    async def search_symbols(self, query: str) -> SearchResponse:
        """Search for ticker symbols and company names matching the query string."""
        query = query.strip()
        if not query:
            # Curated popular symbols list
            popular = [
                {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "AMZN", "name": "Amazon.com, Inc.", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "TSLA", "name": "Tesla, Inc.", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "type": "Equity", "exchange_display": "NASDAQ"},
                {"symbol": "BTC-USD", "name": "Bitcoin USD", "exchange": "CCC", "type": "Cryptocurrency", "exchange_display": "CoinMarketCap"},
                {"symbol": "^GSPC", "name": "S&P 500 Index", "exchange": "GSPC", "type": "Index", "exchange_display": "Chicago Board Options Exchange"},
            ]
            results = [SearchResultItem(**item) for item in popular]
            return SearchResponse(query=query, count=len(results), results=results)

        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10&newsCount=0"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10.0)
                response.raise_for_status()
                data = response.json()
            except Exception as exc:
                logger.error(f"Failed to query Yahoo Finance search API: {exc}")
                raise YahooDataUnavailable(f"Search index currently unavailable: {str(exc)}")

        results = []
        quotes = data.get("quotes", [])
        for q in quotes:
            symbol = q.get("symbol")
            if not symbol:
                continue
            name = q.get("longname") or q.get("shortname") or symbol
            exchange = q.get("exchange")
            asset_type = q.get("typeDisp") or q.get("quoteType")
            exchange_display = q.get("exchDisp")

            results.append(
                SearchResultItem(
                    symbol=symbol,
                    name=name,
                    exchange=exchange,
                    type=asset_type,
                    exchange_display=exchange_display,
                )
            )

        return SearchResponse(query=query, count=len(results), results=results)
