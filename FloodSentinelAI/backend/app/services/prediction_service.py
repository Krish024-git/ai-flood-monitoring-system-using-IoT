from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.entities import IotReading, PredictionRecord


def severity_from_score(score: float) -> str:
    if score >= 82:
        return "Extreme"
    if score >= 64:
        return "High"
    if score >= 42:
        return "Moderate"
    return "Guarded"


def create_prediction_from_iot(db: Session, reading: IotReading, source: str = "IoT") -> PredictionRecord:
    risk_score = min(
        100,
        reading.water_level_m * 14 + reading.rainfall_mm * 0.55 + reading.flow_rate_mps * 9,
    )
    affected_area = max(0.1, (risk_score / 100) ** 2 * 42)
    previous_max = (
        db.query(func.max(PredictionRecord.risk_score))
        .filter(PredictionRecord.location_name == reading.location_name)
        .scalar()
        or 0
    )
    worse = "Yes" if risk_score > previous_max else "No"
    severity = severity_from_score(risk_score)
    interpretation = (
        f"{severity} flood risk. Water level is {reading.water_level_m:.2f} m with "
        f"{reading.rainfall_mm:.1f} mm rainfall. Estimated affected area is "
        f"{affected_area:.2f} sq km."
    )
    record = PredictionRecord(
        source=source,
        location_name=reading.location_name,
        latitude=reading.latitude,
        longitude=reading.longitude,
        water_level_m=reading.water_level_m,
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

