import os
import logging
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db

logger = logging.getLogger("floodsentinel.firebase")


class FirebaseService:
    def __init__(self):
        self.enabled = False
        db_url = os.getenv("FIREBASE_DATABASE_URL")
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

        if not db_url:
            logger.warning("FIREBASE_DATABASE_URL not set. Firebase synchronization is disabled.")
            return

        try:
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"databaseURL": db_url})
                self.enabled = True
                logger.info("Firebase Admin SDK initialized successfully with Service Account certificate.")
            else:
                # Try initializing with Application Default Credentials or empty credentials
                # (which works if running in environments with ADC, or we can initialize without certificate
                # if the rules are public, though credentials.Certificate is preferred)
                logger.warning("FIREBASE_SERVICE_ACCOUNT_JSON is missing or invalid. Attempting default credentials.")
                firebase_admin.initialize_app(options={"databaseURL": db_url})
                self.enabled = True
                logger.info("Firebase Admin SDK initialized using default application credentials.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}. Running without Firebase sync.")
            self.enabled = False

    def sync_latest_reading(self, reading_data: dict):
        if not self.enabled:
            return
        try:
            ref = db.reference("latest_reading")
            ref.set(reading_data)
            logger.info("Synchronized latest sensor reading to Firebase Realtime Database.")
        except Exception as e:
            logger.error(f"Error syncing latest reading to Firebase: {e}")

    def add_historical_reading(self, reading_data: dict):
        if not self.enabled:
            return
        try:
            ref = db.reference("reading_history")
            ref.push(reading_data)
            logger.info("Logged reading to Firebase history.")
        except Exception as e:
            logger.error(f"Error logging reading history to Firebase: {e}")

    def add_alert_history(self, alert_data: dict):
        if not self.enabled:
            return
        try:
            ref = db.reference("alerts")
            ref.push(alert_data)
            logger.info("Logged alert event to Firebase.")
        except Exception as e:
            logger.error(f"Error logging alert history to Firebase: {e}")

    def update_device_status(self, device_id: str, status_data: dict):
        if not self.enabled:
            return
        try:
            ref = db.reference(f"devices/{device_id}")
            ref.set(status_data)
            logger.info(f"Updated device {device_id} status on Firebase.")
        except Exception as e:
            logger.error(f"Error updating device status on Firebase: {e}")


# Singleton instance
firebase_service = FirebaseService()
