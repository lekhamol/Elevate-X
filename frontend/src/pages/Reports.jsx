import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  FileText,
  Download,
  Thermometer,
  Activity,
  Zap,
  ShieldAlert,
  BarChart2,
  PieChart
} from 'lucide-react';

export default function Reports() {
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [telemetryRes, alertsRes] = await Promise.all([
        elevatorApi.getRecentTelemetry('ELV-01', 100),
        elevatorApi.getSafetyAlerts('ELV-01', false)
      ]);

      if (telemetryRes.success) setTelemetry(telemetryRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Compute Statistics: Min, Max, Avg for Temp, Vib, Current
  const getStats = (key) => {
    if (telemetry.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = telemetry.map((t) => t[key] || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return { min, max, avg };
  };

  const tempStats = getStats('temperatureCelsius');
  const vibStats = getStats('vibrationMs2');
  const currentStats = getStats('motorCurrentAmps');

  const anomalyCount = telemetry.filter((t) => t.isAnomalyDetected).length;

  const exportReportCSV = () => {
    const summaryData = [
      ['Metric Category', 'Minimum', 'Maximum', 'Average'],
      ['Temperature (°C)', tempStats.min.toFixed(2), tempStats.max.toFixed(2), tempStats.avg.toFixed(2)],
      ['Vibration (m/s²)', vibStats.min.toFixed(2), vibStats.max.toFixed(2), vibStats.avg.toFixed(2)],
      ['Motor Current (A)', currentStats.min.toFixed(2), currentStats.max.toFixed(2), currentStats.avg.toFixed(2)],
      [],
      ['Total Telemetry Samples', telemetry.length],
      ['Total Safety Events / Alerts', alerts.length],
      ['Total Anomaly Events', anomalyCount]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + summaryData.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevator_safety_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Safety & Sensor Statistical Reports</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Summary metrics, statistical distributions, and compliance export
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Samples Logged</span>
          <p className="text-3xl font-extrabold font-mono text-cyan-400">{telemetry.length}</p>
          <p className="text-[11px] text-slate-500 font-mono">From Spring Boot Backend</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Safety Events</span>
          <p className="text-3xl font-extrabold font-mono text-amber-400">{alerts.length}</p>
          <p className="text-[11px] text-slate-500 font-mono">Threshold Breaches Recorded</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Anomaly Flags</span>
          <p className={`text-3xl font-extrabold font-mono ${anomalyCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {anomalyCount}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">ML Isolation Forest Detections</p>
        </div>
      </div>

      {/* Sensor Statistics Grid (Min, Max, Avg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature Stats */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Thermometer className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-200 font-mono">Temperature Statistics</h3>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Minimum:</span>
              <span className="text-cyan-400 font-bold">{tempStats.min.toFixed(2)} °C</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Maximum:</span>
              <span className="text-rose-400 font-bold">{tempStats.max.toFixed(2)} °C</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Average:</span>
              <span className="text-slate-200 font-bold">{tempStats.avg.toFixed(2)} °C</span>
            </div>
          </div>
        </div>

        {/* Vibration Stats */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200 font-mono">Vibration Statistics</h3>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Minimum:</span>
              <span className="text-cyan-400 font-bold">{vibStats.min.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Maximum:</span>
              <span className="text-amber-400 font-bold">{vibStats.max.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Average:</span>
              <span className="text-slate-200 font-bold">{vibStats.avg.toFixed(2)} m/s²</span>
            </div>
          </div>
        </div>

        {/* Motor Current Stats */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-200 font-mono">Motor Current Statistics</h3>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Minimum:</span>
              <span className="text-cyan-400 font-bold">{currentStats.min.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Maximum:</span>
              <span className="text-purple-400 font-bold">{currentStats.max.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-400">Average:</span>
              <span className="text-slate-200 font-bold">{currentStats.avg.toFixed(2)} A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
