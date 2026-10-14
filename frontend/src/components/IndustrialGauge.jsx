import React from 'react';

/**
 * Industrial Semi-Circular Gauge Component
 * Renders an SVG semicircular dial with color zones (Green, Orange, Red),
 * tick marks, needle indicator, numerical value, unit, and status badge.
 */
export default function IndustrialGauge({
  title,
  value,
  min = 0,
  max = 100,
  unit = '',
  warningThreshold,
  criticalThreshold,
  isAvailable = true,
  isSimulated = false,
  zones = null,
  size = 200
}) {
  // If no custom zones provided, use default normal/warning/critical zones
  const defaultZones = zones || [
    { from: min, to: warningThreshold ?? (min + (max - min) * 0.6), color: '#10b981', label: 'NORMAL' },
    { from: warningThreshold ?? (min + (max - min) * 0.6), to: criticalThreshold ?? (min + (max - min) * 0.85), color: '#f59e0b', label: 'WARN' },
    { from: criticalThreshold ?? (min + (max - min) * 0.85), to: max, color: '#f43f5e', label: 'CRIT' }
  ];

  // Determine current status color & label
  let statusColor = '#10b981';
  let statusText = 'NORMAL';

  if (!isAvailable) {
    statusColor = '#64748b';
    statusText = 'NOT AVAILABLE';
  } else if (value !== undefined && value !== null) {
    if (criticalThreshold !== undefined && value >= criticalThreshold) {
      statusColor = '#f43f5e';
      statusText = 'CRITICAL';
    } else if (warningThreshold !== undefined && value >= warningThreshold) {
      statusColor = '#f59e0b';
      statusText = 'WARNING';
    } else {
      statusColor = '#10b981';
      statusText = 'NORMAL';
    }
  }

  // Calculate needle angle (-90 deg at min, +90 deg at max)
  const clampedVal = Math.max(min, Math.min(max, value ?? min));
  const normalized = (clampedVal - min) / (max - min || 1);
  const needleAngle = -90 + normalized * 180; // degrees

  // SVG Geometry
  const cx = 100;
  const cy = 95;
  const radius = 70;
  const strokeWidth = 12;

  // Helper to convert polar coordinate to cartesian for SVG path
  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  // Describe an SVG arc between two angles (-90 to +90 degrees)
  const describeArc = (x, y, r, startAngle, endAngle) => {
    // Offset by -90 so that -90 deg is 9 o'clock (left) and +90 deg is 3 o'clock (right)
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  // Convert zone ranges to arc angles
  const getZoneAngles = (fromVal, toVal) => {
    const startAngle = -90 + ((fromVal - min) / (max - min)) * 180;
    const endAngle = -90 + ((toVal - min) / (max - min)) * 180;
    return { startAngle, endAngle };
  };

  // Calculate ticks
  const tickCount = 5;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickVal = min + ((max - min) * i) / tickCount;
    const angle = -90 + (i / tickCount) * 180;
    const p1 = polarToCartesian(cx, cy, radius - 10, angle);
    const p2 = polarToCartesian(cx, cy, radius - strokeWidth + 2, angle);
    ticks.push({ p1, p2, val: tickVal, angle });
  }

  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden transition-all hover:border-slate-700">
      {/* Title & Badges Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className="flex items-center space-x-1.5">
          {isSimulated && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              SIMULATED
            </span>
          )}
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-colors"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              borderColor: `${statusColor}60`
            }}
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* SVG Semicircular Gauge */}
      <div className="relative w-full flex items-center justify-center -my-2" style={{ maxWidth: `${size}px` }}>
        <svg viewBox="0 0 200 125" className="w-full h-auto overflow-visible">
          {/* Background Track Arc */}
          <path
            d={describeArc(cx, cy, radius, -90, 90)}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Status Zone Arcs */}
          {isAvailable && defaultZones.map((z, idx) => {
            const { startAngle, endAngle } = getZoneAngles(z.from, z.to);
            if (endAngle <= startAngle) return null;
            return (
              <path
                key={idx}
                d={describeArc(cx, cy, radius, startAngle, endAngle)}
                fill="none"
                stroke={z.color}
                strokeWidth={strokeWidth - 2}
                opacity={0.85}
              />
            );
          })}

          {/* Gauge Tick Marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.p1.x}
              y1={t.p1.y}
              x2={t.p2.x}
              y2={t.p2.y}
              stroke="#64748b"
              strokeWidth={1.5}
            />
          ))}

          {/* Needle Indicator */}
          {isAvailable && (
            <g
              transform={`rotate(${needleAngle} ${cx} ${cy})`}
              style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <polygon
                points={`${cx - 3},${cy} ${cx + 3},${cy} ${cx},${cy - radius + 4}`}
                fill="#f8fafc"
                filter="drop-shadow(0 0 4px rgba(255,255,255,0.4))"
              />
              <circle cx={cx} cy={cy} r={6} fill="#0f172a" stroke="#38bdf8" strokeWidth={2.5} />
            </g>
          )}

          {/* Center Hub Cap */}
          <circle cx={cx} cy={cy} r={3.5} fill="#38bdf8" />

          {/* Min & Max Labels */}
          <text x={26} y={115} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            {min}
          </text>
          <text x={174} y={115} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            {max}
          </text>
        </svg>
      </div>

      {/* Main Numerical Readout */}
      <div className="w-full flex flex-col items-center justify-center pt-1 border-t border-slate-800/80">
        {isAvailable ? (
          <div className="flex items-baseline space-x-1.5">
            <span
              className="text-2xl font-extrabold font-mono transition-colors"
              style={{ color: statusColor }}
            >
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">{unit}</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500 py-1 font-semibold">
            Not Available
          </span>
        )}

        {/* Threshold Summary */}
        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>Warn: {warningThreshold !== undefined ? `${warningThreshold} ${unit}` : '--'}</span>
          <span>Crit: {criticalThreshold !== undefined ? `${criticalThreshold} ${unit}` : '--'}</span>
        </div>
      </div>
    </div>
  );
}
