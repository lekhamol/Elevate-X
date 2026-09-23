import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SafetyAlert({ isAnomaly = false, anomalyScore = 0.0, alerts = [] }) {
  if (!isAnomaly && alerts.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-600 shadow-xl flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-rose-900 text-rose-300 border border-rose-600">
          <AlertTriangle className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-rose-100 flex items-center space-x-2">
            <span>SAFETY ALERT DETECTED</span>
            {anomalyScore > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-900 border border-rose-700 text-rose-300">
                Score: {anomalyScore.toFixed(2)}
              </span>
            )}
          </h3>
          <p className="text-xs text-rose-200 font-mono mt-0.5">
            {alerts.length > 0
              ? `${alerts[0].title}: ${alerts[0].message}`
              : 'Elevator telemetry indicates threshold anomaly or safety interlock fault.'}
          </p>
        </div>
      </div>
      <div className="hidden sm:block">
        <span className="text-[11px] font-mono px-3 py-1 bg-rose-900 text-rose-200 rounded-xl border border-rose-700 font-bold uppercase">
          HAZARD LEVEL: CRITICAL
        </span>
      </div>
    </div>
  );
}
