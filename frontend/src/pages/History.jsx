import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import TelemetryChart from '../components/TelemetryChart';
import {
  History as HistoryIcon,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export default function History() {
  const [elevatorId, setElevatorId] = useState('ELV-01');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metricFilter, setMetricFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await elevatorApi.getTelemetryHistory(elevatorId, startDate, endDate);
      if (res.success && res.data.length > 0) {
        setHistoryData(res.data.slice().reverse());
      } else {
        // Fallback to recent telemetry if history endpoint returns empty
        const fallbackRes = await elevatorApi.getRecentTelemetry(elevatorId, 50);
        if (fallbackRes.success) {
          setHistoryData(fallbackRes.data.slice().reverse());
        }
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const exportCSV = () => {
    if (historyData.length === 0) return;
    const headers = ['ID', 'Timestamp', 'ElevatorID', 'Temperature_C', 'Vibration_MS2', 'MotorCurrent_A', 'Floor', 'DoorState', 'RSSI', 'AnomalyScore'];
    const rows = historyData.map((r) => [
      r.id,
      r.timestamp,
      r.elevatorId || 'ELV-01',
      r.temperatureCelsius,
      r.vibrationMs2,
      r.motorCurrentAmps,
      r.floorHallSensor,
      r.doorSensorState ? 'CLOSED' : 'OPEN',
      r.rawRssi,
      r.anomalyScore || 0.02
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historical_telemetry_${elevatorId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            <span>Historical Telemetry & Dataset Archive</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            GET /api/telemetry/history • MySQL database persistent time-series logs
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center space-x-2 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Elevator ID
            </label>
            <select
              value={elevatorId}
              onChange={(e) => setElevatorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ELV-01">ELV-01 (Primary Shaft)</option>
              <option value="ELV-02">ELV-02 (Secondary Shaft)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              Start Date/Time
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-mono text-slate-400 mb-1">
              End Date/Time
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs font-mono flex items-center justify-center space-x-2 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Query History</span>
            </button>
          </div>
        </form>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 font-mono">Historical Telemetry Trends</h2>
          <div className="flex items-center space-x-2 text-xs font-mono">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'temperature', label: 'TEMP' },
              { id: 'vibration', label: 'VIB' },
              { id: 'current', label: 'CURRENT' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetricFilter(m.id)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  metricFilter === m.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <TelemetryChart data={historyData} type={metricFilter} />
      </div>

      {/* Data Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 font-mono">Historical Records Log Table</h2>
          <span className="text-xs text-slate-400 font-mono">Total Records: {historyData.length}</span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Elevator ID</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Vib (m/s²)</th>
                <th className="py-2.5 px-3">Current (A)</th>
                <th className="py-2.5 px-3">Floor</th>
                <th className="py-2.5 px-3">Door</th>
                <th className="py-2.5 px-3">Anomaly Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {historyData.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400">#{r.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {r.timestamp ? new Date(r.timestamp).toLocaleString() : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-bold">{r.elevatorId || 'ELV-01'}</td>
                  <td className="py-2.5 px-3">{r.temperatureCelsius?.toFixed(1)} °C</td>
                  <td className="py-2.5 px-3">{r.vibrationMs2?.toFixed(2)} m/s²</td>
                  <td className="py-2.5 px-3">{r.motorCurrentAmps?.toFixed(1)} A</td>
                  <td className="py-2.5 px-3">Floor {r.floorHallSensor}</td>
                  <td className="py-2.5 px-3">
                    <span className={r.doorSensorState ? 'text-emerald-400' : 'text-amber-400'}>
                      {r.doorSensorState ? 'CLOSED' : 'OPEN'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={r.isAnomalyDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {r.anomalyScore !== undefined ? r.anomalyScore.toFixed(2) : '0.02'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
