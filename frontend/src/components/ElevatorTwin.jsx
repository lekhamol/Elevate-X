import React from 'react';
import { Boxes, Zap, Activity, Thermometer, ShieldCheck, AlertTriangle, Sparkles, Radio } from 'lucide-react';

export default function ElevatorTwin({ telemetry = {}, isConnected = true }) {
  // Extract values from telemetry record with clean defaults
  const elevatorId = telemetry.elevatorId || 'ELV-01';
  const currentFloor = telemetry.floorHallSensor || 1;
  
  // Explicit User Directive: true -> DOORS OPEN, false -> DOORS CLOSED
  const isDoorsOpen = Boolean(telemetry.doorSensorState);
  
  const temperatureCelsius = telemetry.temperatureCelsius !== undefined ? telemetry.temperatureCelsius : 28.8;
  const vibrationMs2 = telemetry.vibrationMs2 !== undefined ? telemetry.vibrationMs2 : 0.97;
  const motorCurrentAmps = telemetry.motorCurrentAmps !== undefined ? telemetry.motorCurrentAmps : 0.8;
  const anomalyScore = telemetry.anomalyScore !== undefined ? telemetry.anomalyScore : 0.02;
  const isAnomalyDetected = Boolean(telemetry.isAnomalyDetected);

  // Map floor 1-5 to bottom position percentage:
  // Floor 1 -> 5%, Floor 2 -> 25%, Floor 3 -> 45%, Floor 4 -> 65%, Floor 5 -> 85%
  const bottomPosition = (Math.max(1, Math.min(5, currentFloor)) - 1) * 20 + 5;

  return (
    <div className={`glass-panel p-6 rounded-2xl border transition-all duration-500 space-y-5 relative overflow-hidden ${
      isAnomalyDetected
        ? 'border-rose-600/80 shadow-2xl shadow-rose-950/50 bg-slate-950/95 ring-2 ring-rose-500/30'
        : 'border-slate-800 shadow-xl bg-slate-950/90'
    }`}>
      {/* Top Header & Safety Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isAnomalyDetected
              ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse'
              : 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
          }`}>
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">Digital Twin • {elevatorId}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                Live ESP32 Stream
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Real-Time Sensor Telemetry Representation</p>
          </div>
        </div>

        {/* OVERALL SAFETY STATUS BADGE */}
        <div className="flex items-center space-x-2">
          {isAnomalyDetected ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-xs font-mono font-bold flex items-center space-x-2 shadow-lg shadow-rose-950/60 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>SAFETY ALERT</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-2 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SAFE / NORMAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Key Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase">Elevator ID</span>
          <p className="font-bold text-cyan-400 text-sm">{elevatorId}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase">Current Floor</span>
          <p className="font-bold text-white text-sm">Floor {currentFloor}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase">Door State</span>
          <p className={`font-bold text-sm ${isDoorsOpen ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isDoorsOpen ? 'DOORS OPEN' : 'DOORS CLOSED'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase">Anomaly Score</span>
          <p className={`font-bold text-sm ${isAnomalyDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {anomalyScore.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Visual Elevator Shaft & Cabin Canvas */}
      <div className={`w-full h-[420px] relative rounded-2xl border bg-slate-950 overflow-hidden flex items-center justify-center transition-all duration-500 ${
        isAnomalyDetected ? 'border-rose-600/70 shadow-inner shadow-rose-950/60' : 'border-slate-800'
      }`}>
        {/* Steel Cable Pulley Lines */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/40 via-slate-700 to-slate-800 z-10" />

        {/* Floor Indicator Markings (Floors 5 to 1) */}
        <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-6 z-20">
          {[5, 4, 3, 2, 1].map((fl) => {
            const isActive = currentFloor === fl;
            return (
              <div key={fl} className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl font-mono text-xs font-extrabold flex items-center justify-center transition-all duration-300 border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800'
                  }`}
                >
                  F{fl}
                </div>
                <div className={`h-0.5 transition-all ${isActive ? 'w-8 bg-cyan-400' : 'w-4 bg-slate-800'}`} />
                <span className={`text-[10px] font-mono hidden sm:inline ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                  {fl === 1 ? 'Floor 1 (Lobby)' : `Floor ${fl}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Animated Elevator Cabin Car */}
        <div
          className={`elevator-car absolute w-56 sm:w-72 h-32 rounded-2xl border-2 flex flex-col justify-between p-3.5 z-30 transition-all duration-700 ease-in-out ${
            isAnomalyDetected
              ? 'bg-rose-950/95 border-rose-500 shadow-2xl shadow-rose-600/50 animate-pulse'
              : 'bg-slate-900/95 border-cyan-500/80 shadow-2xl shadow-cyan-950/50'
          }`}
          style={{ bottom: `${bottomPosition}%` }}
        >
          {/* Cabin Header Info */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-1.5">
            <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Boxes className="w-3.5 h-3.5" />
              <span>{elevatorId} • Floor {currentFloor}</span>
            </span>
            <span className="text-slate-300 font-semibold">{temperatureCelsius.toFixed(1)} °C</span>
          </div>

          {/* Sliding Doors Visualizer Animation */}
          <div className="relative w-full h-12 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-between p-1 my-1">
            {/* Left Sliding Door */}
            <div
              className={`h-full bg-slate-800 border-r border-cyan-500/40 rounded-l-lg transition-all duration-700 ease-in-out ${
                isDoorsOpen ? 'w-2 bg-slate-900' : 'w-1/2 bg-slate-800'
              }`}
            />

            {/* Interior Preview Label */}
            <div className={`text-[10px] font-mono font-bold z-10 transition-colors ${
              isDoorsOpen ? 'text-amber-300 animate-pulse' : 'text-emerald-400'
            }`}>
              {isDoorsOpen ? 'DOORS OPEN' : 'DOORS CLOSED'}
            </div>

            {/* Right Sliding Door */}
            <div
              className={`h-full bg-slate-800 border-l border-cyan-500/40 rounded-r-lg transition-all duration-700 ease-in-out ${
                isDoorsOpen ? 'w-2 bg-slate-900' : 'w-1/2 bg-slate-800'
              }`}
            />
          </div>

          {/* Cabin Footer Telemetry Indicators */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Vib: {vibrationMs2.toFixed(2)} m/s²</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Amp: {motorCurrentAmps.toFixed(1)} A</span>
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Telemetry Footer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Temperature</span>
          <p className="text-cyan-300 font-bold text-sm">{temperatureCelsius.toFixed(1)} °C</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Vibration</span>
          <p className="text-amber-300 font-bold text-sm">{vibrationMs2.toFixed(2)} m/s²</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Motor Current</span>
          <p className="text-purple-300 font-bold text-sm">{motorCurrentAmps.toFixed(1)} A</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Overall Condition</span>
          <p className={`font-bold text-xs ${isAnomalyDetected ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}`}>
            {isAnomalyDetected ? 'SAFETY ALERT' : 'SAFE / NORMAL'}
          </p>
        </div>
      </div>
    </div>
  );
}
