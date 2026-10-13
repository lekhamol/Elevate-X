import React from 'react';
import {
  Boxes,
  Zap,
  Activity,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  ArrowUp,
  ArrowDown,
  Minus,
  DoorOpen,
  DoorClosed
} from 'lucide-react';

export default function ElevatorTwin({
  telemetry = {},
  direction: propDirection,
  onCallFloor,
  isConnected = true
}) {
  // Extract values from telemetry record with clean defaults
  const elevatorId = telemetry.elevatorId || 'ELV-01';
  const currentFloor = telemetry.floorHallSensor || 1;
  const isDoorsOpen = Boolean(telemetry.doorSensorState === false || telemetry.doorState === false);
  const direction = (telemetry.direction || propDirection || 'IDLE').toUpperCase();

  const temperatureCelsius = telemetry.temperatureCelsius !== undefined ? telemetry.temperatureCelsius : (telemetry.temperature || 28.5);
  const vibrationMs2 = telemetry.vibrationMs2 !== undefined ? telemetry.vibrationMs2 : (telemetry.vibration || 0.85);
  const motorCurrentAmps = telemetry.motorCurrentAmps !== undefined ? telemetry.motorCurrentAmps : (telemetry.motorCurrent || 0.8);
  const anomalyScore = telemetry.anomalyScore !== undefined ? telemetry.anomalyScore : 0.02;
  const isAnomalyDetected = Boolean(telemetry.isAnomalyDetected);

  // Door Malfunction condition: door reported open while elevator is in motion!
  const isDoorFault = isDoorsOpen && (direction.includes('UP') || direction.includes('DOWN'));
  const isVibrationFault = vibrationMs2 >= 5.0;

  // Health Score (0 - 100) & Classification (Normal, Warning, Attention, Critical)
  let healthScore = telemetry.healthScore;
  let healthStatus = telemetry.healthStatus;

  if (healthScore === undefined || healthScore === null) {
    let computed = 100.0;
    if (temperatureCelsius > 60) computed -= 35;
    else if (temperatureCelsius > 45) computed -= 15;
    if (vibrationMs2 > 8.5) computed -= 30;
    else if (vibrationMs2 > 5.0) computed -= 15;
    if (motorCurrentAmps > 12.5) computed -= 25;
    if (isDoorFault) computed -= 30;
    if (isAnomalyDetected) computed -= 20;
    healthScore = Math.max(0, Math.min(100, Math.round(computed)));

    if (healthScore >= 85) healthStatus = 'Normal';
    else if (healthScore >= 70) healthStatus = 'Warning';
    else if (healthScore >= 50) healthStatus = 'Attention';
    else healthStatus = 'Critical';
  }

  // Get color styles for Health Score
  const getHealthBadgeStyle = () => {
    switch (healthStatus?.toLowerCase()) {
      case 'critical':
        return { badge: 'bg-rose-950 text-rose-300 border-rose-700', bar: 'bg-rose-500', text: 'text-rose-400' };
      case 'attention':
        return { badge: 'bg-amber-950 text-amber-300 border-amber-700', bar: 'bg-amber-500', text: 'text-amber-400' };
      case 'warning':
        return { badge: 'bg-cyan-950 text-cyan-300 border-cyan-700', bar: 'bg-cyan-500', text: 'text-cyan-400' };
      case 'normal':
      default:
        return { badge: 'bg-emerald-950 text-emerald-300 border-emerald-700', bar: 'bg-emerald-500', text: 'text-emerald-400' };
    }
  };

  const healthStyle = getHealthBadgeStyle();

  // Map floor 1-5 to bottom position percentage:
  // Floor 1 -> 5%, Floor 2 -> 25%, Floor 3 -> 45%, Floor 4 -> 65%, Floor 5 -> 85%
  const bottomPosition = (Math.max(1, Math.min(5, currentFloor)) - 1) * 20 + 5;

  return (
    <div className={`glass-panel p-6 rounded-2xl border transition-all duration-500 space-y-5 relative overflow-hidden ${
      isAnomalyDetected || isDoorFault || isVibrationFault || healthScore < 50
        ? 'border-rose-600/80 shadow-2xl shadow-rose-950/50 bg-slate-950/95 ring-2 ring-rose-500/30'
        : 'border-slate-800 shadow-xl bg-slate-950/90'
    }`}>
      {/* Top Header & Direction / Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
            isAnomalyDetected || isDoorFault || isVibrationFault || healthScore < 50
              ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse'
              : 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
          }`}>
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">Digital Twin • {elevatorId}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                Floors 1 - 5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Current Floor: <span className="font-bold text-white">Floor {currentFloor}</span> • Direction:{' '}
              <span className={`font-bold ${
                direction.includes('UP') ? 'text-cyan-400' : direction.includes('DOWN') ? 'text-blue-400' : 'text-slate-300'
              }`}>{direction}</span>
            </p>
          </div>
        </div>

        {/* Direction & Overall Safety Status */}
        <div className="flex items-center space-x-2.5">
          {/* Movement Direction Indicator Badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 ${
            direction.includes('UP')
              ? 'bg-cyan-950/90 border-cyan-700 text-cyan-300'
              : direction.includes('DOWN')
              ? 'bg-blue-950/90 border-blue-700 text-blue-300'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            {direction.includes('UP') && <ArrowUp className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
            {direction.includes('DOWN') && <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />}
            {direction === 'IDLE' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span>DIR: {direction}</span>
          </div>

          {/* Safety / Anomaly Badge */}
          {isAnomalyDetected || isDoorFault || isVibrationFault || healthScore < 50 ? (
            <div className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950/50 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>SAFETY ALERT</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NORMAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Elevator Shaft & Cabin Canvas */}
      <div className={`w-full h-[450px] relative rounded-2xl border bg-slate-950 overflow-hidden flex items-center justify-center transition-all duration-500 ${
        isAnomalyDetected || isDoorFault || isVibrationFault || healthScore < 50
          ? 'border-rose-600/70 shadow-inner shadow-rose-950/60'
          : 'border-slate-800'
      }`}>
        {/* Steel Guide Rails (Left and Right) */}
        <div className="absolute left-28 top-0 bottom-0 w-0.5 bg-slate-800/80 z-10" />
        <div className="absolute right-12 top-0 bottom-0 w-0.5 bg-slate-800/80 z-10" />

        {/* Steel Pulley Suspension Cable connected to car center */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/50 via-slate-600 to-slate-800 z-10" />

        {/* Floor Landing Indicators & Buttons (Floors 5 down to 1) */}
        <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-6 z-20">
          {[5, 4, 3, 2, 1].map((fl) => {
            const isActive = currentFloor === fl;
            return (
              <div key={fl} className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => onCallFloor && onCallFloor(fl)}
                  title={`Call elevator to Floor ${fl}`}
                  className={`w-10 h-10 rounded-xl font-mono text-xs font-extrabold flex items-center justify-center transition-all duration-300 border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  F{fl}
                </button>
                <div className={`h-0.5 transition-all ${isActive ? 'w-8 bg-cyan-400' : 'w-4 bg-slate-800'}`} />
                <span className={`text-[10px] font-mono hidden sm:inline ${
                  isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
                }`}>
                  {fl === 1 ? 'Floor 1 (Lobby)' : fl === 5 ? 'Floor 5 (Top)' : `Floor ${fl}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Animated Elevator Cabin Car */}
        <div
          className={`elevator-car absolute w-56 sm:w-72 h-32 rounded-2xl border-2 flex flex-col justify-between p-3.5 z-30 transition-all duration-700 ease-in-out ${
            isAnomalyDetected || isDoorFault || isVibrationFault || healthScore < 50
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

            <span className={`font-semibold flex items-center space-x-1 ${
              direction.includes('UP') ? 'text-cyan-300' : direction.includes('DOWN') ? 'text-blue-300' : 'text-slate-400'
            }`}>
              {direction.includes('UP') && <ArrowUp className="w-3 h-3 text-cyan-400" />}
              {direction.includes('DOWN') && <ArrowDown className="w-3 h-3 text-blue-400" />}
              <span>{direction}</span>
            </span>
          </div>

          {/* Sliding Doors Visualizer Animation */}
          <div className={`relative w-full h-12 bg-slate-950 rounded-xl border overflow-hidden flex items-center justify-between p-1 my-1 transition-colors ${
            isDoorFault ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
          }`}>
            {/* Left Sliding Door */}
            <div
              className={`h-full border-r transition-all duration-700 ease-in-out ${
                isDoorsOpen
                  ? 'w-2 bg-slate-900 border-cyan-500/20'
                  : 'w-1/2 bg-slate-800 border-cyan-500/40'
              } rounded-l-lg`}
            />

            {/* Interior Preview Label */}
            <div className={`text-[10px] font-mono font-bold z-10 transition-colors flex items-center space-x-1 ${
              isDoorFault
                ? 'text-rose-400 animate-pulse'
                : isDoorsOpen
                ? 'text-amber-300 animate-pulse'
                : 'text-emerald-400'
            }`}>
              {isDoorFault ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>DOOR FAULT (OPEN IN TRANSIT)</span>
                </>
              ) : isDoorsOpen ? (
                <>
                  <DoorOpen className="w-3 h-3 text-amber-300" />
                  <span>DOORS OPEN</span>
                </>
              ) : (
                <>
                  <DoorClosed className="w-3 h-3 text-emerald-400" />
                  <span>DOORS CLOSED</span>
                </>
              )}
            </div>

            {/* Right Sliding Door */}
            <div
              className={`h-full border-l transition-all duration-700 ease-in-out ${
                isDoorsOpen
                  ? 'w-2 bg-slate-900 border-cyan-500/20'
                  : 'w-1/2 bg-slate-800 border-cyan-500/40'
              } rounded-r-lg`}
            />
          </div>

          {/* Cabin Footer Telemetry Indicators */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className={`flex items-center space-x-1 ${isVibrationFault ? 'text-rose-400 font-bold animate-pulse' : ''}`}>
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Vib: {vibrationMs2.toFixed(2)} m/s²</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Current: {motorCurrentAmps.toFixed(1)} A</span>
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Footer Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Cabin Temperature</span>
          <p className="text-cyan-300 font-bold text-sm">{temperatureCelsius.toFixed(1)} °C</p>
        </div>
        <div className={`p-3 rounded-xl border transition-colors ${
          isVibrationFault ? 'bg-rose-950/70 border-rose-700' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <span className="text-slate-400 text-[10px]">Shaft Vibration</span>
          <p className={`font-bold text-sm ${isVibrationFault ? 'text-rose-400' : 'text-amber-300'}`}>
            {vibrationMs2.toFixed(2)} m/s²
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Health Condition</span>
          <p className={`font-bold text-sm uppercase ${healthStyle.text}`}>
            {healthStatus} ({healthScore.toFixed(0)}/100)
          </p>
        </div>
        <div className={`p-3 rounded-xl border transition-colors ${
          isAnomalyDetected ? 'bg-rose-950/70 border-rose-700' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <span className="text-slate-400 text-[10px]">Anomaly Score</span>
          <p className={`font-bold text-sm ${isAnomalyDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {anomalyScore.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
