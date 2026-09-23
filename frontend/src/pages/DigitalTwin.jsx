import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import ElevatorTwin from '../components/ElevatorTwin';
import { Boxes, Sliders, Flame, Activity, DoorOpen, Zap, AlertTriangle, RotateCcw } from 'lucide-react';

export default function DigitalTwin() {
  const [telemetry, setTelemetry] = useState({});
  const [state, setState] = useState(null);
  const [activeFaults, setActiveFaults] = useState({
    OVER_TEMP: false,
    HIGH_VIBRATION: false,
    UNSAFE_DOOR: false,
    MOTOR_STALL: false
  });

  const fetchData = async () => {
    try {
      const [stateRes, telemetryRes] = await Promise.all([
        elevatorApi.getElevatorState('ELV-01'),
        elevatorApi.getRecentTelemetry('ELV-01', 1)
      ]);
      if (stateRes.success) setState(stateRes.data);
      if (telemetryRes.success && telemetryRes.data.length > 0) {
        setTelemetry(telemetryRes.data[0]);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCallFloor = async (floor) => {
    await elevatorApi.sendCommand('CALL_FLOOR', floor);
    fetchData();
  };

  const handleToggleDoors = async () => {
    const action = telemetry.doorSensorState ? 'OPEN_DOORS' : 'CLOSE_DOORS';
    await elevatorApi.sendCommand(action);
    fetchData();
  };

  const handleEmergencyStop = async () => {
    await elevatorApi.sendCommand('EMERGENCY_STOP');
    fetchData();
  };

  const handleResetFault = async () => {
    await elevatorApi.sendCommand('RESET_FAULT');
    fetchData();
  };

  const handleInjectFault = async (faultType) => {
    const nextState = !activeFaults[faultType];
    setActiveFaults((prev) => ({ ...prev, [faultType]: nextState }));
    await elevatorApi.injectFault(faultType, nextState);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-cyan-400" />
            <span>Interactive 3D/2D Digital Twin Model</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synchronized physics state model fed by ESP32 sensor telemetry
          </p>
        </div>

        <button
          onClick={handleToggleDoors}
          className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold flex items-center space-x-2 font-mono"
        >
          <DoorOpen className="w-4 h-4" />
          <span>Toggle Cabin Doors</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Twin Main Viewport */}
        <div className="lg:col-span-2">
          <ElevatorTwin
            elevatorId="ELV-01"
            currentFloor={telemetry.floorHallSensor || state?.currentFloor || 1}
            doorStatus={telemetry.doorSensorState ? 'CLOSED' : 'OPEN'}
            operationalMode={state?.operationalMode || 'NORMAL'}
            temperatureCelsius={telemetry.temperatureCelsius || 28.5}
            vibrationMs2={telemetry.vibrationMs2 || 0.8}
            motorCurrentAmps={telemetry.motorCurrentAmps || 0.8}
            isAnomalyDetected={telemetry.isAnomalyDetected}
            onCallFloor={handleCallFloor}
          />
        </div>

        {/* Fault Injection Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 mb-1">
              <Sliders className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-200 font-mono">Safety Fault Injector</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Simulate physical hardware anomalies to test rule engine response
            </p>

            <div className="space-y-3">
              {[
                { id: 'OVER_TEMP', label: 'Over-Temperature (>60°C)', desc: 'Triggers critical thermal alert', icon: Flame },
                { id: 'HIGH_VIBRATION', label: 'Excessive Vibration (>7.5m/s²)', desc: 'Simulates guide rail damage', icon: Activity },
                { id: 'UNSAFE_DOOR', label: 'Door Open During Transit', desc: 'Triggers emergency brake interlock', icon: DoorOpen },
                { id: 'MOTOR_STALL', label: 'Motor Current Overload', desc: 'Simulates mechanical stall', icon: Zap }
              ].map((fault) => {
                const Icon = fault.icon;
                const active = activeFaults[fault.id];
                return (
                  <button
                    key={fault.id}
                    onClick={() => handleInjectFault(fault.id)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start justify-between ${
                      active
                        ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg'
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
            {state?.emergencyStop ? (
              <button
                onClick={handleResetFault}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg font-mono"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Emergency System</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyStop}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-600/30 font-mono"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Engage Emergency Brake</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
