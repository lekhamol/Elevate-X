import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Wifi, LogOut, ShieldAlert, Cpu } from 'lucide-react';

export default function Header({
  isOnline = true,
  elevatorId = 'ELV-01',
  activeAlertsCount = 0,
  simulatorActive = true,
  onToggleSimulator
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-slate-950 font-extrabold" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
              Smart Elevator Safety System
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">Elevator ID: {elevatorId}</span>
              <span>•</span>
              <span className="text-slate-400">ESP32 Telemetry & Digital Twin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Simulator Toggle */}
        {onToggleSimulator && (
          <button
            onClick={onToggleSimulator}
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              simulatorActive
                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${simulatorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Simulator: {simulatorActive ? 'ACTIVE' : 'OFF'}</span>
          </button>
        )}

        {/* Connection Status Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isOnline
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-600/80 text-rose-300 animate-pulse'
          }`}
        >
          <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span>{isOnline ? 'Live • Connected' : 'Backend Disconnected'}</span>
        </div>

        {/* User & Role Display */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'User'}</p>
            <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider font-bold">
              {user?.role || 'ENGINEER'}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
