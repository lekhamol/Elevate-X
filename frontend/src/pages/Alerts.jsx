import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Save, Check } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState({});
  const [activeTab, setActiveTab] = useState('ACTIVE');

  const fetchAlertsData = async () => {
    try {
      const [alertsRes, rulesRes, telemetryRes] = await Promise.all([
        elevatorApi.getSafetyAlerts('ELV-01', false),
        elevatorApi.getRules(),
        elevatorApi.getRecentTelemetry('ELV-01', 1)
      ]);

      if (alertsRes.success) setAlerts(alertsRes.data);
      if (rulesRes.success) setRules(rulesRes.data);
      if (telemetryRes.success && telemetryRes.data.length > 0) {
        setLatestTelemetry(telemetryRes.data[0]);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    fetchAlertsData();
    const interval = setInterval(fetchAlertsData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    await elevatorApi.acknowledgeAlert(id, 'Safety Engineer');
    fetchAlertsData();
  };

  const handleResolve = async (id) => {
    await elevatorApi.resolveAlert(id, 'Resolved after inspection');
    fetchAlertsData();
  };

  const handleSaveRule = async (ruleKey, thresholdValue, enabled) => {
    await elevatorApi.updateRule({ ruleKey, thresholdValue, enabled });
    fetchAlertsData();
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 via-amber-200 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Safety Alerts & Threshold Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            GET /api/alerts • Anomaly Score: {latestTelemetry.anomalyScore?.toFixed(2) || '0.02'} • Anomaly Flag: {latestTelemetry.isAnomalyDetected ? 'TRUE' : 'FALSE'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeTab === 'RULES'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({resolvedAlerts.length})
          </button>
        </div>
      </div>

      {/* Active Alerts Table */}
      {activeTab === 'ACTIVE' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-200 font-mono">Real-Time Active Safety Alerts</h2>

          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300 font-mono">All Elevator Parameters Normal</h3>
              <p className="text-xs text-slate-500 font-mono">
                No active threshold violations or safety rule breaches.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="pb-3 px-3">Alert ID</th>
                    <th className="pb-3 px-3">Elevator ID</th>
                    <th className="pb-3 px-3">Severity</th>
                    <th className="pb-3 px-3">Alert Type / Title</th>
                    <th className="pb-3 px-3">Timestamp</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {activeAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-3 text-cyan-400 font-bold">#{alert.id}</td>
                      <td className="py-4 px-3 text-slate-200 font-bold">{alert.elevatorId || 'ELV-01'}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                          alert.severity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {alert.severity || 'NORMAL'}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-sans">
                        <p className="font-bold text-slate-200">{alert.title}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{alert.message}</p>
                      </td>
                      <td className="py-4 px-3 text-slate-400 text-[11px]">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : '-'}
                      </td>
                      <td className="py-4 px-3">
                        {alert.acknowledged ? (
                          <span className="text-cyan-400 font-semibold text-[11px]">Acked ({alert.acknowledgedBy})</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] animate-pulse">UNACKNOWLEDGED</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-mono transition-all"
                        >
                          Resolve Hazard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Safety Rules Engine */}
      {activeTab === 'RULES' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-200 font-mono">Configurable Safety Limits & Thresholds</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.ruleKey} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                    rule.defaultSeverity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {rule.defaultSeverity}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">{rule.ruleKey}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-200">{rule.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Limit Threshold:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={rule.thresholdValue}
                      id={`input-rule-${rule.ruleKey}`}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">{rule.unit}</span>
                    <button
                      onClick={() => {
                        const val = parseFloat(document.getElementById(`input-rule-${rule.ruleKey}`).value);
                        handleSaveRule(rule.ruleKey, val, rule.enabled);
                      }}
                      className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 transition-all"
                      title="Update Rule"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Alerts */}
      {activeTab === 'RESOLVED' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-200 font-mono">Resolved Hazard Audit Log</h2>
          <div className="space-y-2">
            {resolvedAlerts.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between font-mono">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">{a.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{a.resolutionNotes || 'Inspected and verified'}</p>
                </div>
                <span className="text-slate-500 text-[10px]">
                  {a.resolvedAt ? new Date(a.resolvedAt).toLocaleTimeString() : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
