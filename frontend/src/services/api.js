import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const elevatorApi = {
  // 1. Recent Telemetry
  getRecentTelemetry: async (elevatorId = 'ELV-01', limit = 30) => {
    try {
      const response = await api.get(`/telemetry/recent?elevatorId=${elevatorId}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (err) {
      console.warn('API Warning [getRecentTelemetry]:', err.message);
      return { success: false, data: [], error: err.message };
    }
  },

  // 2. Historical Telemetry
  getTelemetryHistory: async (elevatorId = 'ELV-01', start = '', end = '') => {
    try {
      let url = `/telemetry/history?elevatorId=${elevatorId}`;
      if (start) url += `&start=${start}`;
      if (end) url += `&end=${end}`;
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (err) {
      console.warn('API Warning [getTelemetryHistory]:', err.message);
      return { success: false, data: [], error: err.message };
    }
  },

  // 3. Telemetry Ingestion (intended for ESP32 / simulator)
  postTelemetry: async (payload) => {
    try {
      const response = await api.post('/telemetry', payload);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // 4. Safety Alerts
  getSafetyAlerts: async (elevatorId = 'ELV-01', unresolvedOnly = false) => {
    try {
      const response = await api.get(`/alerts?elevatorId=${elevatorId}&unresolvedOnly=${unresolvedOnly}`);
      return { success: true, data: response.data };
    } catch (err) {
      console.warn('API Warning [getSafetyAlerts]:', err.message);
      return { success: false, data: [], error: err.message };
    }
  },

  // 5. Elevator State
  getElevatorState: async (elevatorId = 'ELV-01') => {
    try {
      const response = await api.get(`/elevator/state?elevatorId=${elevatorId}`);
      return { success: true, data: response.data };
    } catch (err) {
      console.warn('API Warning [getElevatorState]:', err.message);
      return { success: false, data: null, error: err.message };
    }
  },

  // Additional Helper Endpoints
  getAlertsSummary: async () => {
    try {
      const response = await api.get('/alerts/summary');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, data: { unresolvedCount: 0, criticalCount: 0 } };
    }
  },

  acknowledgeAlert: async (id, user = 'Safety Engineer') => {
    try {
      const response = await api.post(`/alerts/${id}/acknowledge?user=${user}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resolveAlert: async (id, notes = 'Resolved after inspection') => {
    try {
      const response = await api.post(`/alerts/${id}/resolve`, { notes });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  sendCommand: async (action, targetFloor = null, elevatorId = 'ELV-01') => {
    try {
      const response = await api.post('/elevator/command', { elevatorId, action, targetFloor });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getRules: async () => {
    try {
      const response = await api.get('/rules');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  updateRule: async (ruleData) => {
    try {
      const response = await api.put('/rules', ruleData);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getSimulatorStatus: async () => {
    try {
      const response = await api.get('/simulator/status');
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, data: { active: false } };
    }
  },

  toggleSimulator: async (active) => {
    try {
      const response = await api.post('/simulator/toggle', { active });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  injectFault: async (faultType, active = true) => {
    try {
      const response = await api.post('/simulator/inject-fault', { faultType, active });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export default api;
