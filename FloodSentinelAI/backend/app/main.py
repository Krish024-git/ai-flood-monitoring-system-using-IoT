
import os
from flask import Flask, jsonify, render_template, request
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.entities import PredictionRecord, SensorReading, Visitor, LocationAccess
from app.services.india_location_service import (
    INDIA_LOCATIONS,
    build_river_report,
    fallback_weather,
    get_location,
    nearest_location,
)
from app.services.iot_service import generate_iot_reading
from app.services.prediction_service import create_prediction_from_iot
from app.services.satellite_service import analyze_satellite_image

frontend_dir = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "frontend"
    )
)

app = Flask(
    __name__,
    template_folder=frontend_dir,
    static_folder=frontend_dir,
    static_url_path="/static",
)

Base.metadata.create_all(bind=engine)

sensor_data = {
    "water_level_cm": 0,
    "flow_rate_lpm": 0,
    "status": "SAFE",
    "lcd_line1": "",
    "lcd_line2": "",
}


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.route("/")
def dashboard():
    return render_template(
        "index.html",
        water_level=sensor_data["water_level_cm"],
        flow_rate=sensor_data["flow_rate_lpm"],
        status=sensor_data["status"],
        lcd1=sensor_data["lcd_line1"],
        lcd2=sensor_data["lcd_line2"],
    )


@app.route("/sensor-data")
def sensor_data_api():
    return jsonify(sensor_data)


@app.route("/dashboard")
def iot_dashboard():
    return render_template("flood-dashboard.html")


@app.route("/admin")
def admin_panel():
    return render_template("admin.html")


def get_admin_credentials():
    return (
        os.environ.get("ADMIN_USERNAME", "admin"),
        os.environ.get("ADMIN_PASSWORD", "Flood@123"),
    )


def validate_admin_request():
    user = request.headers.get("X-Admin-User", "")
    password = request.headers.get("X-Admin-Password", "")
    admin_user, admin_password = get_admin_credentials()
    return user == admin_user and password == admin_password


@app.route("/api/locations/india")
def india_locations():
    return jsonify({"states": INDIA_LOCATIONS})


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    if not validate_admin_request():
        return jsonify({"detail": "Invalid admin credentials."}), 401
    return jsonify({"ok": True})


@app.route("/api/admin/visitors")
def admin_visitors():
    if not validate_admin_request():
        return jsonify({"detail": "Invalid admin credentials."}), 401

    with SessionLocal() as db:
        visitors = db.query(Visitor).order_by(Visitor.created_at.desc()).all()
        return jsonify({
            "visitors": [
                {
                    "email": visitor.email,
                    "phone": visitor.phone,
                    "created_at": visitor.created_at.isoformat(),
                }
                for visitor in visitors
            ]
        })


@app.route("/api/admin/accesses")
def admin_accesses():
    if not validate_admin_request():
        return jsonify({"detail": "Invalid admin credentials."}), 401

    with SessionLocal() as db:
        accesses = db.query(LocationAccess).order_by(LocationAccess.created_at.desc()).all()
        return jsonify({
            "accesses": [
                {
                    "email": access.email,
                    "phone": access.phone,
                    "state": access.state,
                    "city": access.city,
                    "risk_status": access.risk_status,
                    "created_at": access.created_at.isoformat(),
                }
                for access in accesses
            ]
        })


@app.route("/api/visitors", methods=["POST"])
def create_visitor():
    payload = request.get_json(force=True, silent=True) or {}
    email = payload.get("email")
    phone = payload.get("phone")
    if not email or not phone:
        return jsonify({"detail": "Email and phone are required."}), 400

    with SessionLocal() as db:
        visitor = Visitor(email=email, phone=phone)
        db.add(visitor)
        db.commit()
        db.refresh(visitor)
        return jsonify({"id": visitor.id, "email": visitor.email, "phone": visitor.phone})


@app.route("/api/reports/area", methods=["POST"])
def area_report():
    payload = request.get_json(force=True, silent=True) or {}
    state = payload.get("state")
    city = payload.get("city")
    visitor_id = payload.get("visitor_id")
    if not state or not city or visitor_id is None:
        return jsonify({"detail": "visitor_id, state and city are required."}), 400

    try:
        location = get_location(state, city)
    except ValueError as error:
        return jsonify({"detail": str(error)}), 400

    weather = fallback_weather(location["lat"], location["lon"])
    report = build_river_report(location, weather)

    with SessionLocal() as db:
        access = LocationAccess(
            visitor_id=visitor_id,
            email="",
            phone="",
            state=state,
            city=city,
            latitude=location["lat"],
            longitude=location["lon"],
            risk_status=report["status"],
        )
        db.add(access)
        db.commit()

    return jsonify(report)


@app.route("/api/reports/live-location", methods=["POST"])
def live_location_report():
    payload = request.get_json(force=True, silent=True) or {}
    visitor_id = payload.get("visitor_id")
    latitude = payload.get("latitude")
    longitude = payload.get("longitude")
    if visitor_id is None or latitude is None or longitude is None:
        return jsonify({"detail": "visitor_id, latitude and longitude are required."}), 400

    location = nearest_location(float(latitude), float(longitude))
    weather = fallback_weather(location["lat"], location["lon"])
    report = build_river_report(location, weather)

    with SessionLocal() as db:
        access = LocationAccess(
            visitor_id=visitor_id,
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

    return jsonify(report)


@app.route("/api/predictions")
def list_predictions():
    with SessionLocal() as db:
        predictions = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).all()
        return jsonify([
            {
                "id": prediction.id,
                "source": prediction.source,
                "location_name": prediction.location_name,
                "latitude": prediction.latitude,
                "longitude": prediction.longitude,
                "water_level_m": prediction.water_level_m,
                "affected_area_sq_km": prediction.affected_area_sq_km,
                "risk_score": prediction.risk_score,
                "severity": prediction.severity,
                "previous_max_risk": prediction.previous_max_risk,
                "worse_than_previous": prediction.worse_than_previous,
                "interpretation": prediction.interpretation,
                "created_at": prediction.created_at.isoformat(),
            }
            for prediction in predictions
        ])


@app.route("/api/satellite/analyze", methods=["POST"])
def satellite_analyze():
    image_file = request.files.get("image")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    location_name = request.form.get("location_name")

    if not image_file or latitude is None or longitude is None or not location_name:
        return jsonify({"detail": "image, latitude, longitude and location_name are required."}), 400

    image_bytes = image_file.read()
    with SessionLocal() as db:
        prediction = analyze_satellite_image(
            db,
            image_bytes=image_bytes,
            latitude=float(latitude),
            longitude=float(longitude),
            location_name=location_name,
        )
        return jsonify({
            "id": prediction.id,
            "source": prediction.source,
            "location_name": prediction.location_name,
            "latitude": prediction.latitude,
            "longitude": prediction.longitude,
            "water_level_m": prediction.water_level_m,
            "affected_area_sq_km": prediction.affected_area_sq_km,
            "risk_score": prediction.risk_score,
            "severity": prediction.severity,
            "previous_max_risk": prediction.previous_max_risk,
            "worse_than_previous": prediction.worse_than_previous,
            "interpretation": prediction.interpretation,
            "created_at": prediction.created_at.isoformat(),
        })


@app.route("/api/predictions/satellite", methods=["DELETE"])
def clear_satellite_predictions():
    with SessionLocal() as db:
        deleted = db.query(PredictionRecord).filter(PredictionRecord.source == "Satellite ML").delete()
        db.commit()
        return jsonify({"deleted": deleted})


@app.route("/update-data", methods=["POST"])
def update_data():
    global sensor_data
    sensor_data = request.json
    print(sensor_data)
    return jsonify({"message": "Data updated"})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )

