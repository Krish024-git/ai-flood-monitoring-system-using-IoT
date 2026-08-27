// ============================================================================
// FloodSentinelAI — Unified Mock Data & Telemetry Simulation Service
// ============================================================================
// This service provides high-fidelity simulated datasets that match the exact
// schema returned by the ESP32 edge node, Firebase synchronization, and the
// FastAPI ML classifier.
//
// In production, the simulator calls in App.jsx will be swapped with:
// - Firebase Realtime Database reference listeners.
// - Fetch calls to '/sensor-data' and '/api/predictions'.
// ============================================================================

// Generate timestamp string formatted for graph X-axis
const getFormattedTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Seed initial history of 100 points
export const getInitialTelemetryHistory = (pointsCount = 100) => {
  const history = [];
  let baseTime = new Date(Date.now() - pointsCount * 2000); // 2-second intervals backwards

  let currentWater = 70.0; // cm
  let currentFlow = 15.0;  // L/min
  let currentTemp = 26.5;  // °C
  let currentHumidity = 58.0; // %

  for (let i = 0; i < pointsCount; i++) {
    baseTime = new Date(baseTime.getTime() + 2000);
    
    // Simulate natural variations using sine waves
    const sinFactor = Math.sin(i * 0.1);
    currentWater = Math.max(30.0, Math.min(180.0, currentWater + sinFactor * 1.5 + (Math.random() - 0.5) * 1.0));
    currentFlow = Math.max(0.0, Math.min(60.0, currentFlow + sinFactor * 0.8 + (Math.random() - 0.5) * 0.6));
    currentTemp = Math.max(15.0, Math.min(45.0, 27.0 + Math.sin(i * 0.03) * 2.0 + (Math.random() - 0.5) * 0.1));
    currentHumidity = Math.max(30.0, Math.min(99.0, 60.0 + Math.cos(i * 0.03) * 5.0 + (Math.random() - 0.5) * 0.3));

    const levelM = currentWater / 100;
    
    // Estimate a mock prediction score based on level and flow
    const mockRiskScore = Math.min(100, Math.max(0, (currentWater / 150) * 60 + (currentFlow / 50) * 30 + (Math.random() - 0.5) * 10));

    history.push({
      time: getFormattedTime(baseTime),
      timestamp: baseTime.toISOString(),
      water_level_cm: parseFloat(currentWater.toFixed(1)),
      water_level_m: parseFloat(levelM.toFixed(2)),
      flow_rate_lpm: parseFloat(currentFlow.toFixed(1)),
      temperature_c: parseFloat(currentTemp.toFixed(1)),
      humidity_pct: parseFloat(currentHumidity.toFixed(1)),
      rain_status: currentWater > 110 ? "Heavy Rain" : currentWater > 80 ? "Moderate Rain" : "No Rain",
      risk_score: parseFloat(mockRiskScore.toFixed(0))
    });
  }
  return history;
};

// Seed initial predictions history
export const getInitialPredictionHistory = (count = 15) => {
  const predictions = [];
  let baseTime = new Date(Date.now() - count * 10000);

  const statuses = ["Safe", "Moderate", "Warning", "Danger", "Critical"];

  for (let i = 0; i < count; i++) {
    baseTime = new Date(baseTime.getTime() + 10000);
    const mockLevel = 50 + Math.random() * 90;
    const mockFlow = 10 + Math.random() * 35;
    
    let status = "Safe";
    if (mockLevel > 120) status = "Critical";
    else if (mockLevel > 100) status = "Danger";
    else if (mockLevel > 80) status = "Warning";
    else if (mockLevel > 60) status = "Moderate";

    const confidence = 85 + Math.random() * 12;

    predictions.unshift({
      id: `pred_${i}_${Date.now()}`,
      created_at: baseTime.toISOString(),
      water_level_cm: parseFloat(mockLevel.toFixed(1)),
      flow_rate_lpm: parseFloat(mockFlow.toFixed(1)),
      flood_status: status,
      risk_score: Math.min(100, Math.max(0, Math.round((mockLevel / 150) * 100))),
      confidence: parseFloat(confidence.toFixed(1)),
      model: "Random Forest Classifier",
      alert_sent: status !== "Safe"
    });
  }
  return predictions;
};

// Seed initial events log
export const getInitialEvents = () => {
  return [
    { id: 1, time: "11:10:05 AM", type: "system", msg: "ESP32 secure handshake successful. WDT timer set." },
    { id: 2, time: "11:10:03 AM", type: "firebase", msg: "Firebase sync path /telemetry initialized." },
    { id: 3, time: "11:10:02 AM", type: "ai", msg: "Random Forest Classifier model loaded into memory." },
    { id: 4, time: "11:10:00 AM", type: "sensor", msg: "HC-SR04 ultrasonic echo calibrate successful." },
    { id: 5, time: "11:09:59 AM", type: "network", msg: "SIM800L registered on regional GSM network." }
  ];
};

// Seed sensor diagnostics details
export const getSensorHealthData = () => {
  return {
    "HC-SR04": { name: "Ultrasonic Depth Sensor", status: "Online", lastUpdated: "Just Now", health: 98, signal: "Excellent" },
    "YF-S201": { name: "Hall-Effect Flow Sensor", status: "Online", lastUpdated: "Just Now", health: 96, signal: "Stable" },
    "DHT22": { name: "Climate Temp/Humidity Sensor", status: "Online", lastUpdated: "Just Now", health: 99, signal: "Excellent" },
    "Rain Sensor": { name: "Analogue Rain Level Sensor", status: "Online", lastUpdated: "Just Now", health: 95, signal: "Active" },
    "SIM800L": { name: "GSM Cellular Modem", status: "Online", lastUpdated: "Just Now", health: 92, signal: "Good (RSSI: 18)" }
  };
};

// Seed Connection state variables
export const getConnectionStatuses = () => {
  return {
    esp32: { connected: true, label: "ESP32 Edge", delay: "45ms", signal: "Strong" },
    firebase: { connected: true, label: "Firebase DB", delay: "120ms", signal: "Synced" },
    backend: { connected: true, label: "FastAPI App", delay: "12ms", signal: "Optimal" },
    ai: { connected: true, label: "RF Classifier", delay: "5ms", signal: "Ready" }
  };
};

// Feature importance weights for Random Forest classifier
export const getFeatureImportance = () => {
  return [
    { name: "Water Level", weight: 45, desc: "Primary ultrasonic depth reading (HC-SR04)" },
    { name: "Water Flow Rate", weight: 25, desc: "Turbine speed sensor (YF-S201)" },
    { name: "Rain Trigger Rate", weight: 15, desc: "Analog capacitive moisture gauge" },
    { name: "Ambient Temperature", weight: 10, desc: "DHT22 thermal reading" },
    { name: "Relative Humidity", weight: 5, desc: "DHT22 moisture quotient" }
  ];
};

// AI Model stats
export const getAIModelStats = () => {
  return {
    name: "Random Forest Classifier",
    accuracy: 80.0,
    precision: 81.2,
    recall: 78.9,
    f1Score: 80.0,
    trainingDate: "2026-07-10",
    version: "v4.0.1 (Released)"
  };
};

// Generates next simulated point and shifts dataset
export const simulateNextTelemetry = (currentHistory, currentPredictions, currentEvents, thresholdSettings) => {
  const nextTime = new Date();
  const lastPoint = currentHistory[currentHistory.length - 1];

  // Base state simulation variables
  let currentWater = lastPoint.water_level_cm;
  let currentFlow = lastPoint.flow_rate_lpm;
  let currentTemp = lastPoint.temperature_c;
  let currentHumidity = lastPoint.humidity_pct;

  // Let's add slight random noise + occasional rain/level drift
  const drift = Math.sin(Date.now() / 60000); // 1-minute cycles of level fluctuations
  currentWater = Math.max(30.0, Math.min(180.0, currentWater + drift * 2.0 + (Math.random() - 0.5) * 1.5));
  currentFlow = Math.max(0.0, Math.min(60.0, currentFlow + drift * 1.0 + (Math.random() - 0.5) * 0.8));
  currentTemp = Math.max(15.0, Math.min(45.0, currentTemp + (Math.random() - 0.5) * 0.2));
  currentHumidity = Math.max(30.0, Math.min(99.0, currentHumidity + (Math.random() - 0.5) * 0.4));

  const levelM = currentWater / 100;
  
  // Calculate mock risk score
  const mockRiskScore = Math.min(100, Math.max(0, Math.round(
    (currentWater / thresholdSettings.dangerThresholdCm) * 60 + 
    (currentFlow / thresholdSettings.flowAlarmLimitLpm) * 30 + 
    (currentWater > thresholdSettings.warningThresholdCm ? 10 : 0)
  )));

  // Categorize based on score
  let status = "Safe";
  if (currentWater > thresholdSettings.dangerThresholdCm) {
    status = "Critical";
  } else if (currentWater > thresholdSettings.dangerThresholdCm * 0.85) {
    status = "Danger";
  } else if (currentWater > thresholdSettings.warningThresholdCm) {
    status = "Warning";
  } else if (currentWater > thresholdSettings.warningThresholdCm * 0.8) {
    status = "Moderate";
  }

  // Create new telemetry point
  const nextPoint = {
    time: getFormattedTime(nextTime),
    timestamp: nextTime.toISOString(),
    water_level_cm: parseFloat(currentWater.toFixed(1)),
    water_level_m: parseFloat(levelM.toFixed(2)),
    flow_rate_lpm: parseFloat(currentFlow.toFixed(1)),
    temperature_c: parseFloat(currentTemp.toFixed(1)),
    humidity_pct: parseFloat(currentHumidity.toFixed(1)),
    rain_status: currentWater > thresholdSettings.dangerThresholdCm * 0.8 ? "Heavy Rain" : currentWater > thresholdSettings.warningThresholdCm ? "Moderate Rain" : "No Rain",
    risk_score: mockRiskScore
  };

  // Push to history and keep last 100 points
  const updatedHistory = [...currentHistory.slice(1), nextPoint];

  // Occasionally simulate a new event (10% chance per call)
  let updatedEvents = [...currentEvents];
  if (Math.random() < 0.12) {
    const eventTypes = ["sensor", "firebase", "ai", "network", "system"];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    let eventMsg = "Sensor pulse calibrate verified.";
    if (eventType === "sensor") {
      eventMsg = currentWater > thresholdSettings.dangerThresholdCm ? "HC-SR04 detected critical elevation." : "DHT22 reports temperature adjustment.";
    } else if (eventType === "firebase") {
      eventMsg = "Telemetry synced successfully.";
    } else if (eventType === "ai") {
      eventMsg = `Random Forest classifier predicted state: ${status}.`;
    } else if (eventType === "network") {
      eventMsg = "SIM800L cell signal heartbeat verified.";
    } else {
      eventMsg = "WDT hardware ping received. System secure.";
    }

    updatedEvents = [
      {
        id: Date.now(),
        time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: eventType,
        msg: eventMsg
      },
      ...currentEvents.slice(0, 19)
    ];
  }

  // Occasionally generate a new Prediction log (every 6 seconds / 3 intervals)
  let updatedPredictions = [...currentPredictions];
  if (Math.random() < 0.35) {
    const confidence = 80 + Math.random() * 19;
    const nextPrediction = {
      id: `pred_${Date.now()}`,
      created_at: nextTime.toISOString(),
      water_level_cm: parseFloat(currentWater.toFixed(1)),
      flow_rate_lpm: parseFloat(currentFlow.toFixed(1)),
      flood_status: status,
      risk_score: mockRiskScore,
      confidence: parseFloat(confidence.toFixed(1)),
      model: "Random Forest Classifier",
      alert_sent: status === "Critical" || status === "Danger"
    };
    updatedPredictions = [nextPrediction, ...currentPredictions.slice(0, 49)];
  }

  return {
    latest: nextPoint,
    history: updatedHistory,
    predictions: updatedPredictions,
    events: updatedEvents,
    status
  };
};

export const getMockAlerts = () => {
  return [
    { id: 1, date: "2026-07-18", time: "11:05:00 AM", message: "CRITICAL: Water level exceeded danger line. Level: 1.28 m.", severity: "Critical", status: "Active" },
    { id: 2, date: "2026-07-18", time: "10:30:00 AM", message: "WARNING: High flow rate detected on YF-S201. Level: 36.8 L/min.", severity: "Warning", status: "Resolved" },
    { id: 3, date: "2026-07-18", time: "09:45:00 AM", message: "MODERATE: Ambient climate temperature change registered. Temp: 30.2 °C.", severity: "Moderate", status: "Resolved" },
    { id: 4, date: "2026-07-18", time: "08:12:00 AM", message: "SAFE: System calibration complete. Handshake successful.", severity: "Safe", status: "Resolved" },
    { id: 5, date: "2026-07-17", time: "11:50:00 PM", message: "CRITICAL: Heavy rainfall detected. Rain Sensor: 920 value.", severity: "Critical", status: "Resolved" }
  ];
};

export const getSensorDiagnosticsDetails = () => {
  return [
    {
      id: "hc_sr04",
      name: "HC-SR04 Ultrasonic Sensor",
      type: "Depth Sensor",
      status: "Online",
      lastUpdated: "Just Now",
      signal: "Excellent",
      health: 98,
      accuracy: "±1.5%",
      lastCalibration: "2026-07-18 08:00 AM",
      autoCalibration: "Enabled",
      reading: "1.10 m",
      recommendation: "Ensure acoustic grid is clear of river moss.",
      sparkline: [{ value: 65 }, { value: 68 }, { value: 70 }, { value: 72 }, { value: 71 }, { value: 73 }, { value: 75 }]
    },
    {
      id: "yf_s201",
      name: "YF-S201 Flow Sensor",
      type: "Turbine Velocity",
      status: "Online",
      lastUpdated: "Just Now",
      signal: "Stable",
      health: 96,
      accuracy: "±2.0%",
      lastCalibration: "2026-07-18 08:10 AM",
      autoCalibration: "Enabled",
      reading: "18.5 L/min",
      recommendation: "Inspect rotor bearings every 90 operational days.",
      sparkline: [{ value: 12 }, { value: 15 }, { value: 18 }, { value: 16 }, { value: 20 }, { value: 18 }, { value: 19 }]
    },
    {
      id: "dht22",
      name: "DHT22 Climate Sensor",
      type: "Temp/Humidity",
      status: "Online",
      lastUpdated: "Just Now",
      signal: "Excellent",
      health: 99,
      accuracy: "±0.5°C / ±2%",
      lastCalibration: "2026-07-17 06:00 PM",
      autoCalibration: "Enabled",
      reading: "27.8 °C / 64.2%",
      recommendation: "Calibration verified; sensor membrane dry.",
      sparkline: [{ value: 26 }, { value: 27 }, { value: 27.5 }, { value: 28 }, { value: 28.2 }, { value: 27.9 }, { value: 27.8 }]
    },
    {
      id: "rain_sensor",
      name: "Analogue Rain Grid",
      type: "Precipitation Probe",
      status: "Online",
      lastUpdated: "Just Now",
      signal: "Active",
      health: 95,
      accuracy: "±5.0%",
      lastCalibration: "2026-07-18 08:30 AM",
      autoCalibration: "Disabled",
      reading: "Dry (4095 ADC)",
      recommendation: "Clean capacitive grids from surface oxidation.",
      sparkline: [{ value: 4095 }, { value: 4095 }, { value: 3800 }, { value: 4095 }, { value: 4095 }, { value: 4095 }, { value: 4095 }]
    },
    {
      id: "sim800l",
      name: "SIM800L GPRS Modem",
      type: "Cellular Fallback",
      status: "Online",
      lastUpdated: "Just Now",
      signal: "Good (RSSI: 18)",
      health: 92,
      accuracy: "N/A",
      lastCalibration: "2026-07-18 08:45 AM",
      autoCalibration: "N/A",
      reading: "Cell Registered (OK)",
      recommendation: "Verify credit balances and SIM registration yearly.",
      sparkline: [{ value: 14 }, { value: 16 }, { value: 18 }, { value: 17 }, { value: 18 }, { value: 18 }, { value: 18 }]
    }
  ];
};

export const getSMSLogsHistory = () => {
  return [
    { id: 1, date: "2026-07-18", time: "11:05:00 AM", to: "+919876543210", contact: "District Disaster Lead", body: "FloodSentinelAI ALERT: CRITICAL flood warning! Level: 1.28 m. Flow: 36.8 L/m. Take immediate actions.", status: "Delivered", reason: "Success" },
    { id: 2, date: "2026-07-18", time: "10:30:15 AM", to: "+918765432109", contact: "Yamuna Nagar Patrol", body: "FloodSentinelAI Alert: WARNING water level rising. Level: 0.88 m. Secondary cells active.", status: "Delivered", reason: "Success" },
    { id: 3, date: "2026-07-18", time: "09:45:00 AM", to: "+917654321098", contact: "Control Room Lead", body: "FloodSentinelAI Message: MODERATE climate trigger logged. Temp: 30.2 °C.", status: "Delivered", reason: "Success" },
    { id: 4, date: "2026-07-18", time: "08:12:45 AM", to: "+916543210987", contact: "System Admin Node", body: "FloodSentinelAI Setup: Handshake verified. SIM800L online status: OK.", status: "Delivered", reason: "Success" },
    { id: 5, date: "2026-07-17", time: "11:50:22 PM", to: "+919876543210", contact: "District Disaster Lead", body: "FloodSentinelAI ALERT: CRITICAL rain registered. Rain Sensor: 920 value.", status: "Failed", reason: "Network Jam" },
    { id: 6, date: "2026-07-17", time: "06:15:30 PM", to: "+918765432109", contact: "Yamuna Nagar Patrol", body: "System notification: Daily diagnostics reports clean. Battery status check complete.", status: "Delivered", reason: "Success" },
    { id: 7, date: "2026-07-17", time: "12:00:10 PM", to: "+915432109876", contact: "Emergency Operator", body: "Test SMS broadcast from cellular fallback link.", status: "Failed", reason: "Low Credit" },
    { id: 8, date: "2026-07-16", time: "05:40:00 PM", to: "+919876543210", contact: "District Disaster Lead", body: "FloodSentinelAI warning: Water level: 0.90 m. Moderate risk scored.", status: "Delivered", reason: "Success" },
    { id: 9, date: "2026-07-16", time: "10:15:00 AM", to: "+917654321098", contact: "Control Room Lead", body: "Test broadcast payload packet successful.", status: "Pending", reason: "Cell Connecting" }
  ];
};

export const getDeviceDiagnosticStats = (tick = 0) => {
  // Simulates slightly changing device parameters (CPU, RAM, latency, uptime)
  const baseCpu = 28 + Math.sin(tick * 0.1) * 8;
  const baseTemp = 42.5 + Math.cos(tick * 0.05) * 1.5;
  const latency = 120 + Math.round(Math.sin(tick * 0.2) * 25);
  const freeRam = 214840 + Math.round(Math.sin(tick * 0.15) * 2048);
  const flashUsage = 31.0 + Math.sin(tick * 0.01) * 0.2;

  return {
    cpuUsage: parseFloat(Math.max(1, Math.min(99, baseCpu)).toFixed(1)),
    systemTemp: parseFloat(baseTemp.toFixed(1)),
    wifiSignal: -58 + Math.round(Math.sin(tick * 0.05) * 4),
    firebaseLatency: Math.max(10, latency),
    freeHeapBytes: freeRam,
    flashUsagePct: parseFloat(flashUsage.toFixed(2)),
    uptimeSec: 3600 * 4 + tick * 5, // Uptime increments by 5s per refresh
    restartCount: 2,
    firmwareVersion: "v4.0.1 (Stable)",
    deviceHealth: Math.round(97 + Math.sin(tick * 0.03) * 2),
    networkQuality: "Optimal",
    lastSyncTime: new Date().toLocaleTimeString()
  };
};


