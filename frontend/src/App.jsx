import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import EngineerDashboard from './pages/EngineerDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DigitalTwin from './pages/DigitalTwin';
import Telemetry from './pages/Telemetry';
import Alerts from './pages/Alerts';
import History from './pages/History';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SystemHealth from './pages/SystemHealth';
import { elevatorApi } from './services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Default dashboard redirect based on role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'OPERATOR') return <Navigate to="/operator" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/engineer" replace />;
};

function MainLayout() {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [simulatorActive, setSimulatorActive] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const fetchStatus = async () => {
    try {
      const summaryRes = await elevatorApi.getAlertsSummary();
      if (summaryRes.success) {
        setActiveAlertsCount(summaryRes.data.unresolvedCount || 0);
        setIsBackendOnline(true);
      } else {
        setIsBackendOnline(false);
      }

      const simRes = await elevatorApi.getSimulatorStatus();
      if (simRes.success) {
        setSimulatorActive(simRes.data.active);
      }
    } catch (err) {
      setIsBackendOnline(false);
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
    await elevatorApi.toggleSimulator(nextState);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Header
        isOnline={isBackendOnline}
        elevatorId="ELV-01"
        activeAlertsCount={activeAlertsCount}
        simulatorActive={simulatorActive}
        onToggleSimulator={handleToggleSimulator}
      />
      <div className="flex flex-1">
        <Sidebar activeAlertsCount={activeAlertsCount} />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-61px)]">
          <Routes>
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/dashboard" element={<EngineerDashboard />} />
            <Route path="/engineer" element={<EngineerDashboard />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/telemetry" element={<Telemetry />} />
            <Route path="/sensor-monitoring" element={<Telemetry />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/history" element={<History />} />
            <Route path="/historical-data" element={<History />} />
            <Route path="/reports" element={<Reports />} />
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
