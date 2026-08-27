from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: str = "Current Location"


class IotReadingOut(BaseModel):
    sensor_id: str
    location_name: str
    latitude: float
    longitude: float
    water_level_m: float
    rainfall_mm: float
    flow_rate_mps: float
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionOut(BaseModel):
    id: int
    source: str
    location_name: str
    latitude: float
    longitude: float
    water_level_m: float
    affected_area_sq_km: float
    risk_score: float
    severity: str
    previous_max_risk: float
    worse_than_previous: str
    interpretation: str
    created_at: datetime

    model_config = {"from_attributes": True}


class VisitorCreate(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str = Field(..., min_length=7, max_length=20)


class VisitorOut(BaseModel):
    id: int
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AreaReportRequest(BaseModel):
    visitor_id: int
    state: str
    city: str


class LiveLocationReportRequest(BaseModel):
    visitor_id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class SensorUpdateRequest(BaseModel):
    sensor_id: str = "esp32-floodnode-01"
    location_name: str = "Ganga Basin Node 1"
    latitude: float = Field(28.6139, ge=-90, le=90)
    longitude: float = Field(77.2090, ge=-180, le=180)
    water_level_cm: float = Field(..., ge=0)
    flow_rate_lpm: float = Field(..., ge=0)
    temperature_c: float = Field(25.0, ge=-40, le=85)
    humidity_pct: float = Field(60.0, ge=0, le=100)
    rain_status: str = "No Rain"
    rain_value: int = Field(4095, ge=0, le=4095)
    sms_status: str = "Standby"
    message: Optional[str] = None


class SensorHistoryItem(BaseModel):
    id: int
    sensor_id: str
    location_name: str
    latitude: float
    longitude: float
    water_level_cm: float
    flow_rate_lpm: float
    temperature_c: float
    humidity_pct: float
    rain_status: str
    rain_value: int
    flood_status: str
    sms_status: str
    alert_active: int
    alert_message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SensorDataResponse(BaseModel):
    latest: Optional[SensorHistoryItem] = None
    history: list[SensorHistoryItem] = []


# Auth Schemas
class UserLogin(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    username: str
