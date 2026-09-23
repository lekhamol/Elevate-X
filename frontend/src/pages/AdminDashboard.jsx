import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  ShieldCheck,
  Users,
  Boxes,
  ShieldAlert,
  Activity,
  Cpu,
  Database,
  Lock,
  Plus,
  Radio,
  Server
} from 'lucide-react';

export default function AdminDashboard() {
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [telemetryRes, alertsRes] = await Promise.all([
        elevatorApi.getRecentTelemetry('ELV-01', 10),
        elevatorApi.getSafetyAlerts('ELV-01', true)
      ]);

      if (telemetryRes.success) {
        setIsBackendConnected(true);
        setTelemetry(telemetryRes.data);
      } else {
        setIsBackendConnected(false);
      }

      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err) {
      console.warn(err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[0] : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-200 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>System Administration & Platform Governance</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Infrastructure health, user access controls, and IoT fleet metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-300 font-mono text-xs font-bold">
            Role: System Admin
          </span>
        </div>
      </div>

      {/* Admin System Statistics KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Elevators */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase">Total Elevators</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-cyan-400">1</p>
          <p className="text-[11px] text-slate-500 font-mono">Prototype ID: ELV-01</p>
        </div>

        {/* Card 2: Active Elevators */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase">Active Fleet Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">100%</p>
          <p className="text-[11px] text-emerald-400 font-mono">1 / 1 Elevators Operational</p>
        </div>

        {/* Card 3: Active Safety Alerts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase">Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className={`text-3xl font-extrabold font-mono ${alerts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {alerts.length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Unresolved Hazards</p>
        </div>

        {/* Card 4: System Status */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono font-semibold uppercase">API Gateway</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <p className={`text-2xl font-extrabold font-mono ${isBackendConnected ? 'text-blue-400' : 'text-rose-400'}`}>
            {isBackendConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Spring Boot Port 8080</p>
        </div>
      </div>

      {/* Main Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User & Role Management Placeholder */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-slate-200 font-mono">
                User Access & Role Management
              </h2>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-mono flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Lead Safety Engineer', email: 'engineer@safetytwin.io', role: 'ENGINEER', status: 'Active' },
              { name: 'Building Operator', email: 'operator@safetytwin.io', role: 'OPERATOR', status: 'Active' },
              { name: 'System Administrator', email: 'admin@safetytwin.io', role: 'ADMIN', status: 'Active' }
            ].map((usr) => (
              <div key={usr.email} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-slate-200">{usr.name}</p>
                  <p className="text-[11px] text-slate-400">{usr.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-bold">
                    {usr.role}
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold">{usr.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Telemetry Stream Audit */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-200 font-mono">
                Live Ingestion Log Audit
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-400">Spring Boot Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                  <th className="pb-2">Log ID</th>
                  <th className="pb-2">Temp (°C)</th>
                  <th className="pb-2">Vib (m/s²)</th>
                  <th className="pb-2">Current (A)</th>
                  <th className="pb-2">Floor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {telemetry.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 text-cyan-400">#{t.id}</td>
                    <td className="py-2 text-slate-200">{t.temperatureCelsius?.toFixed(1)}</td>
                    <td className="py-2 text-slate-200">{t.vibrationMs2?.toFixed(2)}</td>
                    <td className="py-2 text-slate-200">{t.motorCurrentAmps?.toFixed(1)}</td>
                    <td className="py-2 text-slate-200">FL {t.floorHallSensor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
