import React from 'react';
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
  Legend
} from 'recharts';

export default function TelemetryChart({ data = [], type = 'all' }) {
  // Format data timestamps for display
  const chartData = data.map((item) => ({
    ...item,
    time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : `#${item.id || ''}`,
  }));

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: '#f8fafc',
  };

  if (type === 'temperature') {
    return (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" domain={['dataMin - 2', 'dataMax + 5']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="temperatureCelsius"
              name="Temperature (°C)"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorTemp)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'vibration') {
    return (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" domain={[0, 'dataMax + 2']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="vibrationMs2"
              name="Vibration (m/s²)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'current') {
    return (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="motorCurrentAmps" name="Motor Current (A)" fill="#c084fc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Multi-series combined chart
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTempAll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVibAll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="monospace" />
          <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
          <Area
            type="monotone"
            dataKey="temperatureCelsius"
            name="Temp (°C)"
            stroke="#06b6d4"
            fillOpacity={1}
            fill="url(#colorTempAll)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="vibrationMs2"
            name="Vibration (m/s²)"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#colorVibAll)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
