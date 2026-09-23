import React from 'react';
import { Boxes, Zap, Flame, Activity, ShieldAlert, DoorClosed, DoorOpen } from 'lucide-react';

export default function ElevatorTwin({
  elevatorId = 'ELV-01',
  currentFloor = 1,
  doorStatus = 'CLOSED',
  operationalMode = 'NORMAL',
  temperatureCelsius = 28.5,
  vibrationMs2 = 0.8,
  motorCurrentAmps = 0.8,
  isAnomalyDetected = false,
  onCallFloor
}) {
  // Map floor 1-5 to bottom percentage: 1->5%, 2->25%, 3->45%, 4->65%, 5->85%
  const bottomPosition = (Math.max(1, Math.min(5, currentFloor)) - 1) * 20 + 5;
  const isDoorsOpen = doorStatus === 'OPEN' || doorStatus === 'DOOR_OPEN';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono">Digital Twin Elevator • {elevatorId}</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Real-Time Mechanical & Telemetry Physics Twin</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
            isAnomalyDetected
              ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            {isAnomalyDetected ? 'ANOMALY DETECTED' : 'SYSTEM HEALTHY'}
          </span>
        </div>
      </div>

      {/* Elevator Shaft Container */}
      <div className="elevator-shaft-bg w-full h-[400px] relative rounded-xl border border-slate-800/80 bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Cable Wires */}
        <div className="elevator-cable left-1/2 -translate-x-1/2 h-full bg-slate-700/40 w-1 absolute" />

        {/* Floor Markers 5 to 1 */}
        <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-6 z-20">
          {[5, 4, 3, 2, 1].map((fl) => (
            <div key={fl} className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => onCallFloor && onCallFloor(fl)}
                className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all border ${
                  currentFloor === fl
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/40 scale-105'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                FL {fl}
              </button>
              <div className="h-0.5 w-6 bg-slate-800" />
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                {fl === 1 ? 'Ground' : fl === 5 ? 'Top Level' : `Floor ${fl}`}
              </span>
            </div>
          ))}
        </div>

        {/* Animated Elevator Cabin Car */}
        <div
          className={`elevator-car absolute w-52 sm:w-64 h-28 rounded-2xl border-2 flex flex-col justify-between p-3 z-30 transition-all duration-700 ${
            isAnomalyDetected
              ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-950/50'
              : 'bg-slate-900/95 border-cyan-500/80 shadow-xl shadow-cyan-950/30'
          }`}
          style={{ bottom: `${bottomPosition}%` }}
        >
          {/* Cabin Top Line */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800/80 pb-1">
            <span className="text-cyan-400 font-bold flex items-center space-x-1">
              <Boxes className="w-3.5 h-3.5" />
              <span>{elevatorId} • FL-{currentFloor}</span>
            </span>
            <span className="text-slate-300 font-semibold">{temperatureCelsius?.toFixed(1)}°C</span>
          </div>

          {/* Doors SVG/CSS Animated Visualizer */}
          <div className="relative w-full h-11 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-between p-1 my-1">
            <div
              className={`h-full bg-slate-800 border-r border-cyan-500/40 rounded-l-md transition-all duration-500 ${
                isDoorsOpen ? 'w-2' : 'w-1/2'
              }`}
            />
            <div className="text-[10px] font-mono text-slate-300 font-bold z-10">
              {isDoorsOpen ? 'DOORS OPEN' : 'DOORS CLOSED'}
            </div>
            <div
              className={`h-full bg-slate-800 border-l border-cyan-500/40 rounded-r-md transition-all duration-500 ${
                isDoorsOpen ? 'w-2' : 'w-1/2'
              }`}
            />
          </div>

          {/* Cabin Metrics Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Vib: {vibrationMs2?.toFixed(2)} m/s²</span>
            <span>Current: {motorCurrentAmps?.toFixed(1)} A</span>
            <span className="text-cyan-300 font-semibold">{operationalMode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
