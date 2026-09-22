import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveDigitalTwin from './pages/LiveDigitalTwin';
import SensorMonitoring from './pages/SensorMonitoring';
import Alerts from './pages/Alerts';
import HistoricalData from './pages/HistoricalData';
import SystemHealth from './pages/SystemHealth';
import Settings from './pages/Settings';
import { elevatorApi } from './services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function MainLayout() {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [simulatorActive, setSimulatorActive] = useState(true);

  const fetchStatus = async () => {
    try {
      const summaryRes = await elevatorApi.getAlertsSummary();
      setActiveAlertsCount(summaryRes.data.unresolvedCount || 0);

      const simRes = await elevatorApi.getSimulatorStatus();
      setSimulatorActive(simRes.data.active);
    } catch (err) {
      console.warn('Backend offline or starting up...');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSimulator = async () => {
    const nextState = !simulatorActive;
    setSimulatorActive(nextState);
    try {
      await elevatorApi.toggleSimulator(nextState);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeAlertsCount={activeAlertsCount}
        isOnline={true}
        simulatorActive={simulatorActive}
        onToggleSimulator={handleToggleSimulator}
      />
      <div className="flex flex-1">
        <Sidebar activeAlertsCount={activeAlertsCount} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-61px)]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/digital-twin" element={<LiveDigitalTwin />} />
            <Route path="/sensor-monitoring" element={<SensorMonitoring />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/historical-data" element={<HistoricalData />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
