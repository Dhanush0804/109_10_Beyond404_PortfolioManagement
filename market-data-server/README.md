# Production-Ready FastAPI Yahoo Finance Market Data Server

A production-grade, asynchronous Python microservice built with **FastAPI**, **Pydantic v2**, and **yfinance** for serving historical stock market OHLCV candle data, real-time price quotes, and symbol search autocompletions over RESTful APIs.

---

## Features

- **Asynchronous & Non-Blocking**: Built on FastAPI and Uvicorn with async thread pools.
- **Strict Parameter Validation**: Powered by Pydantic v2 with custom validators for symbol formatting, timezone-awareness, date ordering, and future cutoff limits.
- **Server-Side Range Protection**: Enforces Yahoo Finance historical data window constraints *before* issuing external requests.
- **Ticker Symbol Lookup / Search**:
  - `GET /api/v1/market/search`: Real-time stock, index, ETF, and crypto ticker autocompletion for frontends. Returns full company name, exchange, ticker code, and asset type.
- **Convenient Recent & Quote Endpoints**:
  - `GET /api/v1/market/quote`: Instant latest price, open, high, low, previous close, change, and percentage change.
  - `GET /api/v1/market/recent`: Fetch recent candles (e.g. `5m`, `1d`) automatically calculated back from current time with weekend/holiday fallback protection.
- **Resilient Service Layer**: Implements retry logic with exponential backoff for handling temporary upstream network failures.
- **Structured Error Handling**: Custom exception hierarchy returning standard JSON error responses.
- **Structured Logging**: Comprehensive HTTP request tracking with execution timing and failure logging.
- **100% Test Coverage**: Fully unit tested using `pytest` and `TestClient` with zero live internet dependencies.

---

## Supported Intervals & Range Limits

| Interval Code | Description | Maximum Allowed Range |
| :--- | :--- | :--- |
| `1m` | 1 Minute | 7 Days |
| `2m` | 2 Minutes | 60 Days |
| `5m` | 5 Minutes | 60 Days |
| `15m` | 15 Minutes | 60 Days |
| `30m` | 30 Minutes | 60 Days |
| `60m` | 60 Minutes (1 Hour) | 730 Days |
| `90m` | 90 Minutes | 60 Days |
| `1d` | 1 Day | Unlimited (Years of history) |
| `5d` | 5 Days | Unlimited |
| `1wk` | 1 Week | Unlimited |
| `1mo` | 1 Month | Unlimited |
| `3mo` | 3 Months | Unlimited |

---

## Project Structure

```text
market-data-server/
│
├── app/
│   ├── main.py                # FastAPI application entry point & middleware
│   ├── config.py              # Application settings & environment config
│   ├── dependencies.py        # Dependency injection rules
│   ├── routers/
│   │   ├── health.py          # GET /api/v1/health endpoint
│   │   └── market.py          # GET /api/v1/market/history, /quote, /recent, /search
│   ├── services/
│   │   └── yahoo_service.py   # yfinance data fetcher & normalization engine
│   ├── models/
│   │   ├── requests.py        # Request parameter validation schemas
│   │   └── responses.py       # Response DTO models
│   ├── utils/
│   │   ├── validators.py      # Interval & symbol validation utilities
│   │   └── time_utils.py      # Timezone & date handling utilities
│   └── exceptions.py          # Custom domain exceptions & global exception handlers
│
├── tests/
│   ├── test_health.py            # Health check tests
│   ├── test_market_validation.py # Request parameter validation tests
│   └── test_market_endpoints.py  # Mocked yfinance endpoint integration tests
│
├── requirements.txt           # Python dependencies
├── README.md                  # System documentation
├── .env.example               # Environment variables template
└── pyproject.toml             # Project build & test configuration
```

---

## Running the Server

```bash
cd market-data-server
python -m app.main
```

Or with `uvicorn`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Documentation URLs:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Documentation & Examples

### Base URL

`/api/v1`

---

### 1. Ticker Symbol Search & Autocomplete (for Frontend)

#### `GET /api/v1/market/search?query=Apple`

Queries Yahoo Finance's global search suggestion database. Returns matching stocks, indices, cryptos, and ETFs.

*Note: Calling with an empty `query` parameter returns a default curated list of popular market assets (e.g. AAPL, MSFT, TSLA, BTC-USD).*

**cURL Example:**
```bash
curl "http://localhost:8000/api/v1/market/search?query=Apple"
```

**Response `(200 OK)`:**
```json
{
  "query": "Apple",
  "count": 5,
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NMS",
      "type": "Equity",
      "exchange_display": "NASDAQ"
    },
    {
      "symbol": "APLE",
      "name": "Apple Hospitality REIT, Inc.",
      "exchange": "NYQ",
      "type": "Equity",
      "exchange_display": "NYSE"
    }
  ]
}
```

---

### 2. Latest Stock Quote Endpoint

#### `GET /api/v1/market/quote?symbol=AAPL`

Returns the latest price and daily price metrics.

**cURL Example:**
```bash
curl "http://localhost:8000/api/v1/market/quote?symbol=AAPL"
```

**Response `(200 OK)`:**
```json
{
  "symbol": "AAPL",
  "price": 224.23,
  "currency": "USD",
  "timestamp": "2026-08-01T20:00:00-04:00",
  "open": 222.15,
  "high": 225.10,
  "low": 221.80,
  "previous_close": 221.20,
  "change": 3.03,
  "percent_change": 1.37,
  "volume": 48291000
}
```

---

### 3. Simple Recent History Endpoint (No ISO Date Strings Required)

#### `GET /api/v1/market/recent?symbol=AAPL&interval=5m&days=1`

Fetches recent candles ending at the current time. Incorporates weekend fallback protection.

**cURL Examples:**

```bash
# Get 5m candles for the past 1 day (default: 3 days)
curl "http://localhost:8000/api/v1/market/recent?symbol=AAPL&interval=5m&days=1"

# Get 1d candles for the past 30 days
curl "http://localhost:8000/api/v1/market/recent?symbol=BTC-USD&interval=1d&days=30"
```

---

### 4. Custom Date Range History Endpoint

#### `GET /api/v1/market/history?symbol=AAPL&interval=5m&start=2026-07-30T09:30:00-04:00&end=2026-07-30T16:00:00-04:00`

**cURL Example:**
```bash
curl "http://localhost:8000/api/v1/market/history?symbol=AAPL&interval=5m&start=2026-07-30T09:30:00-04:00&end=2026-07-30T16:00:00-04:00"
```

---

### 5. Health Check Endpoint

#### `GET /api/v1/health`

```json
{
  "status": "ok",
  "service": "yahoo-market-data",
  "version": "1.0.0",
  "timestamp": "2026-08-02T10:00:00Z"
}
```

---

## Running Tests

```bash
pytest -v
```
