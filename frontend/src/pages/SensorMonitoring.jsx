import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  Activity,
  Thermometer,
  Zap,
  DoorClosed,
  Radio,
  RefreshCw,
  Gauge
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function SensorMonitoring() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const res = await elevatorApi.getRecentTelemetry('ELV-01', 35);
      setTelemetry(res.data.slice().reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Real-Time Sensor Monitoring Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            High-frequency streaming analysis of ESP32 physical sensor outputs
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono flex items-center space-x-2 hover:bg-slate-800 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Live Sync 1s</span>
        </button>
      </div>

      {/* Sensor Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Temperature Sensor Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Temperature Telemetry (°C)</h3>
                <p className="text-[11px] text-slate-400 font-mono">Sensors: DS18B20 / DHT11 Digital Thermometer</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {latest.temperatureCelsius?.toFixed(1) || '28.5'} °C
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <XAxis dataKey="id" stroke="#475569" tick={false} />
                <YAxis stroke="#475569" domain={[20, 80]} fontSize={11} fontStyle="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <ReferenceLine y={45} label={{ value: 'Warning Limit (45°C)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={60} label={{ value: 'Critical Limit (60°C)', fill: '#f43f5e', fontSize: 10 }} stroke="#f43f5e" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="temperatureCelsius" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vibration Sensor Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Vibration Level Stream (m/s²)</h3>
                <p className="text-[11px] text-slate-400 font-mono">Sensors: MPU6050 Accelerometer / SW-420 Vibration</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-amber-400">
              {latest.vibrationMs2?.toFixed(2) || '0.80'} m/s²
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <XAxis dataKey="id" stroke="#475569" tick={false} />
                <YAxis stroke="#475569" domain={[0, 12]} fontSize={11} fontStyle="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <ReferenceLine y={5.0} label={{ value: 'Smooth Limit (5.0)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={7.5} label={{ value: 'Hazard Limit (7.5)', fill: '#f43f5e', fontSize: 10 }} stroke="#f43f5e" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="vibrationMs2" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Motor Current Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Motor Current Draw (Amps)</h3>
                <p className="text-[11px] text-slate-400 font-mono">Sensors: ACS712 Hall-Effect Current Transducer</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-purple-300">
              {latest.motorCurrentAmps?.toFixed(1) || '0.8'} A
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <XAxis dataKey="id" stroke="#475569" tick={false} />
                <YAxis stroke="#475569" domain={[0, 20]} fontSize={11} fontStyle="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <ReferenceLine y={12.5} label={{ value: 'Overload Stall (12.5 A)', fill: '#f43f5e', fontSize: 10 }} stroke="#f43f5e" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="motorCurrentAmps" stroke="#c084fc" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Floor Hall Effect Position Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Floor Position Sensors</h3>
                <p className="text-[11px] text-slate-400 font-mono">Sensors: Magnetic Reed / Optical Shaft Encoder</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-400">
              FL {latest.floorHallSensor || 1}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <XAxis dataKey="id" stroke="#475569" tick={false} />
                <YAxis stroke="#475569" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={11} fontStyle="monospace" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Line type="stepAfter" dataKey="floorHallSensor" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
