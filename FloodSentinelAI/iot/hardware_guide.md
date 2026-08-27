# FloodSentinelAI — Hardware Connection & Calibration Guide

This guide details the hardware architecture, wiring diagram, power supply design, sensor calibration rules, and testing checklist for the FloodSentinelAI IoT node.

---

## 1. System Pin Mapping (ESP32)

Below is the pin mapping used in the production C++ firmware:

| Component | Pin Name (Component) | ESP32 Pin | Mode | Description |
| :--- | :--- | :--- | :--- | :--- |
| **HC-SR04** | Trigger | GPIO 12 | Output | High-frequency pulse sender |
| | Echo | GPIO 14 | Input | Pulse duration reader (time of flight) |
| **YF-S201** | Pulse Out | GPIO 27 | Input Pullup | Reads Hall-effect sensor frequency (Interrupt) |
| **DHT22** | Data | GPIO 15 | Input | Temp & Humidity data bus (Pullup needed) |
| **Rain Sensor** | Analog Out (AO) | GPIO 34 | Input | Raw analog conductivity value (0 - 4095) |
| | Digital Out (DO) | GPIO 25 | Input | Active-LOW rain detection trigger |
| **SIM800L** | TX | GPIO 16 (RX2) | UART Input | Serial data from GSM receiver |
| | RX | GPIO 17 (TX2) | UART Output| Serial data to GSM transmitter |
| **16x2 LCD** | SDA | GPIO 21 | I2C Data | Serial Data line (4.7k Pullup if missing) |
| | SCL | GPIO 22 | I2C Clock | Serial Clock line |
| **Active Buzzer**| Positive (+) | GPIO 13 | Output | Generates audible tone when HIGH |

---

## 2. Detailed Circuit Schematics

### 2.1. Sensor Connections
1. **HC-SR04 Ultrasonic Sensor**:
   - VCC -> ESP32 5V (or External 5V Rail)
   - GND -> Shared System Ground
   - Trig -> ESP32 GPIO 12
   - Echo -> Voltage Divider -> ESP32 GPIO 14
     *(IMPORTANT: The ESP32 pins are NOT 5V tolerant. Echo pin output must be reduced from 5V to 3.3V using a voltage divider: 1kΩ resistor in series from Echo to GPIO 14, and a 2.2kΩ resistor from GPIO 14 to GND).*

2. **YF-S201 Flow Sensor**:
   - VCC -> External 5V Rail
   - GND -> Shared System Ground
   - Pulse -> ESP32 GPIO 27 (Configured with `INPUT_PULLUP`)

3. **DHT22 Sensor**:
   - VCC -> ESP32 3.3V (or 5V rail depending on board variant)
   - GND -> Shared System Ground
   - Data -> ESP32 GPIO 15 *(Include a 10kΩ pull-up resistor between VCC and Data pin)*

4. **Rain Sensor (Module Board)**:
   - VCC -> ESP32 3.3V
   - GND -> Shared System Ground
   - AO -> ESP32 GPIO 34 (Analog input)
   - DO -> ESP32 GPIO 25 (Digital input)

### 2.2. Interface & Alarm Connections
1. **16x2 LCD with I2C Adapter**:
   - VCC -> ESP32 5V
   - GND -> Shared System Ground
   - SDA -> ESP32 GPIO 21
   - SCL -> ESP32 GPIO 22

2. **Active Buzzer**:
   - Positive (+) -> ESP32 GPIO 13
   - Negative (-) -> Shared System Ground

---

## 3. Power Supply Guide (SIM800L Alert Integration)

The **SIM800L GSM Module** is notorious for causing hardware resets and connection hangs if not powered correctly. It has very specific power requirements:
- **Voltage Range**: 3.7V to 4.2V (Nominal 4.0V is recommended). **Do NOT connect directly to ESP32 5V or 3.3V pins.**
- **Peak Current**: Up to 2.0A bursts during network search and SMS transmission.

### Recommended Power Delivery Circuit:
1. **Source**: Use a 12V 2A DC Adapter or a 7.4V Li-ion Battery pack.
2. **Buck Converter**: Use an **LM2596 Adjustable Buck Converter** to step down the input voltage to exactly **4.0V**.
3. **Filtering**: Connect a high-capacitance electrolytic capacitor (at least **1000µF, 16V**) in parallel across the SIM800L VCC and GND pins to absorb current spikes.
4. **Common Ground**: Ensure the ESP32 Ground, Buck Converter Output Ground, and SIM800L Ground are connected together. Without a shared ground reference, Serial communication will fail.

---

## 4. Sensor Calibration & Logic

### 4.1. HC-SR04 Water Level Calibration
- The sensor measures the distance from its position to the water surface ($D_{\text{surface}}$).
- The total height of the sensor node above the riverbed is defined as $H_{\text{bed}}$ (configured as `CALIBRATION_HEIGHT_CM = 200.0` cm in code).
- The actual water level ($W$) is calculated as:
  $$W = H_{\text{bed}} - D_{\text{surface}}$$
- For calibration: Measure the exact distance from the sensor face to the empty river basin using a tape measure and enter it in `CALIBRATION_HEIGHT_CM`.

### 4.2. YF-S201 Flow Rate Calibration
- The sensor outputs a sequence of pulses as water flows.
- The sensor formula is:
  $$\text{Pulse Frequency (Hz)} = 7.5 \times Q$$
  where $Q$ is the flow rate in Liters per minute (L/min).
- To convert pulses counted over a duration of $T$ seconds to LPM:
  $$Q = \frac{\text{Pulses}}{T \times 7.5}$$

### 4.3. Rain Sensor Thresholds
- The analog value outputs from 0 (completely wet) to 4095 (completely dry).
- **Heuristic Classification**:
  - `Analog Value < 1500`: Heavy Rain
  - `Analog Value 1500 to 3000`: Moderate Rain
  - `Analog Value > 3000 & Digital == LOW`: Light Rain
  - `Analog Value > 3000 & Digital == HIGH`: No Rain

---

## 5. Physical Installation & Validation Checklist

1. [ ] **Chassis Setup**: Mount ESP32 and display elements in a IP65 waterproof project enclosure. Place the HC-SR04 sensor face down through pre-drilled holes in the bottom.
2. [ ] **Sensor Placement**: Suspend the enclosure securely above the river basin (e.g. under a bridge or cantilever arm). Ensure the HC-SR04 is level and has a clear line of sight to the water.
3. [ ] **Ground Connection**: Double-check that ALL grounds (ESP32, LM2596 buck converter, SIM800L, flow sensor) are connected.
4. [ ] **SIM Card Verification**: Ensure the SIM card inside the SIM800L has 2G network capabilities, active SMS balance, and that the PIN lock is disabled.
5. [ ] **LCD Inspection**: Power the unit and verify that the backlight activates and displays `WiFi Connection OK` or `WiFi Offline mode` within 10 seconds. Adjust the contrast potentiometer on the back of the I2C backpack if text is invisible.
6. [ ] **Watchdog Test**: Block code execution using an infinite loop during testing to confirm the hardware Watchdog automatically reboots the node within 10 seconds.
