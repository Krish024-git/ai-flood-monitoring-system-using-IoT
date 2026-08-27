import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.ai_prediction_service import ai_prediction_service

client = TestClient(app)


def test_public_telemetry_get():
    """Verify default sensor-data endpoint structure."""
    response = client.get("/sensor-data")
    assert response.status_code == 200
    payload = response.json()
    assert "latest" in payload
    assert "history" in payload


def test_auth_failure():
    """Verify login validation with incorrect password."""
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrong-password"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_auth_success():
    """Verify successful token generation."""
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "Flood@123"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert payload["token_type"] == "bearer"


def test_sensor_ingestion_validation():
    """Verify validation constraints on sensor posting."""
    # Sending missing required fields
    response = client.post(
        "/update-data",
        json={
            "sensor_id": "esp32-node",
            "water_level_cm": -5.0,  # invalid negative water level
        },
    )
    assert response.status_code == 422  # validation error


def test_sensor_ingestion_success():
    """Verify successful ingestion and on-node prediction responses."""
    response = client.post(
        "/update-data",
        json={
            "sensor_id": "esp32-floodnode-01",
            "location_name": "Ganga Basin Test Node",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "water_level_cm": 150.0,
            "flow_rate_lpm": 80.0,
            "temperature_c": 32.5,
            "humidity_pct": 75.0,
            "rain_status": "Moderate Rain",
            "rain_value": 1800,
            "sms_status": "Standby",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert "flood_status" in payload
    assert "risk_score" in payload
    assert "lcd_line1" in payload
    assert "lcd_line2" in payload
    assert "buzzer_active" in payload


def test_ai_prediction_model():
    """Verify consistency of AI model inference values."""
    prediction = ai_prediction_service.predict(
        water_level_cm=190.0,
        flow_rate_lpm=110.0,
        rainfall_mm=75.0,
        temperature=28.0,
        humidity=90.0,
    )
    assert "risk_score" in prediction
    assert "severity" in prediction
    assert "interpretation" in prediction
    # High metrics should elevate status
    assert prediction["severity"] in ["Danger", "Critical"]
