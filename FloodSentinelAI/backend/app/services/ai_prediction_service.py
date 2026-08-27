import os
import logging
import joblib

logger = logging.getLogger("floodsentinel.ai")

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best_model.joblib")


class AIPredictionService:
    def __init__(self):
        self.model = None
        self.model_type = None
        self.features = None
        self.accuracy = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                metadata = joblib.load(MODEL_PATH)
                self.model = metadata["model"]
                self.model_type = metadata["model_type"]
                self.features = metadata["features"]
                self.accuracy = metadata.get("accuracy", 0.90)
                logger.info(f"AI Model loaded successfully: {self.model_type} (Test Accuracy: {self.accuracy:.2%})")
            except Exception as e:
                logger.error(f"Error loading AI model from {MODEL_PATH}: {e}")
                self.model = None
        else:
            logger.warning(f"AI Model file not found at {MODEL_PATH}. Using fallback heuristic rules.")

    def predict(self, water_level_cm: float, flow_rate_lpm: float, rainfall_mm: float, temperature: float, humidity: float) -> dict:
        """
        Predict flood risk and severity.
        If ML model is loaded, engineers features and runs inference.
        Otherwise falls back to physical heuristic equations.
        """
        # Calculate engineered features
        hydraulic_stress = water_level_cm * flow_rate_lpm
        precipitation_ratio = rainfall_mm * (humidity / 100.0)
        
        # Heuristic base risk calculation
        risk_score_base = (
            (water_level_cm * 0.40) + 
            (flow_rate_lpm * 0.25) + 
            (rainfall_mm * 0.35) + 
            ((humidity - 50) * 0.1)
        )
        risk_score = min(100.0, max(0.0, float(risk_score_base)))

        if self.model is not None:
            try:
                # Prepare input structure matching trained features list
                # Features: ["water_level_cm", "flow_rate_lpm", "rainfall_mm", "temperature", "humidity", "hydraulic_stress", "precipitation_ratio"]
                features_input = [[
                    water_level_cm,
                    flow_rate_lpm,
                    rainfall_mm,
                    temperature,
                    humidity,
                    hydraulic_stress,
                    precipitation_ratio
                ]]
                severity_class = int(self.model.predict(features_input)[0])
                
                # Use model prediction probability for refined risk scoring if available
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(features_input)[0]
                    # Risk score is a weighted expectation of severity level
                    risk_score = min(100.0, float(sum(i * prob for i, prob in enumerate(probs)) * 33.3))
            except Exception as e:
                logger.error(f"Model prediction execution failed, reverting to heuristic. Error: {e}")
                severity_class = self._get_heuristic_severity(risk_score)
        else:
            severity_class = self._get_heuristic_severity(risk_score)

        severity_labels = ["Safe", "Warning", "Danger", "Critical"]
        severity_label = severity_labels[severity_class]

        # Generate custom explanation/interpretation
        interpretation = self._generate_interpretation(severity_label, risk_score, water_level_cm, flow_rate_lpm, rainfall_mm)

        return {
            "risk_score": round(risk_score, 1),
            "severity_class": severity_class,
            "severity": severity_label,
            "interpretation": interpretation,
            "model_used": self.model_type or "Heuristic Rules Engine"
        }

    def _get_heuristic_severity(self, score: float) -> int:
        if score >= 80:
            return 3
        if score >= 60:
            return 2
        if score >= 35:
            return 1
        return 0

    def _generate_interpretation(self, severity: str, score: float, water: float, flow: float, rain: float) -> str:
        if severity == "Critical":
            return (
                f"CRITICAL: Extreme flood risk ({score:.1f}%). Live sensors report high river depth ({water:.1f} cm) "
                f"and dangerous flow velocities ({flow:.1f} L/min) combined with heavy rainfall ({rain:.1f} mm). "
                f"Activate alarms immediately."
            )
        elif severity == "Danger":
            return (
                f"DANGER: Major overflow warning ({score:.1f}%). River level is rising rapidly ({water:.1f} cm) "
                f"with strong velocity ({flow:.1f} L/min). Nearby low-lying areas should prepare for evacuation."
            )
        elif severity == "Warning":
            return (
                f"WARNING: Moderately elevated risk ({score:.1f}%). Environmental factors indicate increasing drainage stress. "
                f"Sensor monitoring should continue with increased sampling rate."
            )
        return f"SAFE: Flood risk is low ({score:.1f}%). Core hydrological parameters are within normal baseline thresholds."


# Singleton instance
ai_prediction_service = AIPredictionService()
