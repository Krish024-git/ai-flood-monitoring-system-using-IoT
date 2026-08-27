# FloodSentinelAI — Comprehensive Project Documentation

**Project Title**: AI Powered Smart Flood Prediction & Early Warning System  
**OS Target**: Windows / Linux / ESP32 RTOS  
**Database**: Firebase Realtime Database & SQLite Local Mirror  
**Hardware Node**: ESP32 Microcontroller  

---

## Abstract
Flooding is one of the most destructive natural disasters globally, causing significant loss of life, property damage, and economic disruption. Traditional flood monitoring systems are often expensive, slow, and lack predictive intelligence. This project presents **FloodSentinelAI**, a low-cost, real-time, AI-powered flood monitoring and early warning platform. Using an ESP32 microcontroller and five low-cost sensors (HC-SR04 ultrasonic, YF-S201 water flow, rain sensor, DHT22 climate sensor, and SIM800L GSM cell module), the system streams real-time environmental telemetry to a FastAPI backend. The backend executes a Random Forest machine learning classifier to predict flood risk and classify severity (Safe, Warning, Danger, Critical). Results are synchronized in real time to the Firebase Realtime Database and shown on a responsive Vite React dashboard. When critical thresholds are breached, the physical node activates a buzzer alarm and sends emergency SMS notifications via the SIM800L module.

---

## 1. Project Objectives
1. **Low-Cost Deployment**: Implement an affordable early warning station utilizing readily available off-the-shelf microcontrollers and sensors.
2. **Real-Time Synchronisation**: Stream telemetry with under 5-second latency to the cloud and frontend interfaces using Firebase Realtime Database.
3. **AI-Powered Predictive Analysis**: Integrate a Scikit-Learn Random Forest model that evaluates multiple parameters simultaneously to output continuous risk scores and severity classifications.
4. **Resilient Local Control**: Program the hardware node to execute offline failover logic, utilizing an offline circular buffer and hardware watchdog timers to handle connectivity loss.
5. **Multi-Channel Alert System**: Trigger immediate sirens, LCD text alerts, and cellular SMS broadcasts to ensure prompt community evacuations.

---

## 2. Hardware Architecture & Pin Mapping

The physical early warning station is controlled by an ESP32 SoC. The component pin connections are mapped below:

| Component | Pin Name | ESP32 GPIO | Mode | Description |
| :--- | :--- | :--- | :--- | :--- |
| **HC-SR04** | Trigger | GPIO 12 | Output | Initiates sonic pulses |
| | Echo | GPIO 14 | Input | Receives sound reflection (Uses 3.3V voltage divider) |
| **YF-S201** | Pulse Out | GPIO 27 | Input Pullup | Generates pulse interrupts per rotor rotation |
| **DHT22** | Data | GPIO 15 | Input | One-Wire serial bus for climate parameters |
| **Rain Sensor**| Analog Out | GPIO 34 | Input | Measures raw conductivity (0 - 4095) |
| | Digital Out| GPIO 25 | Input | Active-LOW rain detection trigger |
| **SIM800L** | TX | GPIO 16 (RX2) | UART Input | Cellular AT command communications |
| | RX | GPIO 17 (TX2) | UART Output| UART TX to GSM receiver |
| **16x2 LCD** | SDA | GPIO 21 | I2C Data | SDA line for alphanumeric feedback |
| | SCL | GPIO 22 | I2C Clock | SCL line |
| **Buzzer** | Positive (+) | GPIO 13 | Output | Siren control pin |

### Power Supply Design (2A Peak Decoupling)
The SIM800L module requires a voltage range of 3.7V to 4.2V and draws up to 2.0A current spikes during transmission. Connecting it directly to the ESP32’s 3.3V or 5V rails will brown out the microcontroller. 
- **LM2596 Buck Converter**: Steps down 12V DC input to exactly 4.0V for the SIM800L.
- **De-coupling Capacitor**: A 1000µF electrolytic capacitor is placed directly across the VCC and GND pins of the SIM800L to supply transient current bursts.
- **Shared Ground**: A shared ground bus connects the ESP32, Buck Converter, and SIM800L.

---

## 3. Hydrological & Climatic Formulas

### 3.1. Ultrasonic Water Level Computation
The HC-SR04 measures time-of-flight. The distance from the sensor face to the water surface ($D_{\text{surface}}$) is:
$$D_{\text{surface}} = \frac{T \times 0.0343}{2} \text{ cm}$$
Given the baseline height of the sensor node above the riverbed ($H_{\text{bed}}$ = 200.0 cm), the actual water level ($W$) is:
$$W = H_{\text{bed}} - D_{\text{surface}}$$

### 3.2. YF-S201 Flow Velocity
The flow sensor contains a Hall-effect rotor. The flow rate ($Q$ in L/min) is derived from the pulse frequency ($f$ in Hz) counted over time $T$:
$$Q = \frac{\text{Pulses}}{T \times 7.5}$$

### 3.3. Feature Engineering for AI Classification
Two compound features are calculated for machine learning:
1. **Hydraulic Stress ($HS$)**: Represents total volume stress.
   $$HS = W \times Q$$
2. **Precipitation Ratio ($PR$)**: Combines rain presence with relative humidity.
   $$PR = \text{Rainfall (mm)} \times \left(\frac{\text{Humidity (\%)}}{100}\right)$$

---

## 4. Software Architecture

### 4.1. FastAPI Backend Server
The backend is built in FastAPI, utilizing asynchronous event handlers to manage high concurrent request volumes:
- **Telemetry Ingestion (`/update-data`)**: Accepts POST JSON payloads from the ESP32, validates inputs using Pydantic, triggers AI inference, logs to the database, and schedules cloud sync tasks.
- **Admin Services**: Uses JSON Web Token (JWT) verification for authentication, protecting lists of visitors and geo-lookup accesses.
- **Static Assets Serving**: Mounts the Vite React production build directory to serve the SPA transparently.

### 4.2. Firebase Sync Service
Using the `firebase-admin` SDK, incoming telemetries are mirrored to Firebase paths. This triggers real-time updates on client dashboards without polling:
- `latest_reading`: Overwritten with current values.
- `reading_history`: Historical stream (list format).
- `alerts`: Event stream for Sirens.

### 4.3. Vite React Frontend SPA
A modern UI themed in sleek dark colors (Navy Blue, Cyan, Slate Grey) built with React:
- **Command Center**: Shows animated risk dials, gauge trends using Recharts, diagnostic status indicators, and notification overlays.
- **Reports Console**: Provides manual and GPS-guided Indian city searches, pulling forecast details from Open-Meteo.

---

## 5. Machine Learning Evaluation

The system trained a **Random Forest Classifier** and an **XGBoost Classifier** on 2500 synthetic records mimicking seasonal monsoon events. 

### Model Performance Metrics:

| Model | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score |
| :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | **80.00%** | **74.73%** | **68.45%** | **70.21%** |
| **XGBoost** | 79.60% | 73.64% | 69.03% | 70.58% |

---

## 6. Project Viva & Interview Revision Questions

### Q1: Why is an active buzzer used instead of a passive buzzer?
**Answer**: An active buzzer has an internal oscillating source. Applying a simple HIGH digital signal from the ESP32 is sufficient to produce an audible alarm. A passive buzzer requires a PWM signal (pulse-width modulation) to create sound, which consumes more processing overhead.

### Q2: What is the purpose of the Watchdog Timer (WDT) in the ESP32 code?
**Answer**: The WDT is a hardware timer that reboots the microcontroller if it is not reset (fed) within a specified interval (e.g., 10 seconds). In production, if the ESP32's Wi-Fi block blocks the main loop or gets stuck, the WDT triggers a hard system reset to restore monitoring.

### Q3: How is the offline circular buffer structured?
**Answer**: It is structured as an in-memory array of fixed size (30 records) managed by `bufferHead` and `bufferTail` pointers. When Wi-Fi is lost, telemetry is added at `bufferHead`. If the buffer fills, the oldest records are overwritten. Once Wi-Fi reconnects, records are POSTed sequentially starting from `bufferTail` until the buffer is empty.

### Q4: Why use JWT instead of standard session cookies?
**Answer**: JWT is stateless. The server does not need to store active sessions in database memory. The token contains cryptographically signed payload data. The backend simply verifies the token signature on each request, which makes the API highly scalable.

---

## References
1. Microchip Technology, *ESP32 Technical Reference Manual*, V4.5, 2024.
2. Pedregosa et al., "Scikit-Learn: Machine Learning in Python", *Journal of Machine Learning Research*, 2011.
3. FastAPI Documentation, https://fastapi.tiangolo.com.
