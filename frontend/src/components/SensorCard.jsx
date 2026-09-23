import React from 'react';

export default function SensorCard({ title, value, unit, status, icon: Icon, statusColor = 'emerald', subtitle }) {
  const getBadgeClass = () => {
    switch (statusColor) {
      case 'rose':
      case 'danger':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'amber':
      case 'warning':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'cyan':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'emerald':
      case 'safe':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  const getValueColor = () => {
    switch (statusColor) {
      case 'rose':
      case 'danger':
        return 'text-rose-400';
      case 'amber':
      case 'warning':
        return 'text-amber-400';
      case 'cyan':
        return 'text-cyan-400';
      case 'emerald':
      case 'safe':
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${getBadgeClass()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className={`text-3xl font-extrabold font-mono ${getValueColor()}`}>
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
        <span className="text-slate-400">{subtitle || 'Status:'}</span>
        <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${getBadgeClass()}`}>
          {status || 'NORMAL'}
        </span>
      </div>
    </div>
  );
}
