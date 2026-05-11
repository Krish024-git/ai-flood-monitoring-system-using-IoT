# FloodSentinelAI

FloodSentinelAI is a full-stack flood monitoring and prediction prototype with:

- Visitor welcome and contact capture
- India-only state/city and live-location flood reports
- River-wise flow speed, wind speed, water level, and water quality cards
- Admin dashboard for visitor and location access tracking
- Satellite image analysis for water coverage and affected-area estimation
- Prediction history with CSV export
- Cloud database support through `DATABASE_URL`
- Bootstrap frontend with HTML, CSS, and JavaScript
- Python FastAPI backend

## Project Structure

```text
FloodSentinelAI/
  backend/
    app/
      main.py
      database.py
      schemas.py
      models/
        entities.py
      services/
        iot_service.py
        neural_network.py
        prediction_service.py
        satellite_service.py
    requirements.txt
  frontend/
    index.html
    css/styles.css
    js/app.js
  docs/
    cloud-deployment.md
  .env.example
  .gitignore
```

## Run Locally

```powershell
cd FloodSentinelAI\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

Open:

```text
http://127.0.0.1:5000
```

Admin panel:

```text
http://127.0.0.1:8000/admin
```

Default admin login:

```text
ID: admin
Password: Flood@123
```

Change these with `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

Or run the helper script:

```powershell
cd FloodSentinelAI
.\run-local.ps1
```

## Cloud Database

Set `DATABASE_URL` to a managed Postgres database from Neon, Supabase, Railway, Render, or AWS RDS.
For cloud Postgres deployments, install:

```powershell
pip install -r requirements-cloud.txt
```

Example:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/floodsentinelai
```

If `DATABASE_URL` is not set, the app uses local SQLite at `backend/floodsentinelai.db`.

## IoT Dashboard

Open the dashboard at:

```text
http://127.0.0.1:8000/dashboard
```

Your NodeMCU can post JSON data to the Flask backend using:

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://192.168.1.100:8000/update-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> payload;
    payload["sensor_id"] = "esp8266-01";
    payload["location_name"] = "River Side Node";
    payload["latitude"] = 28.6139;
    payload["longitude"] = 77.2090;
    payload["water_level_cm"] = 12.4;
    payload["flow_rate_lpm"] = 11.7;
    payload["sms_status"] = "Sent";
    payload["message"] = "Water level below threshold";

    String body;
    serializeJson(payload, body);

    int statusCode = http.POST(body);
    String response = http.getString();
    Serial.printf("POST status=%d response=%s\n", statusCode, response.c_str());

    http.end();
  }
  delay(2000);
}
```

The dashboard polls sensor state every 2 seconds and updates:

- Water level
- Flow rate
- Flood status
- SMS alert status
- Recent alert history

## GitHub

Git is not available on this machine right now. Once Git is installed, run:

```powershell
cd FloodSentinelAI
git init
git add .
git commit -m "Initial FloodSentinelAI full-stack prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USER/FloodSentinelAI.git
git push -u origin main
```
