import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import ElevatorTwin from '../components/ElevatorTwin';
import {
  Boxes,
  Sliders,
  Flame,
  Activity,
  DoorOpen,
  Zap,
  AlertTriangle,
  RotateCcw,
  Radio,
  ShieldCheck
} from 'lucide-react';

export default function DigitalTwin() {
  const [telemetryRecord, setTelemetryRecord] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [activeFaults, setActiveFaults] = useState({
    OVER_TEMP: false,
    HIGH_VIBRATION: false,
    UNSAFE_DOOR: false,
    MOTOR_STALL: false
  });

  const fetchLatestTelemetry = async () => {
    try {
      const res = await elevatorApi.getRecentTelemetry('ELV-01', 1);
      if (res.success && res.data && res.data.length > 0) {
        setIsBackendOnline(true);
        // Use latest telemetry record from http://localhost:8080/api/telemetry/recent
        setTelemetryRecord(res.data[0]);
      } else if (res.error) {
        setIsBackendOnline(false);
      }
    } catch (err) {
      console.warn('Digital Twin fetch error:', err);
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchLatestTelemetry();
    // Poll the telemetry API every 2 seconds as specified
    const interval = setInterval(fetchLatestTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCallFloor = async (floor) => {
    await elevatorApi.sendCommand('CALL_FLOOR', floor);
    fetchLatestTelemetry();
  };

  const handleToggleDoors = async () => {
    if (!telemetryRecord) return;
    // If doors are open (doorSensorState is true), close them, else open
    const action = telemetryRecord.doorSensorState ? 'CLOSE_DOORS' : 'OPEN_DOORS';
    await elevatorApi.sendCommand(action);
    fetchLatestTelemetry();
  };

  const handleEmergencyStop = async () => {
    await elevatorApi.sendCommand('EMERGENCY_STOP');
    fetchLatestTelemetry();
  };

  const handleResetFault = async () => {
    await elevatorApi.sendCommand('RESET_FAULT');
    fetchLatestTelemetry();
  };

  const handleInjectFault = async (faultType) => {
    const nextState = !activeFaults[faultType];
    setActiveFaults((prev) => ({ ...prev, [faultType]: nextState }));
    await elevatorApi.injectFault(faultType, nextState);
    fetchLatestTelemetry();
  };

  const isAnomaly = Boolean(telemetryRecord?.isAnomalyDetected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-cyan-400" />
            <span>Interactive Elevator Digital Twin • ELV-01</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            GET http://localhost:8080/api/telemetry/recent • Polling every 2000ms
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              isBackendOnline
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isBackendOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span>{isBackendOnline ? 'Live • Connected' : 'Backend Disconnected'}</span>
          </div>

          <button
            onClick={handleToggleDoors}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all"
          >
            <DoorOpen className="w-4 h-4" />
            <span>Toggle Doors</span>
          </button>
        </div>
      </div>

      {/* Disconnected Error Alert Banner */}
      {!isBackendOnline && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-mono flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              Backend disconnected. Please make sure Spring Boot is running on port 8080.
            </span>
          </div>
          <button
            onClick={fetchLatestTelemetry}
            className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Animated Digital Twin Component */}
        <div className="lg:col-span-2">
          <ElevatorTwin
            telemetry={telemetryRecord || {}}
            isConnected={isBackendOnline}
          />
        </div>

        {/* Control Console & Fault Injector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-rose-400">
                <Sliders className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-200 font-mono">Safety Fault Injector</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Simulator Control
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4">
              Inject synthetic hardware anomalies to test rule engine responses
            </p>

            <div className="space-y-3">
              {[
                { id: 'OVER_TEMP', label: 'Over-Temperature (>60°C)', desc: 'Triggers thermal warning & safety alert', icon: Flame },
                { id: 'HIGH_VIBRATION', label: 'Excessive Vibration (>7.5m/s²)', desc: 'Simulates guide rail mechanical defect', icon: Activity },
                { id: 'UNSAFE_DOOR', label: 'Unsafe Door Interlock', desc: 'Simulates door open during transit', icon: DoorOpen },
                { id: 'MOTOR_STALL', label: 'Motor Current Overload', desc: 'Simulates drive motor stall', icon: Zap }
              ].map((fault) => {
                const Icon = fault.icon;
                const active = activeFaults[fault.id];
                return (
                  <button
                    key={fault.id}
                    type="button"
                    onClick={() => handleInjectFault(fault.id)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start justify-between ${
                      active
                        ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg shadow-rose-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${active ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold font-mono">{fault.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{fault.desc}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      active ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {active ? 'INJECTED' : 'NORMAL'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleEmergencyStop}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-600/30 font-mono"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ENGAGE EMERGENCY BRAKE</span>
            </button>

            <button
              type="button"
              onClick={handleResetFault}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-all border border-slate-700 font-mono"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reset Safety Interlocks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
