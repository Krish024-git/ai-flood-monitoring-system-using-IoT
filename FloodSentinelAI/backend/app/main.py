import os
import csv
import logging
from io import StringIO
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models.entities import SensorReading, PredictionRecord, Visitor, LocationAccess
from app.schemas import (
    SensorUpdateRequest,
    SensorHistoryItem,
    SensorDataResponse,
    UserLogin,
    TokenOut,
    VisitorCreate,
    VisitorOut,
    AreaReportRequest,
    LiveLocationReportRequest,
)
from app.auth import create_access_token, get_current_user
from app.services.india_location_service import (
    INDIA_LOCATIONS,
    get_location,
    fallback_weather,
    build_river_report,
    nearest_location,
)
from app.services.ai_prediction_service import ai_prediction_service
from app.services.firebase_service import firebase_service

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("floodsentinel.main")

# Initialize SQLite database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FloodSentinelAI Control Plane API",
    description="Production-grade AI + IoT flood prediction backend using FastAPI and Firebase.",
    version="2.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define static directories
frontend_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
)
dist_dir = os.path.join(frontend_dir, "dist")

# Global in-memory cache for fast read access
latest_sensor_data = {
    "water_level_cm": 0.0,
    "flow_rate_lpm": 0.0,
    "temperature_c": 25.0,
    "humidity_pct": 60.0,
    "rain_status": "No Rain",
    "rain_value": 4095,
    "status": "SAFE",
    "lcd_line1": "SYSTEM READY",
    "lcd_line2": "WAITING DATA",
    "sms_status": "Standby",
    "alert_message": "Normal",
    "last_update": None
}


@app.on_event("startup")
async def startup_event():
    # Attempt to load AI model at boot time
    ai_prediction_service.load_model()
    logger.info("FloodSentinelAI backend successfully loaded.")


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/login", response_model=TokenOut, tags=["Authentication"])
def login(payload: UserLogin):
    admin_user = os.environ.get("ADMIN_USERNAME", "admin")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Flood@123")

    if payload.username != admin_user or payload.password != admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )

    token = create_access_token(data={"sub": payload.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": payload.username,
    }


@app.get("/api/auth/verify", tags=["Authentication"])
def verify_token(username: str = Depends(get_current_user)):
    return {"status": "authorized", "user": username}


# ==========================================
# PUBLIC SENSOR TELEMETRY & DATA UPDATE
# ==========================================

@app.get("/sensor-data", tags=["Telemetry"])
def get_sensor_data(db: Session = Depends(get_db)):
    """Returns the latest reading and history for dashboard visualization."""
    latest_db = (
        db.query(SensorReading)
        .order_by(SensorReading.created_at.desc())
        .first()
    )
    history_db = (
        db.query(SensorReading)
        .order_by(SensorReading.created_at.desc())
        .limit(20)
        .all()
    )

    history_items = [
        SensorHistoryItem.model_validate(item) for item in reversed(history_db)
    ]

    return {
        "latest": SensorHistoryItem.model_validate(latest_db) if latest_db else None,
        "history": history_items,
    }


def sync_to_cloud_async(reading_dict: dict, prediction_dict: dict):
    """Background task to synchronize data to Firebase Realtime Database."""
    try:
        # Sync latest reading
        firebase_service.sync_latest_reading(reading_dict)
        # Sync to database history
        firebase_service.add_historical_reading(reading_dict)
        # Sync device health status
        firebase_service.update_device_status(
            reading_dict["sensor_id"],
            {
                "status": "Online",
                "last_seen": reading_dict["created_at"],
                "health": "Healthy" if reading_dict["water_level_cm"] > 0 else "Needs Service"
            }
        )
        if reading_dict["alert_active"] == 1:
            # Save alert logged event
            firebase_service.add_alert_history({
                "timestamp": reading_dict["created_at"],
                "sensor_id": reading_dict["sensor_id"],
                "message": reading_dict["alert_message"],
                "risk_score": prediction_dict["risk_score"],
                "severity": prediction_dict["severity"]
            })
    except Exception as e:
        logger.error(f"Error in async Firebase sync task: {e}")


@app.post("/update-data", tags=["Telemetry"])
def update_data(payload: SensorUpdateRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Ingests sensor reading from ESP32, runs AI prediction, and triggers alerts."""
    global latest_sensor_data

    # 1. Trigger AI Prediction
    prediction = ai_prediction_service.predict(
        water_level_cm=payload.water_level_cm,
        flow_rate_lpm=payload.flow_rate_lpm,
        rainfall_mm=payload.rain_value / 40.95,  # Convert analog dry/wet reading to pseudo mm rate
        temperature=payload.temperature_c,
        humidity=payload.humidity_pct,
    )

    severity_label = prediction["severity"]
    risk_score = prediction["risk_score"]
    alert_active = 1 if severity_label in ["Danger", "Critical"] else 0

    # 2. Build LCD Alerts lines (16x2 characters limit)
    lcd_l1 = f"RISK:{risk_score:4.1f}% {severity_label.upper()}"
    lcd_l2 = f"W:{payload.water_level_cm:.0f}cm F:{payload.flow_rate_lpm:.0f}L"

    # 3. Create database entities
    now = datetime.now(timezone.utc)
    reading = SensorReading(
        sensor_id=payload.sensor_id,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        water_level_cm=payload.water_level_cm,
        flow_rate_lpm=payload.flow_rate_lpm,
        temperature_c=payload.temperature_c,
        humidity_pct=payload.humidity_pct,
        rain_status=payload.rain_status,
        rain_value=payload.rain_value,
        flood_status=severity_label,
        sms_status=payload.sms_status,
        alert_active=alert_active,
        alert_message=prediction["interpretation"],
        created_at=now
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # 4. Save AI prediction log
    pred_record = PredictionRecord(
        source="ESP32 AI IoT",
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        water_level_m=round(payload.water_level_cm / 100.0, 2),
        affected_area_sq_km=round((risk_score / 100) ** 2 * 12.0, 2),
        risk_score=risk_score,
        severity=severity_label,
        interpretation=prediction["interpretation"],
        created_at=now
    )
    db.add(pred_record)
    db.commit()

    # 5. Populate global cache
    latest_sensor_data = {
        "water_level_cm": payload.water_level_cm,
        "flow_rate_lpm": payload.flow_rate_lpm,
        "temperature_c": payload.temperature_c,
        "humidity_pct": payload.humidity_pct,
        "rain_status": payload.rain_status,
        "rain_value": payload.rain_value,
        "status": severity_label,
        "lcd_line1": lcd_l1[:16],
        "lcd_line2": lcd_l2[:16],
        "sms_status": payload.sms_status,
        "alert_message": prediction["interpretation"],
        "last_update": now.isoformat()
    }

    # 6. Queue Firebase Cloud Sync in background
    reading_dict = {
        "sensor_id": payload.sensor_id,
        "location_name": payload.location_name,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "water_level_cm": payload.water_level_cm,
        "flow_rate_lpm": payload.flow_rate_lpm,
        "temperature_c": payload.temperature_c,
        "humidity_pct": payload.humidity_pct,
        "rain_status": payload.rain_status,
        "rain_value": payload.rain_value,
        "flood_status": severity_label,
        "sms_status": payload.sms_status,
        "alert_active": alert_active,
        "alert_message": prediction["interpretation"],
        "created_at": now.isoformat()
    }
    background_tasks.add_task(sync_to_cloud_async, reading_dict, prediction)

    return {
        "message": "Data processed successfully",
        "flood_status": severity_label,
        "risk_score": risk_score,
        "lcd_line1": lcd_l1[:16],
        "lcd_line2": lcd_l2[:16],
        "buzzer_active": alert_active,
    }


# ==========================================
# PUBLIC CATALOGS & VISITOR REGISTRATION
# ==========================================

@app.get("/api/locations/india", tags=["Weather Catalog"])
def get_india_locations():
    return {"states": INDIA_LOCATIONS}


@app.post("/api/visitors", tags=["Visitor Management"])
def register_visitor(payload: VisitorCreate, db: Session = Depends(get_db)):
    visitor = Visitor(email=payload.email, phone=payload.phone)
    db.add(visitor)
    db.commit()
    db.refresh(visitor)
    return {"id": visitor.id, "email": visitor.email, "phone": visitor.phone}


@app.post("/api/reports/area", tags=["Weather Catalog"])
def get_area_report(payload: AreaReportRequest, db: Session = Depends(get_db)):
    try:
        location = get_location(payload.state, payload.city)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    weather = fallback_weather(location["lat"], location["lon"])
    report = build_river_report(location, weather)

    # Log visitor lookup access
    access = LocationAccess(
        visitor_id=payload.visitor_id,
        email="",
        phone="",
        state=payload.state,
        city=payload.city,
        latitude=location["lat"],
        longitude=location["lon"],
        risk_status=report["status"],
    )
    db.add(access)
    db.commit()

    return report


@app.post("/api/reports/live-location", tags=["Weather Catalog"])
def get_live_location_report(payload: LiveLocationReportRequest, db: Session = Depends(get_db)):
    location = nearest_location(payload.latitude, payload.longitude)
    weather = fallback_weather(location["lat"], location["lon"])
    report = build_river_report(location, weather)

    # Log visitor lookup access
    access = LocationAccess(
        visitor_id=payload.visitor_id,
        email="",
        phone="",
        state=location["state"],
        city=location["city"],
        latitude=location["lat"],
        longitude=location["lon"],
        risk_status=report["status"],
    )
    db.add(access)
    db.commit()

    return report


# ==========================================
# PREDICTIONS HISTORY & EXPORTS
# ==========================================

@app.get("/api/predictions", tags=["Predictions"])
def get_predictions_history(db: Session = Depends(get_db)):
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .limit(50)
        .all()
    )
    return records


@app.get("/api/predictions/export", tags=["Predictions"])
def export_predictions(db: Session = Depends(get_db)):
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .all()
    )
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Source", "Location", "Latitude", "Longitude", 
        "Water Level (m)", "Affected Area (sq km)", "Risk Score", 
        "Severity", "Interpretation", "Timestamp"
    ])
    
    for r in records:
        writer.writerow([
            r.id, r.source, r.location_name, r.latitude, r.longitude,
            r.water_level_m, r.affected_area_sq_km, r.risk_score,
            r.severity, r.interpretation, r.created_at.isoformat()
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions_history.csv"}
    )


@app.delete("/api/predictions/clear", tags=["Predictions"])
def clear_predictions(db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    deleted = db.query(PredictionRecord).delete()
    db.commit()
    return {"message": "Success", "deleted_records": deleted}


# ==========================================
# SECURED ADMIN PORTALS
# ==========================================

@app.get("/api/admin/visitors", tags=["Admin Services"])
def get_admin_visitors(db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    visitors = db.query(Visitor).order_by(Visitor.created_at.desc()).all()
    return {"visitors": visitors}


@app.get("/api/admin/accesses", tags=["Admin Services"])
def get_admin_accesses(db: Session = Depends(get_db), username: str = Depends(get_current_user)):
    accesses = db.query(LocationAccess).order_by(LocationAccess.created_at.desc()).all()
    return {"accesses": accesses}


# ==========================================
# STATIC FILES SERVING (React SPA Bundle)
# ==========================================

if os.path.exists(dist_dir):
    logger.info(f"Serving compiled React production build from {dist_dir}")
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        # Serve React single page application routes, fall back to index.html
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    logger.warning(f"Compiled React build path not found at {dist_dir}. Serving local fallback templates.")
    if os.path.exists(frontend_dir):
        app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
        
        @app.get("/")
        def serve_index():
            return FileResponse(os.path.join(frontend_dir, "index.html"))
            
        @app.get("/dashboard")
        def serve_dashboard():
            return FileResponse(os.path.join(frontend_dir, "flood-dashboard.html"))
            
        @app.get("/admin")
        def serve_admin():
            return FileResponse(os.path.join(frontend_dir, "admin.html"))
