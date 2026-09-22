# ESP32 Elevator Prototype Hardware Wiring Guide

This guide provides the complete wiring schematic, hardware pinouts, and sensor connections to synchronize a physical elevator prototype with the **Elevator Safety Digital Twin** backend.

---

## Hardware Component List

1. **Microcontroller**: ESP32 Development Board (ESP32-WROOM-32 / ESP32-C3)
2. **Temperature Sensor**: DS18B20 Waterproof Probe or DHT11 Digital Thermometer
3. **Vibration Sensor**: MPU6050 6-DOF Accelerometer / Gyroscope or SW-420 Vibration Switch Sensor
4. **Door Interlock Sensor**: Magnetic Reed Limit Switch / Proximity Sensor
5. **Motor Current Sensor**: ACS712 20A Current Transducer Module
6. **Floor Position Sensors**: 5x Magnetic Reed Switches (Floors 1 to 5)
7. **Motor Relay Driver**: Dual 5V Relay Module (Controls DC winch motor up/down direction)

---

## ESP32 Pinout Mapping

| Component | Sensor Signal Pin | ESP32 GPIO Pin | Power Supply |
| :--- | :--- | :--- | :--- |
| **DS18B20 Temp** | Data | **GPIO 34** (Analog/Digital) | 3.3V / 4.7kΩ Pullup |
| **MPU6050 Vib** | SDA / SCL | **GPIO 21 (SDA) / GPIO 22 (SCL)** | 3.3V |
| **Door Switch** | Signal Output | **GPIO 14** (Internal Pullup) | GND |
| **ACS712 Current** | OUT | **GPIO 32** (Analog IN) | 5V / GND |
| **Floor 1 Reed** | Signal Output | **GPIO 13** | GND |
| **Floor 2 Reed** | Signal Output | **GPIO 12** | GND |
| **Floor 3 Reed** | Signal Output | **GPIO 27** | GND |
| **Floor 4 Reed** | Signal Output | **GPIO 26** | GND |
| **Floor 5 Reed** | Signal Output | **GPIO 25** | GND |

---

## Quick Setup Steps

1. Open `esp32_elevator_twin.ino` in **Arduino IDE**.
2. Install libraries via Library Manager:
   - `ArduinoJson` (v6.x or v7.x)
   - `WiFi.h` & `HTTPClient.h` (Built-in ESP32 core)
3. Update `ssid`, `password`, and `serverUrl` (IP of your computer running the Spring Boot backend on port `8080`).
4. Select board **ESP32 Dev Module** and upload via USB.
5. Open Serial Monitor at **115200 baud** to observe live Wi-Fi transmission logs.
