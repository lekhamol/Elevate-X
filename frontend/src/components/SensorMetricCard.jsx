import React from 'react';

/**
 * SensorMetricCard Component
 * Displays real-time sensor metrics with value, unit, status indicator badge,
 * threshold warnings, and last updated timestamp.
 */
export default function SensorMetricCard({
  title,
  value,
  unit = '',
  status = 'NORMAL',
  statusLevel = 'normal', // 'normal' | 'warning' | 'critical' | 'neutral'
  icon: Icon,
  lastUpdated,
  thresholdNote,
  isSimulated = false
}) {
  const getStatusStyles = () => {
    switch (statusLevel?.toLowerCase()) {
      case 'critical':
      case 'danger':
      case 'rose':
        return {
          cardBorder: 'border-rose-600/80 shadow-lg shadow-rose-950/40 bg-slate-950/90 ring-1 ring-rose-500/30',
          badge: 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse',
          valueColor: 'text-rose-400',
          iconContainer: 'bg-rose-950 text-rose-400 border-rose-800'
        };
      case 'warning':
      case 'amber':
      case 'attention':
        return {
          cardBorder: 'border-amber-600/70 shadow-md shadow-amber-950/30 bg-slate-950/90',
          badge: 'bg-amber-950 text-amber-300 border-amber-700',
          valueColor: 'text-amber-400',
          iconContainer: 'bg-amber-950 text-amber-400 border-amber-800'
        };
      case 'cyan':
        return {
          cardBorder: 'border-cyan-700/60 shadow-md shadow-cyan-950/30 bg-slate-950/90',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-700',
          valueColor: 'text-cyan-400',
          iconContainer: 'bg-cyan-950 text-cyan-400 border-cyan-800'
        };
      case 'normal':
      case 'safe':
      case 'emerald':
      default:
        return {
          cardBorder: 'border-slate-800 bg-slate-950/70 hover:border-slate-700',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
          valueColor: 'text-emerald-400',
          iconContainer: 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
        };
    }
  };

  const style = getStatusStyles();

  // Format timestamp (e.g. "12:45:08 PM" or relative)
  const formatTime = (ts) => {
    if (!ts) return 'Live';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Live';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${style.cardBorder}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className="flex items-center space-x-1.5">
          {isSimulated && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
              SIM
            </span>
          )}
          {Icon && (
            <div className={`p-1.5 rounded-lg border ${style.iconContainer}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-3 flex items-baseline space-x-1.5">
        <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${style.valueColor}`}>
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono font-medium">{unit}</span>}
      </div>

      {/* Footer Info: Status Badge & Timestamp */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}>
          {status}
        </span>

        <span className="text-slate-500 text-[10px]" title={lastUpdated}>
          {thresholdNote ? thresholdNote : formatTime(lastUpdated)}
        </span>
      </div>
    </div>
  );
}
