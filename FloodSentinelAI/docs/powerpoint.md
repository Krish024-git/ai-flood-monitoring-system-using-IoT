# FloodSentinelAI — PowerPoint Presentation Layout

This document provides a slide-by-slide layout (15 slides) for the FloodSentinelAI project exhibition, college review, and placement presentations.

---

### Slide 1: Title Slide
* **Title**: FloodSentinelAI: Smart Flood Prediction & Early Warning System
* **Subtitle**: An AI-powered real-time flood monitoring platform using low-cost IoT edge nodes and cloud synchronization
* **Presenter Names**: [Presenter Name / Roll Number]
* **Key Visuals**: Project Logo, ESP32 board icon

---

### Slide 2: Problem Statement
* **Heading**: The Hydrological Hazard
* **Points**:
  - Floods account for 40% of all natural disasters, causing severe socio-economic impact.
  - Conventional stations (radar, telemetry) cost thousands of dollars per node.
  - Lack of local predictive analytics leads to delayed emergency evacuations.
  - Disconnect between local hardware sensors and immediate public warning channels.

---

### Slide 3: Proposed Solution
* **Heading**: The FloodSentinelAI Framework
* **Points**:
  - **Low Cost**: Built entirely using highly affordable ESP32 microcontroller and basic environmental sensors.
  - **Embedded Intelligence**: On-node calibration, noise filtering, and offline buffering.
  - **AI Ingestion**: Backend Random Forest/XGBoost models that predict risk levels based on real-time stream factors.
  - **Instant Alerts**: Multi-channel warn via LCD, active buzzy alarms, cellular SMS, and web dashboards.

---

### Slide 4: System Architecture
* **Heading**: Architectural Topology
* **Diagram Description**:
  - Flowchart showing: ESP32 Edge Node -> (HTTP REST JSON) -> FastAPI Backend -> SQLite Local DB & Firebase Realtime DB.
  - FastAPI Backend loads `best_model.joblib` for inference.
  - React Web Dashboard fetches real-time states directly from Firebase.

---

### Slide 5: Hardware Edge Node Specifications
* **Heading**: Hardware Fabric (Low Budget Edition)
* **Points**:
  - **Main Controller**: ESP32 Dual-Core CPU (Built-in WiFi, ADC, interrupts).
  - **Level Sensor**: HC-SR04 Ultrasonic (Clearance calculation).
  - **Flow Sensor**: YF-S201 Hall-Effect (Hydraulic velocity).
  - **Climate Sensor**: DHT22 (Relative Humidity and Ambient Temperature).
  - **Rain Sensor**: Analog conductivity grid.
  - **Alert Interface**: 16x2 LCD, Active Buzzer, SIM800L GSM cell transmitter.

---

### Slide 6: Circuit Design & Power Supply
* **Heading**: Electrical Interconnections & Power Decoupling
* **Points**:
  - ESP32 GPIOs operate at 3.3V. Sound echo pin uses a series 1kΩ / 2.2kΩ voltage divider to prevent pin damage.
  - SIM800L requires 3.7V - 4.2V and draws 2.0A bursts.
  - Decoupling provided by LM2596 buck converter (output set to 4.0V) and a 1000µF low-ESR capacitor across SIM800L pins.
  - Common ground bus links all modules.

---

### Slide 7: Edge Software Logic
* **Heading**: Resilient Firmware Programming
* **Points**:
  - Non-blocking execution loop using `millis()` timing (no blocking `delay()` calls).
  - Hardware Watchdog Timer (WDT) set to 10 seconds to auto-recover if system hangs.
  - Offline circular buffer (30 records storage capacity) handles WiFi dropouts.
  - Automatic reconnection logic with exponential backoff.

---

### Slide 8: Machine Learning - Dataset & Features
* **Heading**: AI Feature Engineering
* **Points**:
  - Telemetries parsed: Water Level, Flow Rate, Rain Value, Temp, Humidity.
  - Engineered Features:
    1. **Hydraulic Stress** = Water Level $\times$ Flow Rate
    2. **Precipitation Ratio** = Rainfall $\times$ Humidity / 100
  - Dataset: 2500 samples representing dry season baseline, storm warnings, and extreme river overflow states.

---

### Slide 9: Machine Learning - Model Evaluation
* **Heading**: Model Training & Comparison
* **Table**:
  | Metric | Random Forest (Chosen) | XGBoost Classifier |
  | :--- | :--- | :--- |
  | **Test Accuracy** | **80.00%** | 79.60% |
  | **Macro Precision** | 74.73% | 73.64% |
  | **Macro Recall** | 68.45% | 69.03% |
  | **Macro F1-Score** | 70.21% | 70.58% |

---

### Slide 10: FastAPI Backend Design
* **Heading**: Backend Control Plane
* **Points**:
  - Built with FastAPI for async execution and high-performance throughput.
  - Pydantic models validate all incoming ESP32 sensor streams.
  - JWT Token Authentication secures admin audit endpoints.
  - Automatically compiles and hosts the Vite React static web files.

---

### Slide 11: Real-Time Synchronization (Firebase)
* **Heading**: Cloud Database Mirroring
* **Points**:
  - FastAPI backend streams updates to Firebase Realtime Database in the background.
  - React frontend dashboard binds directly to Firebase paths.
  - Telemetry changes reflect on user views with under 500ms latency.
  - Decouples API query loads from SQLite.

---

### Slide 12: Vite React Frontend Dashboard
* **Heading**: Web Dashboard & Command Center
* **Points**:
  - Clean SPA design using Tailwind CSS with Light/Dark mode toggles.
  - Animated risk meters and Recharts area graphs showing historical levels.
  - Custom alert banner that displays active alerts and recommendations.
  - Mobile responsive layouts.

---

### Slide 13: Emergency Alert & Response Systems
* **Heading**: Multichannel Warning Protocol
* **Points**:
  - **Safe State**: Display stats on LCD, dashboard glows green.
  - **Warning State**: Active tracking, dashboard glows yellow.
  - **Critical/Danger State**: Active buzzer pulse, dashboard flashes red, SIM800L sends warning SMS: *"EMERGENCY: Flood risk 99%! Evacuate now!"*

---

### Slide 14: Verification & Testing Results
* **Heading**: Validation Summary
* **Points**:
  - **API Validation**: Fast response times (under 50ms per post).
  - **Unit Testing**: Pytest test suite asserting schemas, JWT auth, and ML model outputs.
  - **Stability**: WDT and offline buffer verify edge resiliency under network drop simulations.

---

### Slide 15: Conclusion & Future Scope
* **Heading**: Summary & Future Scope
* **Points**:
  - Successful execution of an AI+IoT warning system using only budget-friendly components.
  - Suitable for college major project, internships, and portfolio projects.
  - **Future Scope**:
    - Integrate multi-node mesh networks (LoRa) for wider geographic tracking.
    - Implement battery backup solar charging circuits.
    - Build mobile applications with push notifications.
