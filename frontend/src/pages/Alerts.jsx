import React, { useState, useEffect } from 'react';
import { elevatorApi } from '../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sliders,
  Check,
  Save,
  Info
} from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'RULES', 'RESOLVED'
  const [editingRule, setEditingRule] = useState(null);

  const fetchData = async () => {
    try {
      const [alertsRes, rulesRes] = await Promise.all([
        elevatorApi.getAlerts('ELV-01', false),
        elevatorApi.getRules()
      ]);
      setAlerts(alertsRes.data);
      setRules(rulesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await elevatorApi.acknowledgeAlert(id, 'Safety Engineer');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await elevatorApi.resolveAlert(id, 'Resolved after inspection');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRule = async (ruleKey, thresholdValue, enabled) => {
    try {
      await elevatorApi.updateRule({ ruleKey, thresholdValue, enabled });
      setEditingRule(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 via-amber-200 to-white bg-clip-text text-transparent flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Safety Alerts & Threshold Rule Engine</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Automated hazard detection, safety interlock overrides, and threshold management
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'RULES'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rule Thresholds ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({resolvedAlerts.length})
          </button>
        </div>
      </div>

      {/* Tab Content 1: Active Safety Alerts Table */}
      {activeTab === 'ACTIVE' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Active Real-Time Hazards</h2>

          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">All Elevator Safety Parameters Normal</h3>
              <p className="text-xs text-slate-500 font-mono">
                No active safety rule violations or sensor threshold breaches.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="pb-3 px-3">Severity</th>
                    <th className="pb-3 px-3">Hazard Title & Message</th>
                    <th className="pb-3 px-3">Value / Limit</th>
                    <th className="pb-3 px-3">Timestamp</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {activeAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                          alert.severity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-sans">
                        <p className="font-bold text-slate-200">{alert.title}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{alert.message}</p>
                      </td>
                      <td className="py-4 px-3 text-cyan-300 font-bold">
                        {alert.triggeredValue?.toFixed(1) || '-'} / {alert.thresholdLimit?.toFixed(1) || '-'}
                      </td>
                      <td className="py-4 px-3 text-slate-400 text-[11px]">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-3">
                        {alert.acknowledged ? (
                          <span className="text-cyan-400 font-semibold text-[11px]">Acked by {alert.acknowledgedBy}</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] animate-pulse">UNACKNOWLEDGED</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right space-x-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all"
                          >
                            Ack
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs transition-all"
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

      {/* Tab Content 2: Configurable Safety Rules Engine Manager */}
      {activeTab === 'RULES' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200">Rule-Based Safety Threshold Engine</h2>
              <p className="text-xs text-slate-400 font-mono">
                Dynamically adjust safety limits enforced by Spring Boot backend
              </p>
            </div>
          </div>

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
                      id={`input-${rule.ruleKey}`}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">{rule.unit}</span>
                    <button
                      onClick={() => {
                        const val = parseFloat(document.getElementById(`input-${rule.ruleKey}`).value);
                        handleSaveRule(rule.ruleKey, val, rule.enabled);
                      }}
                      className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 transition-all"
                      title="Update Threshold"
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

      {/* Tab Content 3: Resolved Safety Log */}
      {activeTab === 'RESOLVED' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Historical Safety Resolutions Log</h2>
          <div className="space-y-2">
            {resolvedAlerts.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between font-mono">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">{a.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{a.resolutionNotes || 'Inspected and verified safely'}</p>
                </div>
                <span className="text-slate-500 text-[10px]">
                  Resolved at: {new Date(a.resolvedAt || a.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
