import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldAlert, Cpu, Wifi, LogOut, User, Activity } from 'lucide-react';

export default function Navbar({ activeAlertsCount = 0, isOnline = true, simulatorActive = true, onToggleSimulator }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-slate-950 font-extrabold" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
              Elevator Safety Digital Twin
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                ESP32 IoT Sync
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono">Prototype ID: ELV-01</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Hardware Twin Simulator Toggle Button */}
        <button
          onClick={onToggleSimulator}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            simulatorActive
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
          title="Toggle built-in physics twin telemetry simulator"
        >
          <Cpu className={`w-4 h-4 ${simulatorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <span>Twin Simulator: {simulatorActive ? 'ACTIVE' : 'OFF'}</span>
        </button>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <Wifi className={`w-4 h-4 ${isOnline ? 'text-cyan-400' : 'text-rose-500'}`} />
          <span className="font-mono">{isOnline ? 'ONLINE (14ms)' : 'OFFLINE'}</span>
        </div>

        {/* Safety Alert Badge */}
        <div className="relative">
          <div className={`p-2 rounded-lg border transition-all ${
            activeAlertsCount > 0
              ? 'bg-rose-950/70 border-rose-600/80 text-rose-300 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <Bell className="w-5 h-5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {activeAlertsCount}
              </span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'Operator'}</p>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{user?.role || 'ENGINEER'}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
