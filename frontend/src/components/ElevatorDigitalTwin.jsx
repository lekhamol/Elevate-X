import React from 'react';
import {
  Boxes,
  Zap,
  Activity,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  DoorOpen,
  DoorClosed,
  Gauge,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';

/**
 * Interactive Elevator Digital Twin Component
 * 2D virtual multi-floor elevator shaft with physics visualization:
 * - Cabin vertical translation
 * - Counterweight inverse movement
 * - Rotating overhead hoist pulley
 * - Animated sliding doors (Open/Closed)
 * - Landing floor call controls (FL 1 - 5)
 * - Operating State badge: NORMAL / WARNING / CRITICAL
 * - Hardware Telemetry vs Simulation Mode indicators
 */
export default function ElevatorDigitalTwin({
  telemetry = {},
  elevatorState = null,
  onCallFloor,
  onToggleDoors,
  isSimulated = false,
  isConnected = true
}) {
  // Extract state properties
  const elevatorId = telemetry.elevatorId || elevatorState?.elevatorId || 'ELV-01';
  const currentFloor = telemetry.floorHallSensor || elevatorState?.currentFloor || 1;
  const targetFloor = elevatorState?.targetFloor || currentFloor;
  
  // Door state: false = Open, true = Closed
  const isDoorClosed = telemetry.doorSensorState !== false && telemetry.doorState !== false && elevatorState?.doorStatus !== 'DOOR_OPEN';
  const doorStatus = isDoorClosed ? 'CLOSED' : 'OPEN';

  // Direction: UP, DOWN, IDLE
  let direction = (telemetry.direction || elevatorState?.direction || 'IDLE').toUpperCase();
  if (direction.includes('MOVING_UP')) direction = 'UP';
  if (direction.includes('MOVING_DOWN')) direction = 'DOWN';

  // Sensor values
  const temperature = telemetry.temperatureCelsius ?? telemetry.temperature ?? 28.5;
  const vibration = telemetry.vibrationMs2 ?? telemetry.vibration ?? 0.85;
  const motorCurrent = telemetry.motorCurrentAmps ?? telemetry.motorCurrent ?? 0.8;
  const anomalyScore = telemetry.anomalyScore ?? 0.02;
  const isAnomalyDetected = Boolean(telemetry.isAnomalyDetected);

  // Safety checks
  const isDoorMotionHazard = !isDoorClosed && (direction === 'UP' || direction === 'DOWN');
  const isVibrationHazard = vibration >= 5.0;
  const isThermalHazard = temperature >= 45.0;
  const isMotorHazard = motorCurrent >= 12.5;

  // Determine Operating State: NORMAL, WARNING, CRITICAL
  let operatingState = 'NORMAL';
  if (isDoorMotionHazard || vibration >= 8.5 || temperature >= 60.0 || motorCurrent >= 12.5 || elevatorState?.emergencyStop) {
    operatingState = 'CRITICAL';
  } else if (isVibrationHazard || isThermalHazard || isAnomalyDetected || anomalyScore >= 0.5) {
    operatingState = 'WARNING';
  }

  // Calculate cabin bottom percentage for floors 1 to 5:
  // Floor 1 -> 6%, Floor 2 -> 26%, Floor 3 -> 46%, Floor 4 -> 66%, Floor 5 -> 86%
  const clampedFloor = Math.max(1, Math.min(5, currentFloor));
  const cabinBottomPct = (clampedFloor - 1) * 20 + 6;

  // Counterweight moves inversely:
  // Floor 1 (bottom) -> Counterweight at 86% (top)
  // Floor 5 (top) -> Counterweight at 6% (bottom)
  const counterweightBottomPct = (5 - clampedFloor) * 20 + 6;

  // Get Operating State styles
  const getStateBadge = () => {
    switch (operatingState) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse',
          border: 'border-rose-600/80 shadow-2xl shadow-rose-950/60 ring-2 ring-rose-500/30',
          cabinBorder: 'border-rose-500 bg-rose-950/90 shadow-rose-600/50',
          text: 'text-rose-400',
          icon: AlertTriangle
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-950 text-amber-300 border-amber-600',
          border: 'border-amber-600/70 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/20',
          cabinBorder: 'border-amber-500 bg-slate-900/95 shadow-amber-600/40',
          text: 'text-amber-400',
          icon: AlertTriangle
        };
      case 'NORMAL':
      default:
        return {
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-700',
          border: 'border-slate-800 shadow-xl bg-slate-950/80',
          cabinBorder: 'border-cyan-500/80 bg-slate-900/95 shadow-cyan-950/50',
          text: 'text-emerald-400',
          icon: ShieldCheck
        };
    }
  };

  const stateStyle = getStateBadge();
  const StateIcon = stateStyle.icon;

  const floorLabels = {
    5: 'Floor 5 • Penthouse Suite',
    4: 'Floor 4 • Executive Offices',
    3: 'Floor 3 • Engineering Lab',
    2: 'Floor 2 • Conference Center',
    1: 'Floor 1 • Ground Lobby'
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 space-y-5 relative overflow-hidden ${stateStyle.border}`}>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
            operatingState === 'CRITICAL' ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse' :
            operatingState === 'WARNING' ? 'bg-amber-950/80 border-amber-600 text-amber-400' :
            'bg-cyan-950/80 border-cyan-800 text-cyan-400'
          }`}>
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                Digital Twin Shaft • {elevatorId}
              </h2>
              {isSimulated ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  SIMULATION MODE
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  LIVE TELEMETRY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Position: <span className="font-bold text-white">Floor {currentFloor}</span> • Target:{' '}
              <span className="text-cyan-300 font-bold">FL {targetFloor}</span>
            </p>
          </div>
        </div>

        {/* Operating State & Direction Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direction Indicator */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 ${
            direction === 'UP' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
            direction === 'DOWN' ? 'bg-blue-950 text-blue-300 border-blue-700' :
            'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {direction === 'UP' && <ArrowUp className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
            {direction === 'DOWN' && <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />}
            {direction === 'IDLE' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span>DIR: {direction}</span>
          </div>

          {/* Door Status Badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 ${
            isDoorMotionHazard
              ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
              : isDoorClosed
              ? 'bg-slate-900 text-emerald-300 border-slate-800'
              : 'bg-amber-950 text-amber-300 border-amber-700'
          }`}>
            {isDoorClosed ? <DoorClosed className="w-3.5 h-3.5 text-emerald-400" /> : <DoorOpen className="w-3.5 h-3.5 text-amber-400" />}
            <span>DOOR: {doorStatus}</span>
          </div>

          {/* Operating State Badge */}
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md ${stateStyle.badge}`}>
            <StateIcon className="w-3.5 h-3.5" />
            <span>STATE: {operatingState}</span>
          </div>
        </div>
      </div>

      {/* Main 2D Elevator Shaft Visualization */}
      <div className="w-full h-[470px] relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Machine Room at top */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between px-6 z-20">
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Overhead Hoist Motor Unit</span>
          </span>

          {/* Pulley wheel */}
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center ${
              direction !== 'IDLE' ? 'animate-spin' : ''
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Speed: {elevatorState?.currentSpeedMs?.toFixed(1) || (direction !== 'IDLE' ? '1.5' : '0.0')} m/s
            </span>
          </div>
        </div>

        {/* Steel Guide Rails (Left and Right of shaft) */}
        <div className="absolute left-32 top-10 bottom-0 w-1 bg-slate-800/90 z-10 shadow-sm" />
        <div className="absolute right-20 top-10 bottom-0 w-1 bg-slate-800/90 z-10 shadow-sm" />

        {/* Counterweight Rail (Far Right) */}
        <div className="absolute right-10 top-10 bottom-0 w-0.5 bg-slate-800/60 z-10" />

        {/* Cable to Cabin (Center) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-10 w-1 bg-gradient-to-b from-cyan-400/80 via-slate-600 to-slate-700 z-10"
          style={{ height: `calc(100% - ${cabinBottomPct}% - 40px)` }}
        />

        {/* Cable to Counterweight (Right) */}
        <div
          className="absolute right-10 top-10 w-0.5 bg-slate-600 z-10"
          style={{ height: `calc(100% - ${counterweightBottomPct}% - 40px)` }}
        />

        {/* Floor Landing Indicators & Call Buttons (Floors 5 down to 1) */}
        <div className="absolute left-4 top-10 bottom-4 flex flex-col justify-between py-2 z-20">
          {[5, 4, 3, 2, 1].map((fl) => {
            const isHere = currentFloor === fl;
            const isTarget = targetFloor === fl;
            return (
              <div key={fl} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onCallFloor && onCallFloor(fl)}
                  title={`Call Elevator to Floor ${fl}`}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-extrabold flex items-center justify-center transition-all duration-300 border ${
                    isHere
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-110'
                      : isTarget
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  F{fl}
                </button>
                <div className={`h-0.5 transition-all ${isHere ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-800'}`} />
                <span className={`text-[10px] font-mono hidden md:inline transition-colors ${
                  isHere ? 'text-cyan-300 font-bold' : 'text-slate-500'
                }`}>
                  {floorLabels[fl]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Counterweight Widget */}
        <div
          className="absolute right-7 w-6 h-16 rounded-md bg-slate-800 border border-slate-700 z-20 transition-all duration-800 ease-in-out shadow-md flex items-center justify-center"
          style={{ bottom: `${counterweightBottomPct}%` }}
          title="Elevator Counterweight"
        >
          <div className="text-[8px] font-mono text-slate-400 rotate-90 whitespace-nowrap">
            CW
          </div>
        </div>

        {/* Dynamic Elevator Cabin */}
        <div
          className={`elevator-car absolute w-52 sm:w-64 h-32 rounded-2xl border-2 flex flex-col justify-between p-3.5 z-30 transition-all duration-800 ease-in-out shadow-2xl ${stateStyle.cabinBorder}`}
          style={{
            bottom: `${cabinBottomPct}%`,
            transition: 'bottom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Cabin Top Header */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-1.5">
            <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Boxes className="w-3.5 h-3.5" />
              <span>{elevatorId} • FL {currentFloor}</span>
            </span>

            <span className={`font-semibold flex items-center space-x-1 ${
              direction === 'UP' ? 'text-cyan-300' : direction === 'DOWN' ? 'text-blue-300' : 'text-slate-400'
            }`}>
              {direction === 'UP' && <ArrowUp className="w-3 h-3 text-cyan-400" />}
              {direction === 'DOWN' && <ArrowDown className="w-3 h-3 text-blue-400" />}
              <span>{direction}</span>
            </span>
          </div>

          {/* Animated Sliding Doors Frame */}
          <div className={`relative w-full h-14 bg-slate-950 rounded-xl border overflow-hidden flex items-center justify-between p-1 my-1 transition-colors ${
            isDoorMotionHazard ? 'border-rose-500 ring-2 ring-rose-500 animate-pulse' : 'border-slate-800'
          }`}>
            {/* Left Sliding Door Leaf */}
            <div
              className={`h-full border-r transition-all duration-700 ease-in-out ${
                isDoorClosed
                  ? 'w-1/2 bg-slate-800 border-cyan-500/30'
                  : 'w-2 bg-slate-900 border-cyan-500/10'
              } rounded-l-lg`}
            />

            {/* Interior Center Status Message */}
            <div className="text-[10px] font-mono font-bold z-10 transition-colors flex items-center space-x-1">
              {isDoorMotionHazard ? (
                <div className="flex items-center space-x-1 text-rose-400 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DOOR INTERLOCK HAZARD!</span>
                </div>
              ) : isDoorClosed ? (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <DoorClosed className="w-3.5 h-3.5" />
                  <span>DOORS CLOSED / LOCKED</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-amber-300 animate-pulse">
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>DOORS OPEN (DWELLING)</span>
                </div>
              )}
            </div>

            {/* Right Sliding Door Leaf */}
            <div
              className={`h-full border-l transition-all duration-700 ease-in-out ${
                isDoorClosed
                  ? 'w-1/2 bg-slate-800 border-cyan-500/30'
                  : 'w-2 bg-slate-900 border-cyan-500/10'
              } rounded-r-lg`}
            />
          </div>

          {/* Cabin Bottom Sensor Readouts */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span className={`flex items-center space-x-1 ${vibration >= 5.0 ? 'text-rose-400 font-bold animate-pulse' : ''}`}>
              <Activity className="w-3 h-3 text-amber-400" />
              <span>{vibration.toFixed(2)} m/s²</span>
            </span>
            <span className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-cyan-400" />
              <span>{temperature.toFixed(1)} °C</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>{motorCurrent.toFixed(1)} A</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Dispatch & Door Toggle Toolbar */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs font-semibold">Call Floor:</span>
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5].map((fl) => (
              <button
                key={fl}
                onClick={() => onCallFloor && onCallFloor(fl)}
                className={`px-3 py-1 rounded-lg border font-bold transition-all ${
                  currentFloor === fl
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                F{fl}
              </button>
            ))}
          </div>
        </div>

        {onToggleDoors && (
          <button
            onClick={onToggleDoors}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            {isDoorClosed ? <DoorOpen className="w-3.5 h-3.5 text-amber-400" /> : <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isDoorClosed ? 'Open Doors' : 'Close Doors'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
