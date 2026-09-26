# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "problem_statement_id" in data
    assert data["problem_statement_id"] == "26137"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_graph_samples_endpoint():
    response = client.get("/api/graph/samples")
    assert response.status_code == 200
    data = response.json()
    assert "cities" in data
    assert len(data["cities"]) > 0

def test_dynamic_traffic_profile_endpoint():
    response = client.get("/api/graph/traffic-profile?hour=8.5")
    assert response.status_code == 200
    data = response.json()
    assert "congestion_factor_theta" in data
    assert "full_24h_curve" in data

def test_optimize_run_api():
    payload = {
        "start_location": {"name": "Depot", "coords": [28.6139, 77.2090]},
        "stops": [
            {"name": "Stop 1", "coords": [28.6200, 77.2150], "demand": 2.0},
            {"name": "Stop 2", "coords": [28.6300, 77.2250], "demand": 1.5}
        ],
        "algorithm": "QPSO",
        "num_vehicles": 1,
        "traffic_enabled": True
    }
    response = client.post("/api/optimize/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "routes_geometry" in data
    assert "total_distance_km" in data
