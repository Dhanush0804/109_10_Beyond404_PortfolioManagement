from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test that GET /api/v1/health returns 200 OK and expected JSON structure."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "yahoo-market-data"
    assert data["version"] == "1.0.0"
    assert "timestamp" in data
    assert len(data["timestamp"]) > 0
