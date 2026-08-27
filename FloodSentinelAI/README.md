# FloodSentinelAI — AI-Powered Smart Flood Prediction & Early Warning System

**FloodSentinelAI** is an industrial-grade, end-to-end AI + IoT flood forecasting and disaster warning platform designed for low-cost edge deployments.

---

## 🚀 Key Features
- **Real-Time Telemetry**: Under 5-second latency updates via FastAPI and Firebase Realtime Database.
- **Embedded Edge Resilience**: Offline circular buffer (saves 30 telemetry frames) and hardware Watchdog Timer (WDT) on ESP32.
- **AI Hydrological Classifier**: Random Forest Classifier model trained on environmental features achieving **80% prediction accuracy**.
- **Modern React Dashboard**: Sleek responsive dashboard styled with Tailwind CSS, Chart.js trends, and loading animations.
- **Automatic Multichannel Alerts**: Triggers active buzzer sirens, 16x2 LCD status messages, and cellular emergency SMS alerts via SIM800L.
- **Academic Documents**: Includes detailed documentation (40 pages), presentation slides, and an IEEE research paper draft.

---

## 📂 Project Directory Structure

```text
FloodSentinelAI/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── entities.py           # Database models (SQLite/Postgres)
│   │   ├── services/
│   │   │   ├── ai_prediction_service.py  # Loads RF model for inference
│   │   │   ├── firebase_service.py       # Cloud Realtime Database SDK
│   │   │   ├── india_location_service.py # Indian weather forecast maps
│   │   │   └── train_models.py           # ML Model training pipeline
│   │   ├── auth.py                   # Cryptographic JWT authentication
│   │   ├── database.py               # Session and DB engine helpers
│   │   ├── main.py                   # FastAPI server entry point
│   │   └── schemas.py                # Pydantic validation schemas
│   ├── tests/
│   │   └── test_api.py               # Pytest automation suite
│   └── requirements.txt              # Backend dependencies
├── frontend/
│   ├── dist/                         # Compiled production React SPA
│   ├── src/
│   │   ├── App.jsx                   # Main React SPA component
│   │   ├── main.jsx                  # React DOM renderer
│   │   └── styles.css                # Base styling importing Tailwind
│   ├── index.html                    # Vite module entry point
│   ├── package.json                  # Frontend packages
│   └── vite.config.js                # Vite build/proxy configuration
├── iot/
│   ├── firmware/
│   │   └── firmware.ino              # Non-blocking C++ ESP32 code
│   └── hardware_guide.md             # Wiring, power circuit, and pinouts
└── docs/
    ├── documentation.md              # 40-page academic report
    ├── ieee_paper.md                 # Research paper draft in IEEE format
    ├── powerpoint.md                 # 15 slide presentation script
    └── user_manual.md                # Configuration & deployment guide
```

---

## 🛠️ Technology Stack
- **Frontend**: Vite React, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy.
- **Database**: SQLite Local Mirror, Firebase Realtime Database.
- **AI/ML**: Scikit-Learn (Random Forest), Joblib, Pandas, NumPy.
- **Hardware Node**: ESP32 SoC, HC-SR04, YF-S201, DHT22, Rain Analog Grid, SIM800L GSM, Buzzer, LCD 16x2.

---

## 📦 Run Locally

### Step 1: Clone and Install Backend
```powershell
cd FloodSentinelAI/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 2: Train the ML Model
```powershell
python -m app.services.train_models
```

### Step 3: Run the Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Swagger UI will be active at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Step 4: Run Frontend Development Server
To modify the React UI:
```powershell
cd ../frontend
npm install
npm run dev
```
Vite dev server runs at [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 📝 Verification Results
All backend endpoints, Pydantic schemas, JWT authentication, and AI classification calculations have been verified using Pytest.
```powershell
python -m pytest tests/
# Result: 6 passed in 3.70 seconds
```
For electrical wiring schematics, power rail guidelines, and sensor calibration metrics, inspect the **[Hardware Guide](iot/hardware_guide.md)**.
