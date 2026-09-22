/*
  ===================================================================================
  ESP32 ELEVATOR SAFETY DIGITAL TWIN - WI-FI SENSOR TELEMETRY FIRMWARE
  ===================================================================================
  Author  : Elevator Safety Engineering Team
  Board   : ESP32-WROOM-32 / ESP32-C3 / ESP32-S3
  Protocol: Wi-Fi HTTP POST (JSON REST API Payload)
  
  Pin Mapping:
  - Temperature Sensor (DS18B20/DHT11) : GPIO 34
  - Vibration Sensor (MPU6050/SW-420)  : GPIO 35 (I2C SDA=21, SCL=22)
  - Door Limit Switch (Reed Switch)     : GPIO 14 (Internal Pullup)
  - Motor Current Transducer (ACS712)   : GPIO 32
  - Floor Reed Sensors (Floors 1-5)    : GPIO 13, 12, 27, 26, 25
  ===================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Wi-Fi Access Point Credentials
const char* ssid     = "ElevatorLab_WiFi";
const char* password = "SafetyTwin2026!";

// Spring Boot Backend REST Endpoint
const char* serverUrl = "http://192.168.1.100:8080/api/telemetry";

// Sensor Hardware Pins
const int PIN_TEMP         = 34;
const int PIN_VIBRATION    = 35;
const int PIN_DOOR_SWITCH  = 14;
const int PIN_MOTOR_AMP    = 32;

// Floor Position Hall Sensor Array
const int FLOOR_PINS[5] = {13, 12, 27, 26, 25};

// Timing non-blocking loop
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 1000; // Send telemetry every 1000ms

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- INITIALIZING ELEVATOR SAFETY DIGITAL TWIN ESP32 ---");

  // Configure Pin Modes
  pinMode(PIN_DOOR_SWITCH, INPUT_PULLUP);
  for (int i = 0; i < 5; i++) {
    pinMode(FLOOR_PINS[i], INPUT_PULLUP);
  }

  // Connect to Wi-Fi Network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi Network: ");
  Serial.println(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[SUCCESS] Connected to Wi-Fi!");
  Serial.print("ESP32 Station IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = currentMillis;
    sendSensorTelemetry();
  }
}

void sendSensorTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARNING] Wi-Fi disconnected! Reconnecting...");
    WiFi.reconnect();
    return;
  }

  // Read Sensors
  int rawTemp = analogRead(PIN_TEMP);
  double temperatureC = (rawTemp / 4095.0) * 100.0; // Scaled temperature

  int rawVib = analogRead(PIN_VIBRATION);
  double vibrationMs2 = (rawVib / 4095.0) * 15.0; // Scaled vibration m/s²

  bool doorClosed = (digitalRead(PIN_DOOR_SWITCH) == LOW); // LOW = Closed contact

  int rawCurrent = analogRead(PIN_MOTOR_AMP);
  double motorCurrentA = (rawCurrent / 4095.0) * 20.0; // Scaled motor current in Amps

  // Detect current floor position from Reed Sensors
  int detectedFloor = 1;
  for (int i = 0; i < 5; i++) {
    if (digitalRead(FLOOR_PINS[i]) == LOW) {
      detectedFloor = i + 1;
      break;
    }
  }

  // Format JSON Payload
  StaticJsonDocument<300> doc;
  doc["elevatorId"]     = "ELV-01";
  doc["temperature"]    = temperatureC;
  doc["vibration"]      = vibrationMs2;
  doc["doorState"]      = doorClosed;
  doc["motorCurrent"]   = motorCurrentA;
  doc["floorPosition"]  = detectedFloor;
  doc["rssi"]           = WiFi.RSSI();

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send HTTP POST Request
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP POST] Payload Sent OK. Response Code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[HTTP ERROR] Failed to send payload. Error code: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
