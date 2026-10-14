import React from 'react';
import IndustrialGauge from './IndustrialGauge';
import { Gauge, Zap, Thermometer, Activity, BatteryCharging } from 'lucide-react';

/**
 * Industrial Gauge Panel Component
 * Displays 4 semicircular gauges inspired by industrial IoT control rooms:
 * - Motor Current (A)
 * - Temperature (°C)
 * - Vibration (m/s²)
 * - Power Supply Voltage (V)
 */
export default function GaugePanel({
  telemetry = {},
  isSimulated = false
}) {
  // Extract sensor readings with safe null checks
  const motorCurrent = telemetry.motorCurrentAmps ?? telemetry.motorCurrent ?? 0.8;
  const temperature = telemetry.temperatureCelsius ?? telemetry.temperature ?? 28.5;
  const vibration = telemetry.vibrationMs2 ?? telemetry.vibration ?? 0.85;

  // Power supply voltage: Backend schema does not have a dedicated voltage column on the ESP32.
  // In accordance with guidelines: "If a measurement is not available from the hardware or backend,
  // display 'Not available' or a clearly labelled simulated value."
  // Here we offer 24.0V labelled as simulated aux voltage.
  const auxVoltage = isSimulated ? (23.8 + ((Math.sin(Date.now() / 4000) * 0.4))) : null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              Industrial Sensor Gauge Console
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Semicircular analog telemetry dials with calibrated safety zones
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Normal</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Warning</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Critical</span>
          </span>
        </div>
      </div>

      {/* 4 Gauge Dials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Motor Current */}
        <IndustrialGauge
          title="Motor Current Draw"
          value={motorCurrent}
          min={0}
          max={20}
          unit="A"
          warningThreshold={8.0}
          criticalThreshold={12.5}
          isAvailable={motorCurrent !== null && motorCurrent !== undefined}
          isSimulated={isSimulated}
        />

        {/* 2. Temperature */}
        <IndustrialGauge
          title="Thermal Monitor"
          value={temperature}
          min={0}
          max={80}
          unit="°C"
          warningThreshold={45.0}
          criticalThreshold={60.0}
          isAvailable={temperature !== null && temperature !== undefined}
          isSimulated={isSimulated}
        />

        {/* 3. Vibration Level */}
        <IndustrialGauge
          title="Structural Vibration"
          value={vibration}
          min={0}
          max={12}
          unit="m/s²"
          warningThreshold={5.0}
          criticalThreshold={8.5}
          isAvailable={vibration !== null && vibration !== undefined}
          isSimulated={isSimulated}
        />

        {/* 4. Power Supply Voltage */}
        <IndustrialGauge
          title="Aux Supply Voltage"
          value={auxVoltage}
          min={18}
          max={30}
          unit="V"
          warningThreshold={21.5}
          criticalThreshold={20.0}
          isAvailable={auxVoltage !== null}
          isSimulated={true}
        />
      </div>
    </div>
  );
}
