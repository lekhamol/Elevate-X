import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import TelemetryChart from '../components/TelemetryChart';
import SensorCard from '../components/SensorCard';
import {
  Activity,
  Radio,
  Thermometer,
  Zap,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function Telemetry() {
  const [telemetry, setTelemetry] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const res = await elevatorApi.getRecentTelemetry('ELV-01', 30);
      if (res.success && res.data.length > 0) {
        setIsBackendConnected(true);
        // Reverse so chronological order left to right
        setTelemetry(res.data.slice().reverse());
      } else if (res.error) {
        setIsBackendConnected(false);
      }
    } catch (err) {
      console.warn(err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000); // 2 seconds auto-update
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Live Sensor Telemetry Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            High-frequency ESP32 sensor polling endpoint (GET /api/telemetry/recent)
          </p>
        </div>

        {/* Live Connected Indicator */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              isBackendConnected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span>{isBackendConnected ? 'Live • Connected' : 'Backend Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Disconnected Error Alert */}
      {!isBackendConnected && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              Backend disconnected. Please make sure Spring Boot is running on port 8080.
            </span>
          </div>
          <button
            onClick={fetchTelemetry}
            className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Sensor Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard
          title="Temperature"
          value={latest.temperatureCelsius ? latest.temperatureCelsius.toFixed(1) : '--'}
          unit="°C"
          icon={Thermometer}
          status={latest.temperatureCelsius >= 45 ? 'ELEVATED' : 'STABLE'}
          statusColor={latest.temperatureCelsius >= 45 ? 'amber' : 'cyan'}
          subtitle="Sensor ID: DS18B20"
        />

        <SensorCard
          title="Vibration"
          value={latest.vibrationMs2 ? latest.vibrationMs2.toFixed(2) : '--'}
          unit="m/s²"
          icon={Activity}
          status={latest.vibrationMs2 >= 5.0 ? 'HIGH' : 'NORMAL'}
          statusColor={latest.vibrationMs2 >= 5.0 ? 'amber' : 'cyan'}
          subtitle="Sensor ID: MPU6050"
        />

        <SensorCard
          title="Motor Current"
          value={latest.motorCurrentAmps ? latest.motorCurrentAmps.toFixed(1) : '--'}
          unit="A"
          icon={Zap}
          status="NOMINAL"
          statusColor="cyan"
          subtitle="Sensor ID: ACS712"
        />

        <SensorCard
          title="Floor / Door State"
          value={`FL ${latest.floorHallSensor || 1}`}
          unit={latest.doorSensorState ? '(LOCKED)' : '(OPEN)'}
          icon={Boxes}
          status={latest.doorSensorState ? 'CLOSED' : 'OPEN'}
          statusColor={latest.doorSensorState ? 'emerald' : 'amber'}
          subtitle={`RSSI: ${latest.rawRssi || -67} dBm`}
        />
      </div>

      {/* Individual Sensor Charts for Temperature, Vibration, Motor Current */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Temperature Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-mono">1. Temperature vs Time</h3>
            <span className="text-xs font-mono text-cyan-400">°C</span>
          </div>
          <TelemetryChart data={telemetry} type="temperature" />
        </div>

        {/* 2. Vibration Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-mono">2. Vibration vs Time</h3>
            <span className="text-xs font-mono text-amber-400">m/s²</span>
          </div>
          <TelemetryChart data={telemetry} type="vibration" />
        </div>

        {/* 3. Motor Current Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-mono">3. Motor Current vs Time</h3>
            <span className="text-xs font-mono text-purple-400">Amps</span>
          </div>
          <TelemetryChart data={telemetry} type="current" />
        </div>
      </div>

      {/* Telemetry Stream Log Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-200 font-mono">Latest Telemetry Readings</h3>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Elevator</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Vib (m/s²)</th>
                <th className="py-2.5 px-3">Current (A)</th>
                <th className="py-2.5 px-3">Floor</th>
                <th className="py-2.5 px-3">Door Interlock</th>
                <th className="py-2.5 px-3">RSSI</th>
                <th className="py-2.5 px-3">Anomaly Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {telemetry.slice().reverse().map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400">#{r.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{r.elevatorId || 'ELV-01'}</td>
                  <td className="py-2.5 px-3">{r.temperatureCelsius?.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{r.vibrationMs2?.toFixed(2)}</td>
                  <td className="py-2.5 px-3">{r.motorCurrentAmps?.toFixed(1)}</td>
                  <td className="py-2.5 px-3">FL {r.floorHallSensor}</td>
                  <td className="py-2.5 px-3">
                    <span className={r.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}>
                      {r.doorSensorState ? 'CLOSED' : 'OPEN'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{r.rawRssi} dBm</td>
                  <td className="py-2.5 px-3">
                    <span className={r.isAnomalyDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {r.anomalyScore !== undefined ? r.anomalyScore.toFixed(2) : '0.02'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
