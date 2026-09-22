import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  History,
  Download,
  Filter,
  Calendar,
  FileSpreadsheet,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function HistoricalData() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricFilter, setMetricFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await elevatorApi.getRecentTelemetry('ELV-01', 50);
      setHistory(res.data.slice().reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Timestamp', 'ElevatorID', 'Temperature_C', 'Vibration_MS2', 'DoorState', 'MotorCurrent_A', 'FloorPosition', 'RSSI'];
    const rows = history.map((r) => [
      r.id,
      r.timestamp,
      r.elevatorId,
      r.temperatureCelsius,
      r.vibrationMs2,
      r.doorSensorState ? 'CLOSED' : 'OPEN',
      r.motorCurrentAmps,
      r.floorHallSensor,
      r.rawRssi
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevator_telemetry_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Historical Data & Time-Series Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            MySQL database telemetry records and AI dataset extraction tool
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchHistory}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-all font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export AI/ML Training CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Metric Time-Series Composite Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200">Historical Telemetry Trends</h2>
          <div className="flex items-center space-x-2 text-xs font-mono">
            {['ALL', 'TEMP', 'VIB', 'CURRENT'].map((m) => (
              <button
                key={m}
                onClick={() => setMetricFilter(m)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  metricFilter === m
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={history}>
              <XAxis dataKey="id" stroke="#475569" tick={false} />
              <YAxis stroke="#475569" fontSize={11} fontStyle="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
              {(metricFilter === 'ALL' || metricFilter === 'TEMP') && (
                <Area type="monotone" dataKey="temperatureCelsius" name="Temp (°C)" fill="#06b6d4" stroke="#06b6d4" fillOpacity={0.2} />
              )}
              {(metricFilter === 'ALL' || metricFilter === 'VIB') && (
                <Line type="monotone" dataKey="vibrationMs2" name="Vibration (m/s²)" stroke="#f59e0b" strokeWidth={2} />
              )}
              {(metricFilter === 'ALL' || metricFilter === 'CURRENT') && (
                <Bar dataKey="motorCurrentAmps" name="Motor Current (A)" fill="#c084fc" opacity={0.6} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200">Raw Sensor Log Archive</h2>
          <span className="text-xs text-slate-400 font-mono">Records: {history.length}</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Vib (m/s²)</th>
                <th className="py-2.5 px-3">Door</th>
                <th className="py-2.5 px-3">Current (A)</th>
                <th className="py-2.5 px-3">Floor</th>
                <th className="py-2.5 px-3">Wi-Fi RSSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {history.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400">#{r.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3">{r.temperatureCelsius?.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{r.vibrationMs2?.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <span className={r.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}>
                      {r.doorSensorState ? 'CLOSED' : 'OPEN'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{r.motorCurrentAmps?.toFixed(1)}</td>
                  <td className="py-2.5 px-3">FL {r.floorHallSensor}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.rawRssi} dBm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
