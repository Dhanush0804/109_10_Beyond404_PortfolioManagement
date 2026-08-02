from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_invalid_interval():
    """Test that unsupported interval returns 422 Unprocessable Entity."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "10m",  # Unsupported interval
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-02T16:00:00-04:00",
        },
    )
    assert response.status_code == 422

def test_start_after_end():
    """Test that start datetime after end datetime returns 422 Unprocessable Entity."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "5m",
            "start": "2026-07-10T16:00:00-04:00",
            "end": "2026-07-01T09:30:00-04:00",
        },
    )
    assert response.status_code == 422

def test_naive_datetime():
    """Test that naive datetime without timezone offset returns 422 Unprocessable Entity."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "5m",
            "start": "2026-07-01T09:30:00",  # Naive datetime
            "end": "2026-07-02T16:00:00",    # Naive datetime
        },
    )
    assert response.status_code == 422

def test_future_end_time():
    """Test that end time in future by more than 5 minutes returns 422 Unprocessable Entity."""
    future_start = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    future_end = (datetime.now(timezone.utc) + timedelta(days=11)).isoformat()

    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "5m",
            "start": future_start,
            "end": future_end,
        },
    )
    assert response.status_code == 422

def test_1m_range_exceeded():
    """Test that 1m interval requesting > 7 days returns 400 Bad Request with range_exceeded."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "1m",
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-12T16:00:00-04:00",  # 11 days (exceeds 7 days limit)
        },
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "range_exceeded"
    assert data["max_days"] == 7
    assert "Interval 1m supports a maximum of 7 days" in data["message"]

def test_5m_range_exceeded():
    """Test that 5m interval requesting > 60 days returns 400 Bad Request with range_exceeded."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "AAPL",
            "interval": "5m",
            "start": "2026-01-01T09:30:00-04:00",
            "end": "2026-05-01T16:00:00-04:00",  # ~120 days (exceeds 60 days limit)
        },
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error"] == "range_exceeded"
    assert data["max_days"] == 60
    assert "Interval 5m supports a maximum of 60 days" in data["message"]

def test_invalid_symbol_format():
    """Test that symbol failing regex regex validation returns 422 Unprocessable Entity."""
    response = client.get(
        "/api/v1/market/history",
        params={
            "symbol": "INVALID_SYMBOL_TOO_LONG_123456",
            "interval": "5m",
            "start": "2026-07-01T09:30:00-04:00",
            "end": "2026-07-02T16:00:00-04:00",
        },
    )
    assert response.status_code == 422
