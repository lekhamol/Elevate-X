import React, { useState } from 'react';
import { elevatorApi } from '../services/api';
import {
  Settings as SettingsIcon,
  Cpu,
  Wifi,
  Code,
  Copy,
  Check,
  Send,
  Sliders,
  FileCode,
  Download
} from 'lucide-react';

export default function Settings() {
  const [copied, setCopied] = useState(false);
  const [wifiSSID, setWifiSSID] = useState('ElevatorLab_WiFi');
  const [wifiPassword, setWifiPassword] = useState('SafetyTwin2026!');
  const [serverIP, setServerIP] = useState('192.168.1.100');

  // Payload tester state
  const [testTemp, setTestTemp] = useState(32.5);
  const [testVib, setTestVib] = useState(1.2);
  const [testDoor, setTestDoor] = useState(true);
  const [testCurrent, setTestCurrent] = useState(4.2);
  const [testFloor, setTestFloor] = useState(3);
  const [postResponse, setPostResponse] = useState(null);

  const sampleArduinoCode = `/*
  ===================================================================
  ESP32 ELEVATOR SAFETY DIGITAL TWIN - WI-FI TELEMETRY FIRMWARE
  Target Microcontroller: ESP32-WROOM-32 / ESP32-C3
  ===================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "${wifiSSID}";
const char* password = "${wifiPassword}";
const char* serverPath = "http://${serverIP}:8080/api/telemetry";

// Sensor Pin Definitions
#define TEMP_SENSOR_PIN   34 // DS18B20 / DHT11
#define VIB_SENSOR_PIN    35 // SW-420 / MPU6050
#define DOOR_SWITCH_PIN   14 // Reed Limit Switch
#define MOTOR_CURRENT_PIN 32 // ACS712 Sensor

void setup() {
  Serial.begin(115200);
  pinMode(DOOR_SWITCH_PIN, INPUT_PULLUP);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverPath);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["elevatorId"] = "ELV-01";
    doc["temperature"] = analogRead(TEMP_SENSOR_PIN) * (0.025);
    doc["vibration"] = analogRead(VIB_SENSOR_PIN) * (0.002);
    doc["doorState"] = (digitalRead(DOOR_SWITCH_PIN) == LOW);
    doc["motorCurrent"] = analogRead(MOTOR_CURRENT_PIN) * (0.005);
    doc["floorPosition"] = 1;
    doc["rssi"] = WiFi.RSSI();

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.print("HTTP POST Status: ");
    Serial.println(httpResponseCode);

    http.end();
  }
  delay(1000); // 1-second transmission loop
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleArduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestPayload = async () => {
    try {
      const payload = {
        elevatorId: 'ELV-01',
        temperature: parseFloat(testTemp),
        vibration: parseFloat(testVib),
        doorState: testDoor,
        motorCurrent: parseFloat(testCurrent),
        floorPosition: parseInt(testFloor),
        rssi: -58
      };
      const res = await elevatorApi.postTelemetry(payload);
      setPostResponse(res.data);
    } catch (err) {
      setPostResponse({ error: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <span>Settings & ESP32 Hardware Integration Suite</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Configure Wi-Fi credentials, generate Arduino C++ code, and test REST endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: ESP32 Wi-Fi & REST Config */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <span>ESP32 Wi-Fi & Server Endpoint Generator</span>
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Wi-Fi SSID (Network Name)</label>
                <input
                  type="text"
                  value={wifiSSID}
                  onChange={(e) => setWifiSSID(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Wi-Fi Password</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Spring Boot Backend Host IP</label>
                <input
                  type="text"
                  value={serverIP}
                  onChange={(e) => setServerIP(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300"
                />
              </div>
            </div>
          </div>

          {/* Custom Telemetry Payload Tester */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Send className="w-5 h-5 text-purple-400" />
              <span>REST API Endpoint Payload Tester</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Send custom JSON directly to POST /api/telemetry</p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={testTemp}
                  onChange={(e) => setTestTemp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300"
                />
              </div>
              <div>
                <label className="text-slate-400">Vibration (m/s²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={testVib}
                  onChange={(e) => setTestVib(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300"
                />
              </div>
              <div>
                <label className="text-slate-400">Door State</label>
                <select
                  value={testDoor}
                  onChange={(e) => setTestDoor(e.target.value === 'true')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300"
                >
                  <option value="true">CLOSED</option>
                  <option value="false">OPEN</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Floor Position</label>
                <select
                  value={testFloor}
                  onChange={(e) => setTestFloor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300"
                >
                  {[1, 2, 3, 4, 5].map((f) => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSendTestPayload}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>POST JSON Telemetry Payload</span>
            </button>

            {postResponse && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400 overflow-x-auto">
                <pre>{JSON.stringify(postResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ESP32 Code Viewer */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <span>ESP32 Arduino Firmware Code</span>
              </h2>
              <button
                onClick={copyCode}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 flex items-center space-x-1.5 hover:bg-slate-800 transition-all font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Sketch'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-3">
              Ready to flash in Arduino IDE for ESP32 hardware prototype
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96 text-[11px] font-mono text-slate-300">
              <pre>{sampleArduinoCode}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
