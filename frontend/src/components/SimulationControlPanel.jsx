import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Flame,
  Activity,
  Zap,
  DoorOpen,
  DoorClosed,
  ArrowUp,
  ArrowDown,
  WifiOff,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

/**
 * SimulationControlPanel Component
 * Interactive controls to test the digital twin and safety monitoring pipeline:
 * - Start / Pause / Reset simulation
 * - Move elevator up / down / select floor (1-5)
 * - Open / close doors
 * - Inject faults: High Vibration, High Temperature, Motor Stall Current, Sensor Disconnection
 * All simulated readings pass through the POST /api/telemetry ingestion endpoint.
 */
export default function SimulationControlPanel({
  isSimulating = true,
  onToggleSimulation,
  onResetSimulation,
  onMoveUp,
  onMoveDown,
  onSelectFloor,
  onToggleDoors,
  isDoorClosed = true,
  currentFloor = 1,
  activeFaults = {},
  onInjectFault,
  isSensorDisconnected = false,
  onToggleSensorDisconnect
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                Digital Twin Simulation & Fault Injection Console
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SIMULATION CONTROLS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Inject hardware sensor faults and evaluate automated safety responses
            </p>
          </div>
        </div>

        {/* Primary Simulation State Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onToggleSimulation}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Simulation</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetSimulation}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Manual Movement & Floor Dispatcher Deck */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Manual Elevator Navigation
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Target Floor Buttons (1 to 5) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Dispatch to Landing</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => onSelectFloor && onSelectFloor(fl)}
                  className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                    currentFloor === fl
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  F{fl}
                </button>
              ))}
            </div>
          </div>

          {/* Up & Down Jog Controls */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Manual Direction Jog</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={currentFloor >= 5}
                className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center space-x-1 disabled:opacity-40"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Move Up</span>
              </button>

              <button
                type="button"
                onClick={onMoveDown}
                disabled={currentFloor <= 1}
                className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-300 font-mono text-xs font-bold flex items-center justify-center space-x-1 disabled:opacity-40"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Move Down</span>
              </button>
            </div>
          </div>

          {/* Door Manual Control */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Manual Door Cycling</span>
            <button
              type="button"
              onClick={onToggleDoors}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              {isDoorClosed ? (
                <>
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Elevator Doors</span>
                </>
              ) : (
                <>
                  <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Close Elevator Doors</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fault Injection Triggers Deck */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Fault & Anomaly Injection Triggers
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Click to toggle fault state on/off
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Fault 1: High Vibration */}
          <button
            type="button"
            onClick={() => onInjectFault('HIGH_VIBRATION')}
            className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
              activeFaults.HIGH_VIBRATION
                ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                activeFaults.HIGH_VIBRATION ? 'bg-rose-900 text-rose-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeFaults.HIGH_VIBRATION ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Excessive Vibration</p>
              <p className="text-[10px] text-slate-400 mt-0.5">&gt; 9.8 m/s² spike</p>
            </div>
          </button>

          {/* Fault 2: High Temperature */}
          <button
            type="button"
            onClick={() => onInjectFault('OVER_TEMP')}
            className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
              activeFaults.OVER_TEMP
                ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                activeFaults.OVER_TEMP ? 'bg-rose-900 text-rose-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeFaults.OVER_TEMP ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Motor Over-Temp</p>
              <p className="text-[10px] text-slate-400 mt-0.5">68.4 °C thermal hazard</p>
            </div>
          </button>

          {/* Fault 3: Motor Stall Overload Current */}
          <button
            type="button"
            onClick={() => onInjectFault('MOTOR_STALL')}
            className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
              activeFaults.MOTOR_STALL
                ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                activeFaults.MOTOR_STALL ? 'bg-rose-900 text-rose-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeFaults.MOTOR_STALL ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Motor Over-Current</p>
              <p className="text-[10px] text-slate-400 mt-0.5">15.2 A overload stall</p>
            </div>
          </button>

          {/* Fault 4: Door Interlock Motion Hazard */}
          <button
            type="button"
            onClick={() => onInjectFault('UNSAFE_DOOR')}
            className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
              activeFaults.UNSAFE_DOOR
                ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <DoorOpen className="w-4 h-4 text-amber-400" />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                activeFaults.UNSAFE_DOOR ? 'bg-rose-900 text-rose-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeFaults.UNSAFE_DOOR ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Unsafe Door Motion</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Doors open while in motion</p>
            </div>
          </button>

          {/* Fault 5: Sensor Disconnection */}
          <button
            type="button"
            onClick={onToggleSensorDisconnect}
            className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
              isSensorDisconnected
                ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                isSensorDisconnected ? 'bg-amber-900 text-amber-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {isSensorDisconnected ? 'DISCONNECTED' : 'ONLINE'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold">Sensor Disconnect</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Simulate stale/lost packet</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
