import math
import random
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.entities import IotReading


LOCATIONS = [
    ("SEN-GANGA-01", "Riverfront North", 28.6139, 77.2090),
    ("SEN-YAMUNA-02", "Low Basin East", 28.5355, 77.3910),
    ("SEN-DELTA-03", "Delta Pump Station", 19.0760, 72.8777),
    ("SEN-COAST-04", "Coastal Ward 7", 13.0827, 80.2707),
]


def _signal(lat: float, lon: float) -> float:
    minute_wave = math.sin(datetime.utcnow().timestamp() / 180)
    geo_wave = math.sin(lat * 0.21) + math.cos(lon * 0.17)
    return minute_wave + geo_wave


def generate_iot_reading(db: Session, latitude: float, longitude: float, location_name: str) -> IotReading:
    base = _signal(latitude, longitude)
    rainfall = max(0, 34 + base * 18 + random.uniform(-6, 10))
    water_level = max(0.2, 2.4 + base * 0.9 + rainfall / 55 + random.uniform(-0.25, 0.25))
    flow_rate = max(0.1, 0.8 + water_level / 4 + random.uniform(-0.08, 0.15))
    reading = IotReading(
        sensor_id=f"IOT-{abs(hash((round(latitude, 3), round(longitude, 3)))) % 9999:04d}",
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        water_level_m=round(water_level, 2),
        rainfall_mm=round(rainfall, 1),
        flow_rate_mps=round(flow_rate, 2),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def latest_network_readings(db: Session) -> list[IotReading]:
    readings = [
        generate_iot_reading(db, lat, lon, name)
        for _sensor, name, lat, lon in LOCATIONS
    ]
    return readings

