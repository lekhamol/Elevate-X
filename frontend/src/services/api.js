import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export const elevatorApi = {
  // Telemetry
  getRecentTelemetry: (elevatorId = 'ELV-01', limit = 30) =>
    api.get(`/telemetry/recent?elevatorId=${elevatorId}&limit=${limit}`),
  
  getHistoricalTelemetry: (elevatorId = 'ELV-01', start, end) => {
    let url = `/telemetry/history?elevatorId=${elevatorId}`;
    if (start) url += `&start=${start}`;
    if (end) url += `&end=${end}`;
    return api.get(url);
  },

  postTelemetry: (payload) => api.post('/telemetry', payload),

  // Elevator State & Control
  getElevatorState: (elevatorId = 'ELV-01') =>
    api.get(`/elevator/state?elevatorId=${elevatorId}`),
  
  sendCommand: (action, targetFloor = null, elevatorId = 'ELV-01') =>
    api.post('/elevator/command', { elevatorId, action, targetFloor }),

  // Safety Alerts
  getAlerts: (elevatorId = 'ELV-01', unresolvedOnly = false) =>
    api.get(`/alerts?elevatorId=${elevatorId}&unresolvedOnly=${unresolvedOnly}`),
  
  getAlertsSummary: () => api.get('/alerts/summary'),

  acknowledgeAlert: (id, user = 'Safety Engineer') =>
    api.post(`/alerts/${id}/acknowledge?user=${user}`),

  resolveAlert: (id, notes) =>
    api.post(`/alerts/${id}/resolve`, { notes }),

  // Rules
  getRules: () => api.get('/rules'),
  updateRule: (ruleData) => api.put('/rules', ruleData),

  // Health
  getHealthStatus: (deviceId = 'ESP32-ELEVATOR-TWIN') =>
    api.get(`/health?deviceId=${deviceId}`),

  // Simulator
  getSimulatorStatus: () => api.get('/simulator/status'),
  toggleSimulator: (active) => api.post('/simulator/toggle', { active }),
  injectFault: (faultType, active = true) =>
    api.post('/simulator/inject-fault', { faultType, active }),

  // ML / Anomaly
  getDataset: (elevatorId = 'ELV-01', limit = 100) =>
    api.get(`/ml/telemetry-dataset?elevatorId=${elevatorId}&limit=${limit}`),
  
  pushPredictions: (predictions) => api.post('/api/ml/anomaly-predictions', predictions),
};

export default api;
