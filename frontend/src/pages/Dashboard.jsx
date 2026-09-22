import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  Boxes,
  Thermometer,
  Activity,
  DoorClosed,
  Zap,
  ShieldAlert,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [state, setState] = useState(null);
  const [recentTelemetry, setRecentTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertsSummary, setAlertsSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [stateRes, telemetryRes, alertsRes, summaryRes] = await Promise.all([
        elevatorApi.getElevatorState('ELV-01'),
        elevatorApi.getRecentTelemetry('ELV-01', 15),
        elevatorApi.getAlerts('ELV-01', true),
        elevatorApi.getAlertsSummary()
      ]);
      setState(stateRes.data);
      // Reverse telemetry array for proper left-to-right time chart rendering
      setRecentTelemetry(telemetryRes.data.slice().reverse());
      setAlerts(alertsRes.data);
      setAlertsSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // 1 second live refresh
    return () => clearInterval(interval);
  }, []);

  const latestReading = recentTelemetry.length > 0 ? recentTelemetry[recentTelemetry.length - 1] : {};

  const handleCallFloor = async (floor) => {
    try {
      await elevatorApi.sendCommand('CALL_FLOOR', floor);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await elevatorApi.sendCommand('EMERGENCY_STOP');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFault = async () => {
    try {
      await elevatorApi.sendCommand('RESET_FAULT');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Ticker for Critical Safety Alerts */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/80 shadow-xl flex items-center justify-between animate-pulse-red">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-600">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                ACTIVE SAFETY HAZARD DETECTED ({alerts.length})
              </h3>
              <p className="text-xs text-rose-300 font-mono">
                {alerts[0]?.title}: {alerts[0]?.message}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-1 bg-rose-900/90 text-rose-200 rounded-lg">
              SEVERITY: {alerts[0]?.severity}
            </span>
          </div>
        </div>
      )}

      {/* Main KPI Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Floor Position & Direction */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Floor Position
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-cyan-400 font-mono">
                FL {state?.currentFloor || 1}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ Target: FL {state?.targetFloor || 1}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              state?.direction === 'MOVING_UP' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
              state?.direction === 'MOVING_DOWN' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
              'bg-slate-800 text-slate-300'
            }`}>
              {state?.direction === 'MOVING_UP' && <ArrowUpRight className="w-3 h-3 mr-1" />}
              {state?.direction === 'MOVING_DOWN' && <ArrowDownRight className="w-3 h-3 mr-1" />}
              {state?.direction || 'IDLE'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Speed: {state?.currentSpeedMs?.toFixed(1) || 0} m/s
            </span>
          </div>
        </div>

        {/* KPI 2: Live Temperature Sensor */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Cabin Temp
            </span>
            <div className={`p-2 rounded-xl border ${
              (latestReading.temperatureCelsius || 0) >= 60 ? 'bg-rose-950 text-rose-400 border-rose-800' :
              (latestReading.temperatureCelsius || 0) >= 45 ? 'bg-amber-950 text-amber-400 border-amber-800' :
              'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}>
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className={`text-4xl font-extrabold font-mono ${
              (latestReading.temperatureCelsius || 0) >= 60 ? 'text-rose-400' :
              (latestReading.temperatureCelsius || 0) >= 45 ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {latestReading.temperatureCelsius?.toFixed(1) || '28.5'} °C
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Threshold: &lt; 45.0 °C</span>
            <span className={latestReading.temperatureCelsius >= 60 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {latestReading.temperatureCelsius >= 60 ? 'CRITICAL' : 'NORMAL'}
            </span>
          </div>
        </div>

        {/* KPI 3: Live Vibration Level Sensor */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Vibration Level
            </span>
            <div className={`p-2 rounded-xl border ${
              (latestReading.vibrationMs2 || 0) >= 7.5 ? 'bg-rose-950 text-rose-400 border-rose-800' :
              'bg-cyan-950 text-cyan-400 border-cyan-800'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className={`text-4xl font-extrabold font-mono ${
              (latestReading.vibrationMs2 || 0) >= 7.5 ? 'text-rose-400' : 'text-cyan-400'
            }`}>
              {latestReading.vibrationMs2?.toFixed(2) || '0.80'}
            </span>
            <span className="text-xs text-slate-400 font-mono">m/s²</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Guide Rail Limit: 5.0</span>
            <span className={latestReading.vibrationMs2 >= 7.5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {latestReading.vibrationMs2 >= 7.5 ? 'EXCESSIVE' : 'STABLE'}
            </span>
          </div>
        </div>

        {/* KPI 4: Door & Motor Status */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Motor & Interlock
            </span>
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Door Interlock:</span>
              <span className={`font-bold ${latestReading.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latestReading.doorSensorState ? 'CLOSED / LOCKED' : 'OPEN'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Motor Current:</span>
              <span className="text-purple-300 font-bold">{latestReading.motorCurrentAmps?.toFixed(1) || '0.8'} A</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Operational Mode:</span>
            <span className="text-cyan-400 font-semibold">{state?.operationalMode || 'NORMAL'}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Streaming Telemetry Graph */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200">Live Sensor Telemetry Feed</h2>
              <p className="text-xs text-slate-400 font-mono">Synchronized with ESP32 Wi-Fi REST payload</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>1000ms Refresh</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentTelemetry}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="id" stroke="#475569" tick={false} />
                <YAxis stroke="#475569" fontSize={11} fontStyle="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="temperatureCelsius" name="Temp (°C)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                <Area type="monotone" dataKey="vibrationMs2" name="Vibration (m/s²)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Floor Dispatch & Emergency Override */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-200">Elevator Dispatch Console</h2>
            <p className="text-xs text-slate-400 font-mono mb-4">Manual command transmission to digital twin</p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Call Target Floor
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => handleCallFloor(fl)}
                    className={`py-3 rounded-xl font-bold font-mono text-sm border transition-all ${
                      state?.currentFloor === fl
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25'
                        : state?.targetFloor === fl
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    FL {fl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Emergency Override Controls
            </span>
            {state?.emergencyStop ? (
              <button
                onClick={handleResetFault}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Emergency Brake</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyStop}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>ENGAGE EMERGENCY BRAKE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
