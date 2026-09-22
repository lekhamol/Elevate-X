import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  Boxes,
  DoorOpen,
  DoorClosed,
  Zap,
  Flame,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function LiveDigitalTwin() {
  const [state, setState] = useState(null);
  const [latestReading, setLatestReading] = useState({});
  const [activeFaults, setActiveFaults] = useState({
    OVER_TEMP: false,
    HIGH_VIBRATION: false,
    UNSAFE_DOOR: false,
    MOTOR_STALL: false
  });

  const fetchTwinState = async () => {
    try {
      const [stateRes, telemetryRes] = await Promise.all([
        elevatorApi.getElevatorState('ELV-01'),
        elevatorApi.getRecentTelemetry('ELV-01', 1)
      ]);
      setState(stateRes.data);
      if (telemetryRes.data && telemetryRes.data.length > 0) {
        setLatestReading(telemetryRes.data[0]);
      }
    } catch (err) {
      console.error('Error fetching twin state:', err);
    }
  };

  useEffect(() => {
    fetchTwinState();
    const interval = setInterval(fetchTwinState, 800); // High frequency 800ms updates
    return () => clearInterval(interval);
  }, []);

  const handleCallFloor = async (floor) => {
    try {
      await elevatorApi.sendCommand('CALL_FLOOR', floor);
      fetchTwinState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDoors = async () => {
    if (!state) return;
    const action = state.doorStatus === 'DOOR_OPEN' ? 'CLOSE_DOORS' : 'OPEN_DOORS';
    try {
      await elevatorApi.sendCommand(action);
      fetchTwinState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await elevatorApi.sendCommand('EMERGENCY_STOP');
      fetchTwinState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFault = async () => {
    try {
      await elevatorApi.sendCommand('RESET_FAULT');
      fetchTwinState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectFault = async (faultType) => {
    const nextState = !activeFaults[faultType];
    setActiveFaults((prev) => ({ ...prev, [faultType]: nextState }));
    try {
      await elevatorApi.injectFault(faultType, nextState);
      fetchTwinState();
    } catch (err) {
      console.error(err);
    }
  };

  // Convert currentFloor (1 to 5) into bottom percentage offset for vertical movement
  // Floor 1 = 5%, Floor 2 = 25%, Floor 3 = 45%, Floor 4 = 65%, Floor 5 = 85%
  const currentFloor = state?.currentFloor || 1;
  const bottomPosition = (currentFloor - 1) * 20 + 5;

  const isDoorsOpen = state?.doorStatus === 'DOOR_OPEN' || latestReading.doorSensorState === false;
  const isThermalHazard = (latestReading.temperatureCelsius || 0) >= 60;
  const isThermalWarning = (latestReading.temperatureCelsius || 0) >= 45;
  const isVibHazard = (latestReading.vibrationMs2 || 0) >= 7.5;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-cyan-400" />
            <span>Interactive 3D/2D Live Digital Twin Shaft</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synchronized physics state model fed by ESP32 sensor telemetry
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
            Cabin Mode: <span className="font-bold text-white">{state?.operationalMode || 'NORMAL'}</span>
          </div>
          <button
            onClick={handleToggleDoors}
            className="px-4 py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            {isDoorsOpen ? <DoorClosed className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
            <span>{isDoorsOpen ? 'Close Doors' : 'Open Doors'}</span>
          </button>
        </div>
      </div>

      {/* Digital Twin Shaft & Telemetry Overlay Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animated Elevator Shaft Container */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 z-20">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                Elevator Shaft Simulation
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                state?.emergencyStop ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {state?.emergencyStop ? 'EMERGENCY STOP' : 'SAFETY INTERLOCK OK'}
              </span>
            </div>

            {/* Motor Pulley Visualizer Header */}
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <div className={`w-6 h-6 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center ${
                state?.direction === 'MOVING_UP' ? 'animate-spin' :
                state?.direction === 'MOVING_DOWN' ? 'animate-spin' : ''
              }`}>
                <Zap className="w-3 h-3 text-cyan-400" />
              </div>
              <span>Motor: {state?.motorStatus || 'IDLE'}</span>
            </div>
          </div>

          {/* Elevator Shaft Frame (Visual Twin Canvas) */}
          <div className="elevator-shaft-bg w-full h-[450px] relative flex items-center justify-center">
            {/* Cable Wires */}
            <div className="elevator-cable left-1/2 -translate-x-1/2 h-full" />

            {/* Floor Guide Markings (Floors 5 to 1) */}
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-6 z-20">
              {[5, 4, 3, 2, 1].map((fl) => (
                <div key={fl} className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCallFloor(fl)}
                    className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all border ${
                      currentFloor === fl
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
                        : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    F{fl}
                  </button>
                  <div className="h-0.5 w-8 bg-slate-700/60" />
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    {fl === 1 ? 'Lobby / Base' : fl === 5 ? 'Penthouse / Top' : `Level ${fl}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Animated Elevator Cabin Car */}
            <div
              className={`elevator-car absolute w-48 sm:w-64 h-24 rounded-2xl border-2 flex flex-col justify-between p-3 z-30 transition-all duration-700 ${
                isThermalHazard ? 'bg-rose-950/90 border-rose-500 animate-pulse-red' :
                isThermalWarning ? 'bg-amber-950/90 border-amber-500' :
                'bg-slate-900/95 border-cyan-500/80'
              }`}
              style={{ bottom: `${bottomPosition}%` }}
            >
              {/* Cabin Header Info */}
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-1.5">
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>CABIN FL-{currentFloor}</span>
                </span>
                <span className={`font-semibold ${isThermalHazard ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                  {latestReading.temperatureCelsius?.toFixed(1) || '28.5'} °C
                </span>
              </div>

              {/* Doors Visualizer Animation */}
              <div className="relative w-full h-10 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-between p-1">
                {/* Left Door Panel */}
                <div
                  className={`elevator-door h-full bg-slate-800 border-r border-cyan-500/40 rounded-l-lg ${
                    isDoorsOpen ? 'w-2' : 'w-1/2'
                  }`}
                />
                
                {/* Center Cabin Interior Preview */}
                <div className="text-[10px] font-mono text-slate-400 z-10 font-semibold">
                  {isDoorsOpen ? 'DOORS OPEN' : 'DOORS LOCKED'}
                </div>

                {/* Right Door Panel */}
                <div
                  className={`elevator-door h-full bg-slate-800 border-l border-cyan-500/40 rounded-r-lg ${
                    isDoorsOpen ? 'w-2' : 'w-1/2'
                  }`}
                />
              </div>

              {/* Cabin Footer Vibration & Speed Bar */}
              <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                <span className="text-slate-400">Vib: {latestReading.vibrationMs2?.toFixed(2) || '0.8'} m/s²</span>
                <span className="text-cyan-300">{state?.direction || 'IDLE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Fault Injector & Telemetry Control Deck */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 mb-1">
              <Sliders className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-200">Safety Fault Injector</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Simulate physical hardware sensor anomalies to evaluate Spring Boot Safety Rule Engine
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
                        ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg shadow-rose-900/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${active ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{fault.label}</span>
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

          {/* Quick Emergency Override */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            {state?.emergencyStop ? (
              <button
                onClick={handleResetFault}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Emergency System</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyStop}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-600/30"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>TRIGGER EMERGENCY STOP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
