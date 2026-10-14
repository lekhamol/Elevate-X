import React from 'react';
import {
  Boxes,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  Clock,
  Radio
} from 'lucide-react';

/**
 * ElevatorStatusCard Component
 * Displays elevator selector, operational mode, speed, emergency stop controls,
 * and telemetry connection freshness.
 */
export default function ElevatorStatusCard({
  elevatorId = 'ELV-01',
  onSelectElevator,
  elevatorState,
  telemetry = {},
  isBackendConnected = true,
  isSimulated = false,
  isStale = false,
  onEmergencyStop,
  onResetFault
}) {
  const currentFloor = telemetry.floorHallSensor || elevatorState?.currentFloor || 1;
  const targetFloor = elevatorState?.targetFloor || currentFloor;
  const speed = elevatorState?.currentSpeedMs || (elevatorState?.direction && elevatorState.direction !== 'IDLE' ? 1.5 : 0.0);
  const emergencyStop = Boolean(elevatorState?.emergencyStop);
  const operationalMode = isSimulated ? 'SIMULATION' : (elevatorState?.operationalMode || 'NORMAL');

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Elevator Selector & Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <label htmlFor="elevator-select" className="text-xs font-semibold text-slate-400 font-mono">
                Select Elevator:
              </label>
              <select
                id="elevator-select"
                value={elevatorId}
                onChange={(e) => onSelectElevator && onSelectElevator(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ELV-01">ELV-01 (Primary Shaft)</option>
                <option value="ELV-02">ELV-02 (Auxiliary Shaft)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Operating Mode: <span className="text-cyan-400 font-bold">{operationalMode}</span>
            </p>
          </div>
        </div>

        {/* Telemetry Freshness & Backend Status Badge */}
        <div className="flex items-center space-x-2">
          {isBackendConnected ? (
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 border ${
              isStale
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
            }`}>
              <Radio className="w-3 h-3 text-current" />
              <span>{isStale ? 'TELEMETRY STALE (>10s)' : 'TELEMETRY LIVE'}</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>DISCONNECTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Current Floor</span>
          <p className="text-lg font-bold text-white mt-0.5">Floor {currentFloor}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Target Floor</span>
          <p className="text-lg font-bold text-cyan-300 mt-0.5">Floor {targetFloor}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Shaft Velocity</span>
          <p className="text-lg font-bold text-slate-200 mt-0.5">{speed.toFixed(1)} m/s</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Safety Interlock</span>
          <p className={`text-sm font-bold mt-1 ${
            emergencyStop ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
          }`}>
            {emergencyStop ? 'EMERGENCY BRAKE' : 'ARMED / OK'}
          </p>
        </div>
      </div>

      {/* Emergency Stop / Reset Action Bar */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Emergency Override Controls:</span>

        {emergencyStop ? (
          <button
            type="button"
            onClick={onResetFault}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Emergency Brake</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onEmergencyStop}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center space-x-2 shadow-lg shadow-rose-600/40 transition-all cursor-pointer animate-pulse-red"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Engage Emergency Brake</span>
          </button>
        )}
      </div>
    </div>
  );
}
