import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import SensorCard from '../components/SensorCard';
import SafetyAlert from '../components/SafetyAlert';
import TelemetryChart from '../components/TelemetryChart';
import ElevatorTwin from '../components/ElevatorTwin';
import {
  Boxes,
  Thermometer,
  Activity,
  Zap,
  Radio,
  DoorClosed,
  DoorOpen,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function EngineerDashboard() {
  const [telemetry, setTelemetry] = useState([]);
  const [elevatorState, setElevatorState] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [telemetryRes, stateRes, alertsRes] = await Promise.all([
        elevatorApi.getRecentTelemetry('ELV-01', 30),
        elevatorApi.getElevatorState('ELV-01'),
        elevatorApi.getSafetyAlerts('ELV-01', true)
      ]);

      if (telemetryRes.success && telemetryRes.data.length > 0) {
        setIsBackendConnected(true);
        // Reverse array so oldest reading is left and newest is right
        setTelemetry(telemetryRes.data.slice().reverse());
      } else if (telemetryRes.error) {
        setIsBackendConnected(false);
      }

      if (stateRes.success) setElevatorState(stateRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000); // 2-second live refresh
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : {};
  const isAnomaly = latest.isAnomalyDetected || alerts.length > 0;
  const anomalyScore = latest.anomalyScore || 0.0;

  const handleCallFloor = async (floor) => {
    await elevatorApi.sendCommand('CALL_FLOOR', floor);
    fetchDashboardData();
  };

  const handleEmergencyStop = async () => {
    await elevatorApi.sendCommand('EMERGENCY_STOP');
    fetchDashboardData();
  };

  const handleResetFault = async () => {
    await elevatorApi.sendCommand('RESET_FAULT');
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Backend Offline Warning Banner */}
      {!isBackendConnected && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              Backend disconnected. Please make sure Spring Boot is running on port 8080.
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 border border-amber-700 text-amber-100 text-xs font-bold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Prominent Safety Alert Banner */}
      <SafetyAlert isAnomaly={isAnomaly} anomalyScore={anomalyScore} alerts={alerts} />

      {/* SECTION A: Elevator Status Card & Overall Safety Condition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elevator Status Overview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-200 font-mono">
                Elevator System Status • ELV-01
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Primary Passenger Shaft Mechanical Twin
              </p>
            </div>

            {/* SAFETY CONDITION BADGE */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Safety Status:</span>
              {isAnomaly ? (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600 animate-pulse">
                  SAFETY ALERT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SAFE / NORMAL</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] font-mono text-slate-400">Elevator ID</p>
              <p className="text-base font-bold font-mono text-cyan-400 mt-1">ELV-01</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] font-mono text-slate-400">Current Floor</p>
              <p className="text-base font-bold font-mono text-white mt-1">
                Floor {latest.floorHallSensor || elevatorState?.currentFloor || 1}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] font-mono text-slate-400">Door Interlock</p>
              <p className={`text-base font-bold font-mono mt-1 ${latest.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latest.doorSensorState ? 'LOCKED' : 'OPEN'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[11px] font-mono text-slate-400">Last Telemetry</p>
              <p className="text-xs font-bold font-mono text-slate-300 mt-1.5">
                {latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'Live'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Dispatch Console */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 font-mono">Cabin Dispatch & Override</h3>
            <p className="text-xs text-slate-400 font-mono mb-3">Send floor target to elevator controller</p>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((fl) => (
                <button
                  key={fl}
                  onClick={() => handleCallFloor(fl)}
                  className={`py-2.5 rounded-xl font-bold font-mono text-xs border transition-all ${
                    latest.floorHallSensor === fl
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  FL {fl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            {elevatorState?.emergencyStop ? (
              <button
                onClick={handleResetFault}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Emergency System</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyStop}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Brake Engagement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: Detailed Sensor Cards Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 font-mono mb-3 uppercase tracking-wider">
          Real-Time Sensor Telemetry Metrics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature Sensor */}
          <SensorCard
            title="Cabin Temperature"
            value={latest.temperatureCelsius ? latest.temperatureCelsius.toFixed(1) : '28.5'}
            unit="°C"
            icon={Thermometer}
            status={latest.temperatureCelsius >= 45 ? 'HIGH TEMP' : 'STABLE'}
            statusColor={latest.temperatureCelsius >= 60 ? 'rose' : latest.temperatureCelsius >= 45 ? 'amber' : 'cyan'}
            subtitle="Limit: < 45.0°C"
          />

          {/* Vibration Sensor */}
          <SensorCard
            title="Shaft Vibration"
            value={latest.vibrationMs2 ? latest.vibrationMs2.toFixed(2) : '0.80'}
            unit="m/s²"
            icon={Activity}
            status={latest.vibrationMs2 >= 5.0 ? 'EXCESSIVE' : 'NORMAL'}
            statusColor={latest.vibrationMs2 >= 7.5 ? 'rose' : latest.vibrationMs2 >= 5.0 ? 'amber' : 'cyan'}
            subtitle="Limit: < 5.0 m/s²"
          />

          {/* Motor Current */}
          <SensorCard
            title="Motor Current Draw"
            value={latest.motorCurrentAmps ? latest.motorCurrentAmps.toFixed(1) : '0.8'}
            unit="A"
            icon={Zap}
            status="NOMINAL"
            statusColor="cyan"
            subtitle="Rating: 15.0A"
          />

          {/* Anomaly Score */}
          <SensorCard
            title="AI Anomaly Score"
            value={anomalyScore ? anomalyScore.toFixed(2) : '0.02'}
            unit=""
            icon={Sparkles}
            status={isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL'}
            statusColor={isAnomaly ? 'rose' : 'emerald'}
            subtitle="Range: 0.0 - 1.0"
          />
        </div>
      </div>

      {/* SECTION C: Live Charts & Elevator Twin Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Telemetry Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-200 font-mono">
                Live Sensor Telemetry Streams
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Polling GET /api/telemetry/recent every 2000ms
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Live • Connected</span>
            </div>
          </div>

          <TelemetryChart data={telemetry} type="all" />
        </div>

        {/* Live Elevator Twin Visualizer */}
        <div>
          <ElevatorTwin
            elevatorId={latest.elevatorId || 'ELV-01'}
            currentFloor={latest.floorHallSensor || 1}
            doorStatus={latest.doorSensorState ? 'CLOSED' : 'OPEN'}
            operationalMode={elevatorState?.operationalMode || 'NORMAL'}
            temperatureCelsius={latest.temperatureCelsius || 28.5}
            vibrationMs2={latest.vibrationMs2 || 0.8}
            motorCurrentAmps={latest.motorCurrentAmps || 0.8}
            isAnomalyDetected={isAnomaly}
            onCallFloor={handleCallFloor}
          />
        </div>
      </div>
    </div>
  );
}
