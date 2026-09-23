import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import SensorCard from '../components/SensorCard';
import SafetyAlert from '../components/SafetyAlert';
import ElevatorTwin from '../components/ElevatorTwin';
import {
  Boxes,
  Thermometer,
  Activity,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Radio,
  DoorClosed,
  CheckCircle2
} from 'lucide-react';

export default function OperatorDashboard() {
  const [telemetry, setTelemetry] = useState([]);
  const [elevatorState, setElevatorState] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  const fetchData = async () => {
    try {
      const [telemetryRes, stateRes, alertsRes] = await Promise.all([
        elevatorApi.getRecentTelemetry('ELV-01', 10),
        elevatorApi.getElevatorState('ELV-01'),
        elevatorApi.getSafetyAlerts('ELV-01', true)
      ]);

      if (telemetryRes.success && telemetryRes.data.length > 0) {
        setIsBackendConnected(true);
        setTelemetry(telemetryRes.data.slice().reverse());
      } else if (telemetryRes.error) {
        setIsBackendConnected(false);
      }

      if (stateRes.success) setElevatorState(stateRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err) {
      console.warn(err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : {};
  const isAnomaly = latest.isAnomalyDetected || alerts.length > 0;

  return (
    <div className="space-y-6">
      {/* Offline Alert */}
      {!isBackendConnected && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Backend disconnected. Please make sure Spring Boot is running on port 8080.</span>
          </div>
        </div>
      )}

      {/* Prominent Safety Alert Banner */}
      <SafetyAlert isAnomaly={isAnomaly} anomalyScore={latest.anomalyScore || 0} alerts={alerts} />

      {/* Operator Main Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card & Overview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Building Operator Operations View
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Monitoring Passenger Lift • Elevator ID: ELV-01
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Safety Status:</span>
              {isAnomaly ? (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600 animate-pulse">
                  SAFETY ALERT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SAFE / NORMAL</span>
                </span>
              )}
            </div>
          </div>

          {/* Core Operator Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Current Floor</span>
              <p className="text-3xl font-extrabold font-mono text-cyan-400">
                Floor {latest.floorHallSensor || 1}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Lobby / Shaft Position</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Door Interlock</span>
              <p className={`text-2xl font-extrabold font-mono ${latest.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latest.doorSensorState ? 'CLOSED & LOCKED' : 'DOORS OPEN'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Limit Switch Active</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Operating Status</span>
              <p className="text-2xl font-extrabold font-mono text-slate-100">
                {elevatorState?.operationalMode || 'NORMAL'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Automatic Control</p>
            </div>
          </div>

          {/* Active Safety Hazards List for Operator */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              Active Safety Notifications
            </h3>

            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No active hazards reported for Elevator ELV-01. All parameters normal.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-200">{a.title}</span>
                      <p className="text-[11px] text-rose-300 mt-0.5">{a.message}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-900 text-rose-100 font-bold border border-rose-700">
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Digital Twin Visualization for Operator */}
        <div>
          <ElevatorTwin
            elevatorId="ELV-01"
            currentFloor={latest.floorHallSensor || 1}
            doorStatus={latest.doorSensorState ? 'CLOSED' : 'OPEN'}
            operationalMode={elevatorState?.operationalMode || 'NORMAL'}
            temperatureCelsius={latest.temperatureCelsius || 28.5}
            vibrationMs2={latest.vibrationMs2 || 0.8}
            motorCurrentAmps={latest.motorCurrentAmps || 0.8}
            isAnomalyDetected={isAnomaly}
          />
        </div>
      </div>
    </div>
  );
}
