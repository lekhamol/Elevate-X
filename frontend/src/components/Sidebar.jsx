import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Activity,
  ShieldAlert,
  History,
  HeartPulse,
  Settings as SettingsIcon,
  LogIn
} from 'lucide-react';

export default function Sidebar({ activeAlertsCount = 0 }) {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Digital Twin', path: '/digital-twin', icon: Boxes, highlight: true },
    { name: 'Sensor Monitoring', path: '/sensor-monitoring', icon: Activity },
    { name: 'Alerts & Safety Engine', path: '/alerts', icon: ShieldAlert, badge: activeAlertsCount },
    { name: 'Historical Data', path: '/historical-data', icon: History },
    { name: 'System Health', path: '/system-health', icon: HeartPulse },
    { name: 'Settings & ESP32 Code', path: '/settings', icon: SettingsIcon },
    { name: 'Login Page', path: '/login', icon: LogIn }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 shadow-xl">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-3">
            Digital Twin Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-cyan-400' : ''}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Real-time status card inside sidebar */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Sync Mode:</span>
            <span className="text-cyan-400 font-semibold font-mono">Real-time (1s)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Protocol:</span>
            <span className="text-slate-300 font-mono">Wi-Fi REST / JSON</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Safety Engine:</span>
            <span className="text-emerald-400 font-semibold font-mono">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
        Elevator Safety Twin v1.0
      </div>
    </aside>
  );
}
