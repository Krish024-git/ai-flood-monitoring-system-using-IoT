# FloodSentinelAI — User Manual & Deployment Guide

This guide details instructions on how to install, configure, deploy, and operate the entire FloodSentinelAI AI + IoT system.

---

## 1. Backend Deployment

The backend is built using FastAPI and Python 3.10+.

### 1.1. Prerequisites
Ensure you have Python 3.10 or higher installed. You can verify this by running:
```powershell
python --version
```

### 1.2. Local Installation Steps
1. Navigate to the backend directory:
   ```powershell
   cd FloodSentinelAI/backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Set up environment variables by copying `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```
   Modify `.env` variables:
   - `ADMIN_USERNAME`: Username for admin login (Default: `admin`).
   - `ADMIN_PASSWORD`: Password for admin login (Default: `Flood@123`).
   - `JWT_SECRET`: Random key to sign auth tokens.
   - `FIREBASE_DATABASE_URL`: Firebase Realtime Database URL.
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: Path to service account credentials JSON.

### 1.3. Train the AI Model
You must train and output the model binary before running the server:
```powershell
python -m app.services.train_models
```
This generates `backend/app/services/best_model.joblib`.

### 1.4. Run the Server
Start the FastAPI server reload mode:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser to inspect the automated Swagger API documentation.

---

## 2. React Frontend Deployment

The React frontend compiles to static assets which are automatically served by the FastAPI backend under `dist/`.

### 2.1. Local Development (Optional)
If you want to run the React app separately during development:
1. Navigate to the frontend directory:
   ```powershell
   cd FloodSentinelAI/frontend
   ```
2. Install npm packages:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   Vite will serve the app on [http://127.0.0.1:5173](http://127.0.0.1:5173). Requests to `/sensor-data` and `/update-data` are automatically proxied to the FastAPI backend running on port 8000.

### 2.2. Building for Production
To bundle the frontend for production:
```powershell
npm run build
```
This outputs compiled assets to `frontend/dist/`. The FastAPI backend detects this folder at startup and automatically serves it, making separate hosting unnecessary.

---

## 3. Firebase Cloud Configuration

To enable real-time telemetry updates:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase Project.
3. Add a **Realtime Database** to the project.
4. Set Rules to allow public reads and writes (or secure with auth keys if preferred):
   ```json
   {
     "rules": {
       ".read": "true",
       ".write": "true"
     }
   }
   ```
5. Go to Project Settings -> Service Accounts. Click **Generate New Private Key** to download the JSON credentials file.
6. Save this JSON file inside `backend/` and update your `.env` variables `FIREBASE_DATABASE_URL` and `FIREBASE_SERVICE_ACCOUNT_JSON` to match.

---

## 4. ESP32 Operation & Testing

1. Open `iot/firmware/firmware.ino` in the Arduino IDE.
2. Install the following libraries via the Library Manager:
   - `DHT sensor library` (Adafruit)
   - `ArduinoJson` (Benoit Blanchon)
   - `LiquidCrystal I2C` (Frank de Brabander)
3. Update the `WIFI_SSID` and `WIFI_PASSWORD` constants in the code to match your network.
4. Set `SERVER_URL` to point to your hosted FastAPI backend IP address (e.g. `http://192.168.1.100:8000/update-data`).
5. Compile and upload the code to your ESP32.
6. Use the Serial Monitor (115200 baud) to inspect debug logs and confirm Wi-Fi sync.
