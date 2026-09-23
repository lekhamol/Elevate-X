import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Activity,
  ShieldAlert,
  History,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeAlertsCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role-based main dashboard link
  const getDashboardPath = () => {
    if (user?.role === 'OPERATOR') return '/operator';
    if (user?.role === 'ADMIN') return '/admin';
    return '/engineer';
  };

  const navItems = [
    { name: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
    { name: 'Digital Twin', path: '/digital-twin', icon: Boxes },
    { name: 'Live Telemetry', path: '/telemetry', icon: Activity },
    { name: 'Safety Alerts', path: '/alerts', icon: ShieldAlert, badge: activeAlertsCount },
    { name: 'History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  // Specific role shortcuts
  const roleShortcuts = [
    { name: 'Engineer View', path: '/engineer', role: 'ENGINEER' },
    { name: 'Operator View', path: '/operator', role: 'OPERATOR' },
    { name: 'Admin View', path: '/admin', role: 'ADMIN' },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 shadow-xl">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-3">
            System Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
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

        {/* Role View Switcher */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2">
            Switch Dashboard Role
          </p>
          <div className="space-y-1">
            {roleShortcuts.map((r) => (
              <NavLink
                key={r.path}
                to={r.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    isActive || user?.role === r.role
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <span>{r.name}</span>
                {user?.role === r.role && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* System Status Panel */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Elevator ID:</span>
            <span className="text-cyan-400 font-bold font-mono">ELV-01</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Telemetry Rate:</span>
            <span className="text-slate-300 font-mono">2000ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Safety Mode:</span>
            <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Logout Button in Sidebar */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <button
          onClick={logout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Session</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          Smart Elevator Twin v1.0
        </div>
      </div>
    </aside>
  );
}
