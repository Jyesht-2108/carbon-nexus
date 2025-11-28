import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_ingest_event():
    """Test single event ingestion"""
    event = {
        "timestamp": "2025-11-28T12:00:00Z",
        "supplier_id": "S-TEST-1",
        "event_type": "logistics",
        "distance_km": 120,
        "load_kg": 450,
        "vehicle_type": "truck",
        "fuel_type": "diesel"
    }
    
    response = client.post("/api/v1/ingest/event", json=event)
    assert response.status_code == 200
    assert response.json()["status"] == "stored"


def test_ingest_event_missing_fields():
    """Test validation with missing required fields"""
    event = {
        "distance_km": 120
    }
    
    response = client.post("/api/v1/ingest/event", json=event)
    assert response.status_code == 400
    assert "errors" in response.json()["detail"]


def test_data_quality_endpoint():
    """Test data quality metrics endpoint"""
    response = client.get("/api/v1/data-quality/S-TEST-1")
    assert response.status_code == 200
    assert "completeness_pct" in response.json()
