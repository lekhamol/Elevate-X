import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Activity, Thermometer, Zap, Sparkles, Clock } from 'lucide-react';

/**
 * LiveTelemetryChart Component
 * Displays interactive historical charts for:
 * - Temperature (°C)
 * - Vibration (m/s²)
 * - Motor Current (A)
 * - AI Anomaly Score (0.0 to 1.0)
 * Includes time filter buttons: Last 5m, Last 30m, Last 24h.
 */
export default function LiveTelemetryChart({
  data = [],
  timeFilter = '5m',
  onTimeFilterChange,
  isLoading = false
}) {
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Format data for chart display
  const chartData = data.map((item, idx) => {
    let timeLabel = `#${item.id || idx + 1}`;
    if (item.timestamp) {
      try {
        const d = new Date(item.timestamp);
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch {
        timeLabel = `#${item.id || idx + 1}`;
      }
    }
    return {
      ...item,
      time: timeLabel,
      temp: item.temperatureCelsius ?? item.temperature ?? 28.5,
      vib: item.vibrationMs2 ?? item.vibration ?? 0.85,
      current: item.motorCurrentAmps ?? item.motorCurrent ?? 0.8,
      anomaly: item.anomalyScore ?? 0.02
    };
  });

  const tooltipStyle = {
    backgroundColor: '#090d16',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: '#f8fafc',
    fontFamily: 'monospace'
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      {/* Header Bar with Tabs and Time Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Telemetry Trends & Historical Analysis</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Synchronized with Spring Boot REST endpoint (`/api/telemetry/recent` / `/history`)
          </p>
        </div>

        {/* Filter Controls: Metric Tabs & Time Horizon */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'all', label: 'All Series' },
              { id: 'temperature', label: 'Temp' },
              { id: 'vibration', label: 'Vibration' },
              { id: 'current', label: 'Current' },
              { id: 'anomaly', label: 'Anomaly' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedMetric(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  selectedMetric === tab.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filters */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {[
              { id: '5m', label: 'Last 5m' },
              { id: '30m', label: 'Last 30m' },
              { id: '24h', label: 'Last 24h' }
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => onTimeFilterChange && onTimeFilterChange(tf.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  timeFilter === tf.id
                    ? 'bg-blue-950 text-blue-300 border border-blue-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            {isLoading ? 'Loading telemetry readings...' : 'No telemetry data recorded for this time interval.'}
          </div>
        ) : selectedMetric === 'temperature' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="liveTempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} fontStyle="monospace" />
              <YAxis stroke="#475569" fontSize={10} fontStyle="monospace" domain={[20, 80]} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn: 45°C', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={60} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Crit: 60°C', fill: '#f43f5e', fontSize: 10 }} />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#06b6d4" fillOpacity={1} fill="url(#liveTempGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        ) : selectedMetric === 'vibration' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} fontStyle="monospace" />
              <YAxis stroke="#475569" fontSize={10} fontStyle="monospace" domain={[0, 12]} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={5.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn: 5.0 m/s²', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={8.5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Crit: 8.5 m/s²', fill: '#f43f5e', fontSize: 10 }} />
              <Line type="monotone" dataKey="vib" name="Vibration (m/s²)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : selectedMetric === 'current' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} fontStyle="monospace" />
              <YAxis stroke="#475569" fontSize={10} fontStyle="monospace" domain={[0, 20]} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={12.5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Overload: 12.5 A', fill: '#f43f5e', fontSize: 10 }} />
              <Bar dataKey="current" name="Motor Current (A)" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : selectedMetric === 'anomaly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="liveAnomalyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} fontStyle="monospace" />
              <YAxis stroke="#475569" fontSize={10} fontStyle="monospace" domain={[0, 1]} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Anomaly Threshold (0.50)', fill: '#f59e0b', fontSize: 10 }} />
              <Area type="monotone" dataKey="anomaly" name="AI Anomaly Score" stroke="#f43f5e" fillOpacity={1} fill="url(#liveAnomalyGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTempAll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVibAll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} fontStyle="monospace" />
              <YAxis stroke="#475569" fontSize={10} fontStyle="monospace" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area
                type="monotone"
                dataKey="temp"
                name="Temp (°C)"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorTempAll)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="vib"
                name="Vib (m/s²)"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorVibAll)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
