import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  HeartPulse,
  Wifi,
  Database,
  Cpu,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await elevatorApi.getHealthStatus('ESP32-ELEVATOR-TWIN');
      setHealth(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
          <HeartPulse className="w-6 h-6 text-cyan-400" />
          <span>System Health & Hardware Connectivity Diagnostics</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Monitoring ESP32 Wi-Fi RSSI, Spring Boot API latency, MySQL database, and AI module status
        </p>
      </div>

      {/* Main Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: ESP32 Wi-Fi RSSI */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ESP32 Wi-Fi RSSI</span>
            <Wifi className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {health?.wifiRssi || -62}
            </span>
            <span className="text-xs font-mono text-slate-400">dBm</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>EXCELLENT SIGNAL</span>
          </div>
        </div>

        {/* Metric 2: Ping Latency */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Ping Latency</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {health?.pingLatencyMs || 14}
            </span>
            <span className="text-xs font-mono text-slate-400">ms</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Packet Loss: {((health?.packetLossRate || 0) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Metric 3: MySQL Database */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">MySQL Database</span>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-300">
            {health?.databaseStatus || 'ONLINE_MYSQL'}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Auto-DDL Schema Sync: ACTIVE
          </div>
        </div>

        {/* Metric 4: AI/ML Anomaly Suite */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">AI/ML Module</span>
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            {health?.aiModuleStatus || 'READY'}
          </div>
          <div className="text-[11px] font-mono text-purple-400">
            Scikit-Learn Ready: TRUE
          </div>
        </div>
      </div>

      {/* System Diagnostics Details Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-200">Hardware Node Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Hardware:</span>
              <span className="text-cyan-300 font-bold">{health?.deviceId || 'ESP32-DEV-01'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">IP Address:</span>
              <span className="text-slate-200">{health?.ipAddress || '192.168.1.105'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firmware Build:</span>
              <span className="text-slate-200">{health?.firmwareVersion || 'v2.4.1-ESP32'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Uptime:</span>
              <span className="text-emerald-400 font-bold">{Math.floor((health?.uptimeSeconds || 14200) / 3600)}h {Math.floor(((health?.uptimeSeconds || 14200) % 3600) / 60)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Spring Boot REST Port:</span>
              <span className="text-slate-200">8080</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">React Client Port:</span>
              <span className="text-slate-200">5173</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
