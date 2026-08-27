# IEEE Research Paper Draft

**Title**: Design and Implementation of an AI-Powered Smart Flood Prediction & Early Warning System using Low-Cost IoT Edge Nodes

**Authors**: [Author Names]  
**Affiliations**: Department of Computer Science and Engineering, [College/University]  

---

## Abstract
Real-time environmental monitoring is a critical tool for mitigation and disaster management in flood-prone regions. However, standard commercial monitoring networks are prohibitively expensive for local communities. This paper presents the development of **FloodSentinelAI**, an affordable, low-cost, end-to-end flood prediction and early warning framework. The edge node uses an ESP32 microcontroller integrated with HC-SR04 ultrasonic, YF-S201 water flow, rain, and DHT22 sensors. It transfers telemetry over HTTP JSON to a Python FastAPI backend server. The backend runs a Random Forest machine learning classifier to evaluate flood risk and severity, achieving a test classification accuracy of **80.0%**. Real-time cloud database synchronization is handled via the Firebase Realtime Database to supply a responsive React SPA dashboard. Multi-channel warnings are broadcast using a SIM800L cell module, LCD display, and physical alarm sirens.

---

## I. Introduction
Natural hazards such as river overflowing and urban inundation pose extreme risks to public safety, infrastructure, and agricultural supply chains. Early Warning Systems (EWS) are crucial to providing communities with the time needed to evacuate. Traditional monitoring systems rely on expensive sensor stations and simple manual threshold alerts, which limits their widespread distribution and predictive accuracy. 
To address this gap, this paper introduces a low-cost, AI-integrated early warning system that:
1. Employs budget hardware components while maintaining high operational stability.
2. Implements machine learning models at the backend to predict flood risk based on multiple climate factors.
3. Provides real-time notifications to local residents via automated cellular SMS broadcasts and web interfaces.

---

## II. System Architecture & Methodology

```text
+--------------------------------------------------------------+
|                      ESP32 Edge Node                         |
|  - HC-SR04 (Ultrasonic)            - YF-S201 (Flow Sensor)   |
|  - DHT22 (Temp & Humid)            - Rain Sensor (Conductive)|
|  - LCD 16x2 Display                - Active Buzzer (Siren)   |
|  - SIM800L (GSM SMS Module)                                  |
+--------------------------------------------------------------+
                               |
                               v (HTTP POST JSON)
+--------------------------------------------------------------+
|                     FastAPI Backend                          |
|  - FastAPI ASGI Web Engine         - SQLAlchemy SQL Engine   |
|  - JWT Secure Authentication       - Pydantic Payload Guard  |
+--------------------------------------------------------------+
         |                                           |
         v (Model Load)                              v (Admin SDK Sync)
+----------------------------+             +--------------------------+
|      AI Random Forest      |             | Firebase Realtime DB     |
|   - Inputs: 5 core sensors |             |   - Live telemetry state |
|   - Output: 4 hazard levels|             |   - Historic trend logs  |
+----------------------------+             +--------------------------+
                                                     |
                                                     v (Serverless Event)
                                           +--------------------------+
                                           |    Vite React Dashboard  |
                                           |  - Recharts Visuals      |
                                           |  - Responsive Dark UI    |
                                           +--------------------------+
```

### A. Edge Node Calibration
- **Water Level Measurement**: Measured using time-of-flight. Since sound speed is affected by temperature ($T$), we adjust the speed of sound:
  $$v = 331.3 + 0.6 \times T \text{ m/s}$$
  The distance to the water surface ($D$) is computed, and the actual water level is calculated by subtracting the distance from the baseline node height.
- **Rotor Flow Sensor**: The YF-S201 generates digital pulses proportional to fluid movement. Flow rate ($Q$) is:
  $$Q = \frac{\text{Frequency (Hz)}}{7.5}$$

### B. Machine Learning Modeling
We trained a Random Forest model on 2500 historical hydrological samples. Input parameters consist of Water Level, Flow Rate, Rain Sensor analog readings, Temperature, and Humidity. Compound features such as Hydraulic Stress ($W \times Q$) and Precipitation Ratio (Rainfall $\times$ Humidity / 100) are engineered to improve classification boundaries.

---

## III. Experimental Results & Performance

The Random Forest model was evaluated using a 80-20 train-test split:
- **Testing Accuracy**: **80.00%**
- **Macro Precision**: **74.73%**
- **Macro Recall**: **68.45%**
- **Macro F1-Score**: **70.21%**

The confusion matrix on the test set is shown below:
- **Safe Actual**: 17 classified as Safe, 22 as Warning.
- **Warning Actual**: 5 classified as Safe, 80 as Warning, 15 as Danger.
- **Danger Actual**: 17 classified as Warning, 54 as Danger, 25 as Critical.
- **Critical Actual**: 16 classified as Danger, 249 as Critical.

This confirms the model has high sensitivity to Critical conditions, ensuring zero false-safes during actual flood events.

---

## IV. Conclusion
The FloodSentinelAI system demonstrates that a reliable, real-time early warning platform can be built using affordable IoT edge nodes and modern web frameworks. By moving predictive computations to a FastAPI backend and utilizing a Firebase Realtime Database, the system delivers sub-second telemetry updates to residents while keeping hardware costs under $35 per node. Future work will explore mesh networking protocols (LoRa) to scale the framework across larger river basins.
