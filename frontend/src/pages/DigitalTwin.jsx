import React, { useState, useEffect, useRef, useCallback } from 'react';
import { elevatorApi } from '../services/api';
import ElevatorTwin from '../components/ElevatorTwin';
import SensorCard from '../components/SensorCard';
import SafetyAlert from '../components/SafetyAlert';
import { ElevatorSimulationEngine } from '../services/simulationEngine';
import {
  Boxes,
  Play,
  Square,
  RotateCcw,
  Sliders,
  Flame,
  Activity,
  DoorOpen,
  DoorClosed,
  Zap,
  AlertTriangle,
  Radio,
  Clock,
  ShieldCheck,
  ShieldAlert,
  History,
  CheckCircle2,
  Thermometer,
  Layers,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  SlidersHorizontal,
  Wifi
} from 'lucide-react';

export default function DigitalTwin() {
  // Telemetry & State
  const [telemetryRecord, setTelemetryRecord] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Simulation Controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simIntervalMs, setSimIntervalMs] = useState(2000); // 2 seconds default
  const [activeScenario, setActiveScenario] = useState('NORMAL'); // 'NORMAL', 'EXCESSIVE_VIBRATION', 'DOOR_MALFUNCTION'
  const [vibrationThreshold, setVibrationThreshold] = useState(5.0);

  // Fault History log
  const [faultHistory, setFaultHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('elevator_fault_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulator Engine instance ref (persists across renders)
  const simulatorRef = useRef(null);
  if (!simulatorRef.current) {
    simulatorRef.current = new ElevatorSimulationEngine('ELV-01');
  }

  // Ref to hold simulation interval timer
  const simTimerRef = useRef(null);

  // Helper to record fault in history
  const logFaultEvent = useCallback((type, message, severity, floor, source = 'SIMULATED FAULT INJECTION') => {
    const newFault = {
      id: Date.now() + Math.random(),
      type,
      message,
      severity,
      floor,
      elevatorId: 'ELV-01',
      source,
      timestamp: new Date().toISOString()
    };
    setFaultHistory((prev) => {
      const updated = [newFault, ...prev.slice(0, 49)]; // keep latest 50
      try {
        localStorage.setItem('elevator_fault_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });
  }, []);

  // Fetch recent telemetry & alerts from Spring Boot backend
  const fetchBackendData = useCallback(async () => {
    try {
      const [telemetryRes, alertsRes] = await Promise.all([
        elevatorApi.getRecentTelemetry('ELV-01', 30),
        elevatorApi.getSafetyAlerts('ELV-01', true)
      ]);

      if (telemetryRes.success && telemetryRes.data && telemetryRes.data.length > 0) {
        setIsBackendOnline(true);
        setTelemetryRecord(telemetryRes.data[0]);
        setRecentReadings(telemetryRes.data);
      } else if (telemetryRes.error) {
        setIsBackendOnline(false);
      }

      if (alertsRes.success && alertsRes.data) {
        setActiveAlerts(alertsRes.data);
      }
    } catch (err) {
      console.warn('Backend fetch error:', err);
      setIsBackendOnline(false);
    }
  }, []);

  // Single step of the simulation engine
  const executeSimulationStep = useCallback(async () => {
    if (!simulatorRef.current) return;

    // 1. Advance simulator engine physics & sensors
    const nextTelemetry = simulatorRef.current.step();

    // 2. Rule-Based Fault Detection & Logging
    if (nextTelemetry.vibrationMs2 >= vibrationThreshold) {
      logFaultEvent(
        'Excessive Mechanical Vibration',
        `Vibration level (${nextTelemetry.vibrationMs2} m/s²) breached threshold (${vibrationThreshold} m/s²)`,
        'CRITICAL',
        nextTelemetry.floorHallSensor,
        activeScenario === 'EXCESSIVE_VIBRATION' ? 'SIMULATED FAULT INJECTION' : 'SENSOR RULE ENGINE'
      );
    }

    if (nextTelemetry.doorSensorState === false && (nextTelemetry.direction === 'UP' || nextTelemetry.direction === 'DOWN')) {
      logFaultEvent(
        'Door Interlock Motion Hazard',
        `Door sensor reports OPEN while cabin is in transit (${nextTelemetry.direction}) at Floor ${nextTelemetry.floorHallSensor}`,
        'CRITICAL',
        nextTelemetry.floorHallSensor,
        activeScenario === 'DOOR_MALFUNCTION' ? 'SIMULATED FAULT INJECTION' : 'SENSOR RULE ENGINE'
      );
    }

    // 3. Send telemetry to Spring Boot backend: POST /api/telemetry
    let postedSuccessfully = false;
    try {
      const res = await elevatorApi.postTelemetry(nextTelemetry);
      if (res.success && res.data) {
        postedSuccessfully = true;
        setIsBackendOnline(true);
        setTelemetryRecord(res.data);
      } else {
        setIsBackendOnline(false);
      }
    } catch (err) {
      setIsBackendOnline(false);
    }

    // Fallback if backend is offline: display local simulated telemetry cleanly
    if (!postedSuccessfully) {
      setTelemetryRecord(nextTelemetry);
      setRecentReadings((prev) => [nextTelemetry, ...prev.slice(0, 29)]);
    } else {
      // Refresh recent feed from Spring Boot: GET /api/telemetry/recent
      fetchBackendData();
    }
  }, [activeScenario, vibrationThreshold, logFaultEvent, fetchBackendData]);

  // Manage simulation loop interval
  useEffect(() => {
    if (isSimulating) {
      // Clear any prior interval before setting new one
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
      }

      // Execute immediate step then loop
      executeSimulationStep();
      simTimerRef.current = setInterval(executeSimulationStep, simIntervalMs);
    } else {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    }

    return () => {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, [isSimulating, simIntervalMs, executeSimulationStep]);

  // Initial fetch on mount
  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Handle Scenario change
  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario);
    if (simulatorRef.current) {
      simulatorRef.current.setScenario(scenario);
    }

    if (scenario === 'EXCESSIVE_VIBRATION') {
      logFaultEvent(
        'Excessive Vibration Scenario Activated',
        'Simulated structural bearing & rail vibration spike (> 7.5 m/s²)',
        'WARNING',
        simulatorRef.current?.currentFloor || 1,
        'SIMULATED FAULT INJECTION'
      );
    } else if (scenario === 'DOOR_MALFUNCTION') {
      logFaultEvent(
        'Door Malfunction Scenario Activated',
        'Simulated door sensor failure / open interlock during elevator transit',
        'CRITICAL',
        simulatorRef.current?.currentFloor || 1,
        'SIMULATED FAULT INJECTION'
      );
    }
  };

  // Manual floor call from digital twin
  const handleCallFloor = (floor) => {
    if (simulatorRef.current) {
      simulatorRef.current.callFloor(floor);
    }
    // Also dispatch command to backend if online
    elevatorApi.sendCommand('CALL_FLOOR', floor);
    executeSimulationStep();
  };

  // Toggle Doors manually
  const handleToggleDoors = () => {
    if (simulatorRef.current) {
      simulatorRef.current.doorState = !simulatorRef.current.doorState;
    }
    executeSimulationStep();
  };

  // Clear Fault History
  const handleClearFaultHistory = () => {
    setFaultHistory([]);
    try {
      localStorage.removeItem('elevator_fault_history');
    } catch (err) {
      console.warn(err);
    }
  };

  // Telemetry values for rendering
  const latest = telemetryRecord || simulatorRef.current || {};
  const currentFloor = latest.floorHallSensor || latest.currentFloor || 1;
  const direction = (latest.direction || 'IDLE').toUpperCase();
  const isDoorsOpen = latest.doorSensorState === false || latest.doorState === false;
  const vibration = latest.vibrationMs2 !== undefined ? latest.vibrationMs2 : (latest.vibration || 0.85);
  const isVibAnomaly = vibration >= vibrationThreshold || activeScenario === 'EXCESSIVE_VIBRATION';
  const isDoorAnomaly = isDoorsOpen && (direction.includes('UP') || direction.includes('DOWN'));
  const isAnomaly = Boolean(latest.isAnomalyDetected) || isVibAnomaly || isDoorAnomaly || activeAlerts.length > 0;

  return (
    <div className="space-y-6">
      {/* Backend Offline Warning Banner */}
      {!isBackendOnline && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              Backend disconnected. Running in autonomous client demonstration mode. Please make sure Spring Boot is running on port 8080.
            </span>
          </div>
          <button
            onClick={fetchBackendData}
            className="px-3.5 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 border border-amber-700 text-amber-100 text-xs font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Prominent Active Safety Hazard Banner */}
      <SafetyAlert isAnomaly={isAnomaly} anomalyScore={latest.anomalyScore || 0.02} alerts={activeAlerts} />

      {/* Control Header & Simulation Engine Command Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <Boxes className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                Elevator Digital Twin & Simulation Platform
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Autonomous multi-floor elevator physics simulation • Spring Boot REST Telemetry Sync
            </p>
          </div>

          {/* Simulation Start / Stop Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simulation Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 ${
              isSimulating
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-amber-950 text-amber-300 border-amber-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{isSimulating ? 'SIMULATION RUNNING' : 'SIMULATION STOPPED'}</span>
            </div>

            {/* Start / Stop Toggle Button */}
            {isSimulating ? (
              <button
                type="button"
                onClick={() => setIsSimulating(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Simulation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSimulating(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Simulation</span>
              </button>
            )}

            {/* Simulation Interval Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Interval:</span>
              <select
                value={simIntervalMs}
                onChange={(e) => setSimIntervalMs(Number(e.target.value))}
                className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value={1000} className="bg-slate-900">1.0s (Fast)</option>
                <option value={2000} className="bg-slate-900">2.0s (Standard)</option>
                <option value={3000} className="bg-slate-900">3.0s (Slow)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fault Injection & Scenario Selection Deck */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Simulation Scenario:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario 1: Normal Operation */}
            <button
              type="button"
              onClick={() => handleScenarioChange('NORMAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
                activeScenario === 'NORMAL'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Normal Operation</span>
            </button>

            {/* Scenario 2: Excessive Vibration */}
            <button
              type="button"
              onClick={() => handleScenarioChange('EXCESSIVE_VIBRATION')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
                activeScenario === 'EXCESSIVE_VIBRATION'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-rose-300 hover:bg-slate-850'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Excessive Vibration (&gt;7.5 m/s²)</span>
            </button>

            {/* Scenario 3: Door Malfunction */}
            <button
              type="button"
              onClick={() => handleScenarioChange('DOOR_MALFUNCTION')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
                activeScenario === 'DOOR_MALFUNCTION'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-850'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Door Malfunction</span>
            </button>

            {/* Quick Toggle Doors button */}
            <button
              type="button"
              onClick={handleToggleDoors}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all flex items-center space-x-1"
              title="Manually toggle door open/close"
            >
              {isDoorsOpen ? <DoorClosed className="w-3.5 h-3.5" /> : <DoorOpen className="w-3.5 h-3.5" />}
              <span>{isDoorsOpen ? 'Close Doors' : 'Open Doors'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Monitoring Section: Animated Digital Twin & Sensor Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animated Digital Twin Canvas */}
        <div className="lg:col-span-2">
          <ElevatorTwin
            telemetry={latest}
            direction={direction}
            onCallFloor={handleCallFloor}
            isConnected={isBackendOnline}
          />
        </div>

        {/* Telemetry Sensor Monitoring Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              Live Sensor Telemetry
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : 'Live Stream'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {/* Sensor 1: Temperature */}
            <SensorCard
              title="Cabin Temperature"
              value={latest.temperatureCelsius ? latest.temperatureCelsius.toFixed(1) : (latest.temperature || '28.5')}
              unit="°C"
              icon={Thermometer}
              status={latest.temperatureCelsius >= 45 ? 'HIGH TEMP' : 'NORMAL'}
              statusColor={latest.temperatureCelsius >= 60 ? 'rose' : latest.temperatureCelsius >= 45 ? 'amber' : 'emerald'}
              subtitle="Safety Threshold: < 45.0°C"
            />

            {/* Sensor 2: Vibration (Highlighted during fault) */}
            <SensorCard
              title="Shaft Vibration"
              value={vibration ? vibration.toFixed(2) : '0.85'}
              unit="m/s²"
              icon={Activity}
              status={isVibAnomaly ? 'CRITICAL FAULT' : 'NORMAL'}
              statusColor={isVibAnomaly ? 'rose' : 'emerald'}
              subtitle={`Limit: < ${vibrationThreshold.toFixed(1)} m/s²`}
            />

            {/* Sensor 3: Motor Current */}
            <SensorCard
              title="Motor Current Draw"
              value={latest.motorCurrentAmps ? latest.motorCurrentAmps.toFixed(1) : (latest.motorCurrent || '0.8')}
              unit="A"
              icon={Zap}
              status={direction !== 'IDLE' ? 'RUNNING' : 'STANDBY'}
              statusColor={latest.motorCurrentAmps >= 12.5 ? 'rose' : 'cyan'}
              subtitle={direction !== 'IDLE' ? 'Driving Hoist Motor' : 'Motor Idling'}
            />

            {/* Sensor 4: Door State (Highlighted during fault) */}
            <SensorCard
              title="Door Interlock"
              value={isDoorsOpen ? 'OPEN' : 'LOCKED'}
              unit=""
              icon={isDoorsOpen ? DoorOpen : DoorClosed}
              status={isDoorAnomaly ? 'MALFUNCTION' : (isDoorsOpen ? 'PASSENGER DWELL' : 'LOCKED')}
              statusColor={isDoorAnomaly ? 'rose' : (isDoorsOpen ? 'amber' : 'emerald')}
              subtitle={isDoorAnomaly ? 'Hazard: Open in Motion' : 'Interlock Active'}
            />
          </div>
        </div>
      </div>

      {/* Fault Detection & History Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Recorded Fault History */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-200 font-mono">
                Fault Detection & Anomaly History
              </h2>
            </div>
            {faultHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearFaultHistory}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-rose-300 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {faultHistory.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-300 font-mono">No Active Faults Recorded</p>
              <p className="text-xs text-slate-500 font-mono">
                Select "Excessive Vibration" or "Door Malfunction" above to test automated fault recording.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto space-y-2 pr-1">
              {faultHistory.slice(0, 10).map((fault) => (
                <div
                  key={fault.id}
                  className={`p-3 rounded-xl border font-mono text-xs space-y-1 transition-all ${
                    fault.severity === 'CRITICAL'
                      ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                      : 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{fault.type}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fault.severity === 'CRITICAL' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                    }`}>
                      {fault.severity} • FL {fault.floor}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{fault.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Source: {fault.source}</span>
                    <span>{new Date(fault.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Recent Telemetry Stream Log Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-200 font-mono">
                Recent Ingested Telemetry Feed
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              GET /api/telemetry/recent
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <th className="py-2 px-2">Floor</th>
                  <th className="py-2 px-2">Temp (°C)</th>
                  <th className="py-2 px-2">Vib (m/s²)</th>
                  <th className="py-2 px-2">Door</th>
                  <th className="py-2 px-2">Current (A)</th>
                  <th className="py-2 px-2">Anomaly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {recentReadings.slice(0, 7).map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-2 text-cyan-400 font-bold">FL {r.floorHallSensor || r.currentFloor}</td>
                    <td className="py-2 px-2 text-slate-300">{(r.temperatureCelsius || r.temperature)?.toFixed(1)}</td>
                    <td className={`py-2 px-2 ${(r.vibrationMs2 || r.vibration) >= 5.0 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {(r.vibrationMs2 || r.vibration)?.toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <span className={r.doorSensorState !== false && r.doorState !== false ? 'text-emerald-400' : 'text-amber-400'}>
                        {r.doorSensorState !== false && r.doorState !== false ? 'LOCKED' : 'OPEN'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{(r.motorCurrentAmps || r.motorCurrent)?.toFixed(1)}</td>
                    <td className="py-2 px-2">
                      <span className={r.isAnomalyDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {r.isAnomalyDetected ? 'ALERT' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
