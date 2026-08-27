#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <esp_task_wdt.h>

// ==========================================
// SYSTEM CONFIGURATION & PIN MAPPING
// ==========================================

// Wi-Fi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server API Endpoint
const char* SERVER_URL = "http://192.168.1.100:8000/update-data";

// Sensor Pin Definitions
#define DHT_PIN          15     // DHT22 Data Pin
#define DHT_TYPE         DHT22
#define PIN_TRIG         12     // HC-SR04 Trigger Pin
#define PIN_ECHO         14     // HC-SR04 Echo Pin
#define PIN_FLOW         27     // YF-S201 Flow Sensor (Interrupt Pin)
#define PIN_RAIN_ANALOG  34     // Rain Sensor Analog Input
#define PIN_RAIN_DIGITAL 25     // Rain Sensor Digital Input
#define PIN_BUZZER       13     // Active Buzzer Output

// GSM SIM800L Serial Config
#define GSM_TX_PIN       17     // ESP32 TX2 -> GSM RX
#define GSM_RX_PIN       16     // ESP32 RX2 -> GSM TX
#define ALERT_PHONE_NUM  "+919876543210"

// Timing Configurations (Non-blocking)
const unsigned long POLL_INTERVAL_MS = 5000;
unsigned long lastPollTime = 0;

// Watchdog Timeout (seconds)
#define WDT_TIMEOUT_SEC  10

// Hydrology Constants
const float CALIBRATION_HEIGHT_CM = 200.0; // Distance from sensor to empty river bed

// ==========================================
// GLOBALS & INSTANCES
// ==========================================

DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Change address if 0x3F or other

// Flow sensor variables
volatile uint32_t flowPulseCount = 0;
float flowRateLPM = 0.0;
unsigned long lastFlowTime = 0;

// Offline Buffer
#define BUFFER_SIZE 30
struct TelemetryRecord {
  float water_level_cm;
  float flow_rate_lpm;
  float temperature_c;
  float humidity_pct;
  int rain_value;
  const char* rain_status;
  unsigned long timestamp;
};
TelemetryRecord offlineBuffer[BUFFER_SIZE];
int bufferHead = 0;
int bufferTail = 0;
int bufferCount = 0;

// SMS and Alarm state trackers
String smsStatus = "Standby";
bool isAlertActive = false;
unsigned long lastSmsSentTime = 0;
const unsigned long SMS_COOLDOWN_MS = 300000; // 5 minute alert SMS rate limit

// Interrupt Service Routine for Flow Sensor
void IRAM_ATTR pulseCounterISR() {
  flowPulseCount++;
}

// ==========================================
// COMPONENT MODULES
// ==========================================

void initGSM() {
  Serial2.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  delay(1000);
  Serial.println("Initializing GSM Module...");
  Serial2.println("AT"); // Test AT communication
  delay(200);
  Serial2.println("AT+CMGF=1"); // Set SMS text mode
  delay(200);
  Serial2.println("AT+CNMI=2,2,0,0,0"); // Forward SMS to terminal directly
  delay(200);
}

void sendAlertSMS(String message) {
  if (millis() - lastSmsSentTime < SMS_COOLDOWN_MS) {
    Serial.println("SMS alert skipped due to rate limit cooldown.");
    return;
  }
  
  Serial.println("Sending alert SMS via SIM800L...");
  smsStatus = "Sending";
  Serial2.print("AT+CMGS=\"");
  Serial2.print(ALERT_PHONE_NUM);
  Serial2.println("\"");
  delay(1000);
  Serial2.print(message);
  delay(100);
  Serial2.write(26); // Send ASCII Ctrl+Z to submit SMS
  delay(3000);
  
  smsStatus = "Sent";
  lastSmsSentTime = millis();
  Serial.println("SMS alert completed.");
}

float measureWaterLevel() {
  // Clear trigger pin
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  // Send 10 microsecond pulse
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  
  // Measure return echo time (timeout after 25ms, approx 4 meters range)
  long duration = pulseIn(PIN_ECHO, HIGH, 25000);
  if (duration == 0) {
    Serial.println("[Warning] HC-SR04 echo timed out or read out of range.");
    return 0.0;
  }
  
  float distance = (duration * 0.0343) / 2.0; // Distance in cm
  float waterLevel = CALIBRATION_HEIGHT_CM - distance;
  
  return max(0.0f, waterLevel);
}

float calculateFlowRate() {
  unsigned long now = millis();
  unsigned long duration = now - lastFlowTime;
  if (duration == 0) return 0.0;
  
  // Disable interrupts while reading counter
  noInterrupts();
  uint32_t pulses = flowPulseCount;
  flowPulseCount = 0;
  interrupts();
  
  lastFlowTime = now;
  
  // YF-S201 conversion: Pulse Frequency (Hz) = 7.5 * Q (L/min)
  // Therefore: Q = frequency / 7.5 = (pulses / duration_seconds) / 7.5
  float durationSeconds = (float)duration / 1000.0;
  float lpm = (pulses / durationSeconds) / 7.5;
  
  return lpm;
}

void triggerAlarm(bool active) {
  isAlertActive = active;
  if (active) {
    // Generate rapid alarm pulse
    digitalWrite(PIN_BUZZER, HIGH);
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    digitalWrite(PIN_BUZZER, LOW);
  }
}

void bufferTelemetry(float water, float flow, float temp, float hum, int rainVal, const char* rainStat) {
  if (bufferCount >= BUFFER_SIZE) {
    // Overwrite oldest record (circular buffer)
    bufferTail = (bufferTail + 1) % BUFFER_SIZE;
    bufferCount--;
  }
  offlineBuffer[bufferHead] = {water, flow, temp, hum, rainVal, rainStat, millis()};
  bufferHead = (bufferHead + 1) % BUFFER_SIZE;
  bufferCount++;
  Serial.printf("Saved offline backup. Offline Buffer Count: %d\n", bufferCount);
}

void processOfflineQueue() {
  if (WiFi.status() != WL_CONNECTED || bufferCount == 0) return;
  
  Serial.printf("Processing %d buffered offline records...\n", bufferCount);
  while (bufferCount > 0) {
    TelemetryRecord rec = offlineBuffer[bufferTail];
    
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<256> doc;
    doc["sensor_id"] = "esp32-floodnode-01";
    doc["location_name"] = "Ganga Basin Node 1";
    doc["latitude"] = 28.6139;
    doc["longitude"] = 77.2090;
    doc["water_level_cm"] = rec.water_level_cm;
    doc["flow_rate_lpm"] = rec.flow_rate_lpm;
    doc["temperature_c"] = rec.temperature_c;
    doc["humidity_pct"] = rec.humidity_pct;
    doc["rain_status"] = rec.rain_status;
    doc["rain_value"] = rec.rain_value;
    doc["sms_status"] = smsStatus;
    doc["message"] = "Offline historical payload sync";
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.POST(payload);
    http.end();
    
    if (httpResponseCode == 200) {
      bufferTail = (bufferTail + 1) % BUFFER_SIZE;
      bufferCount--;
    } else {
      Serial.printf("Offline sync failed with HTTP Code %d. Retrying later.\n", httpResponseCode);
      break;
    }
  }
}

// ==========================================
// MAIN ARDUINO CYCLES
// ==========================================

void setup() {
  Serial.begin(115200);
  
  // Pin Configuration
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_FLOW, INPUT_PULLUP);
  pinMode(PIN_RAIN_DIGITAL, INPUT);
  pinMode(PIN_RAIN_ANALOG, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  
  // Attach interrupts for flow pulse counting
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW), pulseCounterISR, RISING);
  
  // Initialize LCD & DHT22
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("FloodSentinelAI");
  lcd.setCursor(0, 1);
  lcd.print("Booting system...");
  
  dht.begin();
  
  // Connect Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 15) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println("");
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected.");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Connection OK");
  } else {
    Serial.println("Wi-Fi Connection failed. Running in offline telemetry mode.");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Offline mode");
  }
  delay(1500);
  
  // Initialize GSM
  initGSM();
  
  // Configure Hardware Watchdog Timer
  esp_task_wdt_init(WDT_TIMEOUT_SEC, true);
  esp_task_wdt_add(NULL); // Add current thread
  
  lastFlowTime = millis();
}

void loop() {
  // Feed the watchdog timer
  esp_task_wdt_reset();
  
  unsigned long now = millis();
  if (now - lastPollTime >= POLL_INTERVAL_MS) {
    lastPollTime = now;
    
    // 1. Gather Sensor Telemetry
    float waterLevel = measureWaterLevel();
    float flowRate = calculateFlowRate();
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int rainAnalogVal = analogRead(PIN_RAIN_ANALOG);
    bool isRaining = (digitalRead(PIN_RAIN_DIGITAL) == LOW); // LOW means water detected
    
    // Check reading errors
    if (isnan(temp)) temp = 25.0;
    if (isnan(hum)) hum = 60.0;
    
    const char* rainStatus = "No Rain";
    if (rainAnalogVal < 1500) {
      rainStatus = "Heavy Rain";
    } else if (rainAnalogVal < 3000) {
      rainStatus = "Moderate Rain";
    } else if (isRaining) {
      rainStatus = "Light Rain";
    }
    
    // Debug print
    Serial.printf("Telemetry: Water=%0.1fcm, Flow=%0.1fLPM, Temp=%0.1fC, Humidity=%0.1f%%, Rain=%d (%s)\n", 
                  waterLevel, flowRate, temp, hum, rainAnalogVal, rainStatus);
                  
    // 2. Transmit to Backend Server or store locally
    if (WiFi.status() == WL_CONNECTED) {
      // Sync offline buffer if any
      processOfflineQueue();
      
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      
      StaticJsonDocument<512> doc;
      doc["sensor_id"] = "esp32-floodnode-01";
      doc["location_name"] = "Ganga Basin Node 1";
      doc["latitude"] = 28.6139;
      doc["longitude"] = 77.2090;
      doc["water_level_cm"] = waterLevel;
      doc["flow_rate_lpm"] = flowRate;
      doc["temperature_c"] = temp;
      doc["humidity_pct"] = hum;
      doc["rain_status"] = rainStatus;
      doc["rain_value"] = rainAnalogVal;
      doc["sms_status"] = smsStatus;
      doc["message"] = "Telemetry live transmission";
      
      String payload;
      serializeJson(doc, payload);
      
      int httpResponseCode = http.POST(payload);
      
      if (httpResponseCode == 200) {
        String response = http.getString();
        StaticJsonDocument<256> responseDoc;
        deserializeJson(responseDoc, response);
        
        const char* floodStatus = responseDoc["flood_status"];
        float riskScore = responseDoc["risk_score"];
        const char* lcdLine1 = responseDoc["lcd_line1"];
        const char* lcdLine2 = responseDoc["lcd_line2"];
        bool buzzerActive = responseDoc["buzzer_active"];
        
        // Update local components based on Backend AI decision
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(lcdLine1);
        lcd.setCursor(0, 1);
        lcd.print(lcdLine2);
        
        triggerAlarm(buzzerActive);
        
        // Escalate to SMS alert if status is CRITICAL
        if (strcmp(floodStatus, "Critical") == 0) {
          String smsAlertMsg = "EMERGENCY: FloodSentinelAI alert! Critical flood risk (";
          smsAlertMsg += String(riskScore, 1) + "%). Water Level: ";
          smsAlertMsg += String(waterLevel, 1) + "cm. Flow Rate: ";
          smsAlertMsg += String(flowRate, 1) + "L/min. EVACUATE NOW.";
          sendAlertSMS(smsAlertMsg);
        }
      } else {
        Serial.printf("[Error] Backend communication failed. HTTP Code: %d\n", httpResponseCode);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("COMM ERROR: ");
        lcd.print(httpResponseCode);
        lcd.setCursor(0, 1);
        lcd.print("Storing local...");
        bufferTelemetry(waterLevel, flowRate, temp, hum, rainAnalogVal, rainStatus);
      }
      http.end();
    } else {
      // Offline mode: calculate locally using simple thresholds to update LCD and alarm
      Serial.println("[Warning] WiFi Offline. Calculating threshold risk locally.");
      
      bool localCritical = (waterLevel > 180.0) || (flowRate > 90.0 && waterLevel > 120.0);
      bool localWarning = (waterLevel > 100.0) || (flowRate > 50.0);
      
      lcd.clear();
      lcd.setCursor(0, 0);
      if (localCritical) {
        lcd.print("RISK: CRITICAL!");
        triggerAlarm(true);
        sendAlertSMS("OFFLINE EMERGENCY Alert: Local threshold sensors exceeded Critical level! Evacuate immediately.");
      } else if (localWarning) {
        lcd.print("RISK: WARNING");
        triggerAlarm(false);
      } else {
        lcd.print("RISK: SAFE");
        triggerAlarm(false);
      }
      
      lcd.setCursor(0, 1);
      lcd.printf("W:%0.0fcm F:%0.0fL", waterLevel, flowRate);
      
      // Store telemetries for later sync
      bufferTelemetry(waterLevel, flowRate, temp, hum, rainAnalogVal, rainStatus);
      
      // Attempt WiFi reconnect
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }
  
  // Small delay for task switching
  delay(50);
}
