from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class IotReading(Base):
    """Fallback database table for old river location telemetry."""
    __tablename__ = "iot_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sensor_id: Mapped[str] = mapped_column(String(80), index=True)
    location_name: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    water_level_m: Mapped[float] = mapped_column(Float)
    rainfall_mm: Mapped[float] = mapped_column(Float)
    flow_rate_mps: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class SensorReading(Base):
    """Primary database table for ESP32 hardware node telemetry."""
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sensor_id: Mapped[str] = mapped_column(String(80), index=True)
    location_name: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    water_level_cm: Mapped[float] = mapped_column(Float)
    flow_rate_lpm: Mapped[float] = mapped_column(Float)
    temperature_c: Mapped[float] = mapped_column(Float, default=25.0)
    humidity_pct: Mapped[float] = mapped_column(Float, default=60.0)
    rain_status: Mapped[str] = mapped_column(String(80), default="No Rain")
    rain_value: Mapped[int] = mapped_column(Integer, default=4095)
    flood_status: Mapped[str] = mapped_column(String(80), index=True)
    sms_status: Mapped[str] = mapped_column(String(80), index=True)
    alert_active: Mapped[int] = mapped_column(Integer, default=0)
    alert_message: Mapped[str] = mapped_column(String(240), default="Normal")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class PredictionRecord(Base):
    """Database records for AI model historical predictions."""
    __tablename__ = "prediction_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(40), index=True)
    location_name: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    water_level_m: Mapped[float] = mapped_column(Float)
    affected_area_sq_km: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(40), index=True)
    previous_max_risk: Mapped[float] = mapped_column(Float, default=0)
    worse_than_previous: Mapped[str] = mapped_column(String(8), default="No")
    interpretation: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Visitor(Base):
    """Database records for newsletter/alert registration signup."""
    __tablename__ = "visitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(180), index=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class LocationAccess(Base):
    """Logging dashboard access and report generation queries."""
    __tablename__ = "location_accesses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    visitor_id: Mapped[int] = mapped_column(Integer, index=True)
    email: Mapped[str] = mapped_column(String(180), index=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    state: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    risk_status: Mapped[str] = mapped_column(String(80), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
