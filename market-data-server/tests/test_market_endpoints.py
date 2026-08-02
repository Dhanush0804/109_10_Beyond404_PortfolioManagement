from unittest.mock import patch
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_mock_dataframe() -> pd.DataFrame:
    """Helper to generate a mock yfinance pandas DataFrame with OHLCV data."""
    dates = pd.date_range(
        start="2026-07-01 09:30:00-04:00",
        periods=3,
        freq="5min"
    )
    df = pd.DataFrame(
        {
            "Open": [214.51, 214.75, 214.60],
            "High": [214.80, 214.90, 214.85],
            "Low": [214.22, 214.50, 214.40],
            "Close": [214.73, 214.65, 214.78],
            "Volume": [523441, 412300, 398100],
        },
        index=dates,
    )
    return df

@patch("yfinance.download")
def test_valid_5m_market_history(mock_download):
    """Test successful 5m historical data retrieval with mocked yfinance."""
    mock_download.return_value = create_mock_dataframe()

    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "5m",
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-01T10:00:00-04:00",
            "adjusted": "true",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "AAPL"
    assert data["interval"] == "5m"
    assert data["count"] == 3
    assert len(data["data"]) == 3

    first_candle = data["data"][0]
    assert "timestamp" in first_candle
    assert first_candle["open"] == 214.51
    assert first_candle["high"] == 214.80
    assert first_candle["low"] == 214.22
    assert first_candle["close"] == 214.73
    assert first_candle["volume"] == 523441
    assert "2026-07-01" in first_candle["timestamp"]

@patch("yfinance.download")
def test_empty_dataframe_returns_404(mock_download):
    """Test that empty yfinance DataFrame results in 404 Not Found."""
    mock_download.return_value = pd.DataFrame()

    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "INVALID",
            "interval": "1d",
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-02T16:00:00-04:00",
        },
    )

    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "No historical market data found" in data["detail"]

@patch("yfinance.download")
def test_symbol_case_insensitivity(mock_download):
    """Test that symbol query param is automatically uppercased."""
    mock_download.return_value = create_mock_dataframe()

    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "aapl",  # lowercase input
            "interval": "5m",
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-01T10:00:00-04:00",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"

@patch("yfinance.download")
def test_latest_quote_endpoint(mock_download):
    """Test GET /api/v1/market/quote returns latest price and quote fields."""
    mock_download.return_value = create_mock_dataframe()

    response = client.get("/api/v1/market/quote", params={"symbol": "AAPL"})
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "AAPL"
    assert data["price"] == 214.78
    assert data["open"] == 214.60
    assert data["high"] == 214.85
    assert data["low"] == 214.40
    assert data["previous_close"] == 214.65
    assert data["change"] == 0.13
    assert data["percent_change"] == 0.06
    assert data["volume"] == 398100

@patch("yfinance.download")
async def test_recent_history_endpoint(mock_download):
    """Test GET /api/v1/market/recent returns recent candles relative to current time."""
    mock_download.return_value = create_mock_dataframe()

    response = client.get("/api/v1/market/recent", params={"symbol": "AAPL", "interval": "5m", "days": 1})
    assert response.status_code == 200
    data = response.json()

    assert data["symbol"] == "AAPL"
    assert data["interval"] == "5m"
    assert data["count"] == 3

def test_search_endpoint_popular():
    """Test GET /api/v1/market/search with empty query returns popular tickers list."""
    response = client.get("/api/v1/market/search", params={"query": ""})
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == ""
    assert data["count"] > 0
    assert data["results"][0]["symbol"] == "AAPL"

@patch("httpx.AsyncClient.get")
def test_search_endpoint_query(mock_get):
    """Test GET /api/v1/market/search with query fetches and returns matches."""
    # Mock Response
    class MockResponse:
        def __init__(self, json_data, status_code=200):
            self.json_data = json_data
            self.status_code = status_code
        def raise_for_status(self):
            pass
        def json(self):
            return self.json_data

    mock_get.return_value = MockResponse({
        "quotes": [
            {
                "symbol": "AAPL",
                "shortname": "Apple Inc.",
                "exchange": "NMS",
                "typeDisp": "Equity",
                "exchDisp": "NASDAQ"
            }
        ]
    })

    response = client.get("/api/v1/market/search", params={"query": "Apple"})
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "Apple"
    assert data["count"] == 1
    assert data["results"][0]["symbol"] == "AAPL"
    assert data["results"][0]["name"] == "Apple Inc."
    assert data["results"][0]["exchange"] == "NMS"
    assert data["results"][0]["type"] == "Equity"
    assert data["results"][0]["exchange_display"] == "NASDAQ"
