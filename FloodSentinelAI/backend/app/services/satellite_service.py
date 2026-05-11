from io import BytesIO

import numpy as np
from PIL import Image
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.entities import PredictionRecord
from app.services.neural_network import LightweightFloodNetwork
from app.services.prediction_service import severity_from_score


def analyze_satellite_image(
    db: Session,
    image_bytes: bytes,
    latitude: float,
    longitude: float,
    location_name: str,
) -> PredictionRecord:
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((384, 384))
    pixels = np.asarray(image).astype(np.float32)
    red = pixels[:, :, 0]
    green = pixels[:, :, 1]
    blue = pixels[:, :, 2]

    water_mask = (blue > red * 1.12) & (blue > green * 0.92) & (blue > 70)
    shadow_flood_mask = (blue > 45) & (green > 45) & (red < 95) & (blue >= red)
    combined = water_mask | shadow_flood_mask

    water_ratio = float(combined.mean())
    blue_dominance = float(np.clip(((blue - red).mean() + 255) / 510, 0, 1))
    texture_signal = float(np.clip(pixels.std() / 100, 0, 1))
    neural_score = LightweightFloodNetwork().score(water_ratio, texture_signal, blue_dominance)
    affected_area = max(0.05, water_ratio * 58)
    estimated_water_level = min(8.5, 0.8 + water_ratio * 8.8)
    risk_score = min(100, 18 + water_ratio * 58 + neural_score * 42 + estimated_water_level * 4)
    severity = severity_from_score(risk_score)

    previous_max = (
        db.query(func.max(PredictionRecord.risk_score))
        .filter(PredictionRecord.location_name == location_name)
        .scalar()
        or 0
    )
    worse = "Yes" if risk_score > previous_max else "No"
    interpretation = (
        f"Satellite analysis found {water_ratio * 100:.1f}% likely water coverage. "
        f"The neural flood score is {neural_score * 100:.1f}. "
        f"The model estimates {affected_area:.2f} sq km affected area and "
        f"{estimated_water_level:.2f} m equivalent water level."
    )

    record = PredictionRecord(
        source="Satellite ML",
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        water_level_m=round(estimated_water_level, 2),
        affected_area_sq_km=round(affected_area, 2),
        risk_score=round(risk_score, 2),
        severity=severity,
        previous_max_risk=round(previous_max, 2),
        worse_than_previous=worse,
        interpretation=interpretation,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
