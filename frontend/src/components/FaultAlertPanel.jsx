import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Activity,
  Thermometer,
  Zap,
  DoorOpen,
  Sparkles,
  WifiOff,
  Wrench,
  Check
} from 'lucide-react';

/**
 * FaultAlertPanel Component
 * Displays real-time threshold alerts, AI anomaly detections, and stale data warnings.
 * Each alert specifies:
 * - Severity (CRITICAL, WARNING, INFO)
 * - Elevator ID
 * - Timestamp
 * - Sensor Name
 * - Measured Value & Threshold
 * - Recommended Inspection Action
 */
export default function FaultAlertPanel({
  alerts = [],
  telemetry = {},
  isStale = false,
  isBackendConnected = true,
  onAcknowledgeAlert,
  onResolveAlert
}) {
  // Extract active unresolved alerts
  const activeAlerts = alerts.filter((a) => !a.resolved);

  // Derive sensor-based recommended action helper
  const getSensorAction = (alertType) => {
    switch (alertType?.toUpperCase()) {
      case 'EXCESSIVE_VIBRATION':
      case 'VIB_HIGH':
      case 'VIB_CRITICAL':
        return {
          sensor: 'MPU6050 Accelerometer / Shaft SW-420',
          action: 'Inspect guide rail vertical alignment, roller guides, and hoist cable tension.'
        };
      case 'HIGH_TEMPERATURE':
      case 'TEMP_HIGH':
      case 'TEMP_CRITICAL':
        return {
          sensor: 'DS18B20 Hoist Motor Thermistor',
          action: 'Verify machine room ventilation fan operation and motor thermal heatsink paste.'
        };
      case 'MOTOR_STALL':
      case 'MOTOR_STALL_CURRENT':
        return {
          sensor: 'ACS712 Current Transducer',
          action: 'Check counterweight balance, hoist brake mechanical release, and electrical contactor.'
        };
      case 'UNSAFE_DOOR_MOTION':
      case 'DOOR_UNSAFE_MOTION':
        return {
          sensor: 'Optical Interlock & Landing Reed Switch',
          action: 'Immediately halt cabin; calibrate door clutch interlock latch and photo-eye beam.'
        };
      case 'AI_ANOMALY':
      case 'ANOMALY_DETECTED':
        return {
          sensor: 'AI Isolation Forest Multi-Variate Telemetry Model',
          action: 'Review multi-sensor correlation matrix for anomalous vibration-temperature co-variance.'
        };
      default:
        return {
          sensor: 'Safety Supervisory Logic',
          action: 'Perform standard physical safety inspection of elevator shaft and controller rack.'
        };
    }
  };

  // Derive live immediate hazards from current telemetry if backend alert hasn't synced yet
  const liveHazards = [];

  if (!isBackendConnected) {
    liveHazards.push({
      id: 'backend-offline',
      alertType: 'NETWORK_DISCONNECT',
      severity: 'WARNING',
      title: 'Backend Disconnected / Offline',
      message: 'Unable to communicate with Spring Boot REST service. Local telemetry fallback active.',
      sensor: 'REST Network Interface (port 8080)',
      measured: 'Offline',
      action: 'Verify Spring Boot backend is running and network firewall permits port 8080 traffic.',
      timestamp: new Date().toISOString()
    });
  } else if (isStale) {
    liveHazards.push({
      id: 'stale-telemetry',
      alertType: 'STALE_DATA',
      severity: 'WARNING',
      title: 'Stale Sensor Telemetry (>10s)',
      message: 'No recent telemetry packets received from ESP32 gateway within expected timeout interval.',
      sensor: 'ESP32 Wi-Fi Gateway Telemetry',
      measured: 'Timeout > 10s',
      action: 'Check ESP32 Wi-Fi signal strength (RSSI), power supply rail, and MQTT/HTTP ingest logs.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  // Check live telemetry thresholds
  if (telemetry.vibrationMs2 >= 8.5) {
    liveHazards.push({
      id: 'live-vib-crit',
      alertType: 'EXCESSIVE_VIBRATION',
      severity: 'CRITICAL',
      title: 'CRITICAL: Severe Shaft Vibration Spike',
      message: `Vibration measured at ${telemetry.vibrationMs2.toFixed(2)} m/s² (safety limit: 8.5 m/s²).`,
      sensor: 'MPU6050 3-Axis Accelerometer',
      measured: `${telemetry.vibrationMs2.toFixed(2)} m/s² (Limit: 8.5 m/s²)`,
      action: 'Immediate brake clamp mandatory; inspect guide shoe dampers and pulley bearings.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  } else if (telemetry.vibrationMs2 >= 5.0) {
    liveHazards.push({
      id: 'live-vib-warn',
      alertType: 'EXCESSIVE_VIBRATION',
      severity: 'WARNING',
      title: 'Elevated Shaft Vibration',
      message: `Vibration elevated at ${telemetry.vibrationMs2.toFixed(2)} m/s² (smooth threshold: 5.0 m/s²).`,
      sensor: 'MPU6050 3-Axis Accelerometer',
      measured: `${telemetry.vibrationMs2.toFixed(2)} m/s² (Limit: 5.0 m/s²)`,
      action: 'Schedule routine preventive check of guide rail lubrication and cabin brackets.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  if (telemetry.temperatureCelsius >= 60.0) {
    liveHazards.push({
      id: 'live-temp-crit',
      alertType: 'HIGH_TEMPERATURE',
      severity: 'CRITICAL',
      title: 'CRITICAL: Thermal Fire Hazard',
      message: `Temperature reached ${telemetry.temperatureCelsius.toFixed(1)} °C (critical limit: 60.0 °C).`,
      sensor: 'DS18B20 Digital Thermometer',
      measured: `${telemetry.temperatureCelsius.toFixed(1)} °C (Limit: 60.0 °C)`,
      action: 'Emergency motor cooling required. Dispatch fire safety technician immediately.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  } else if (telemetry.temperatureCelsius >= 45.0) {
    liveHazards.push({
      id: 'live-temp-warn',
      alertType: 'HIGH_TEMPERATURE',
      severity: 'WARNING',
      title: 'Elevated Cabin / Motor Room Temperature',
      message: `Temperature elevated at ${telemetry.temperatureCelsius.toFixed(1)} °C (upper limit: 45.0 °C).`,
      sensor: 'DS18B20 Digital Thermometer',
      measured: `${telemetry.temperatureCelsius.toFixed(1)} °C (Limit: 45.0 °C)`,
      action: 'Verify ventilation airflow and inspect drive heat sinks.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  if (telemetry.motorCurrentAmps >= 12.5) {
    liveHazards.push({
      id: 'live-motor-crit',
      alertType: 'MOTOR_STALL',
      severity: 'CRITICAL',
      title: 'CRITICAL: Hoist Motor Over-Current Stall Risk',
      message: `Motor current spiked to ${telemetry.motorCurrentAmps.toFixed(1)} A (overload threshold: 12.5 A).`,
      sensor: 'ACS712 Current Transducer',
      measured: `${telemetry.motorCurrentAmps.toFixed(1)} A (Limit: 12.5 A)`,
      action: 'Trip electrical circuit breaker; check mechanical cable obstruction and counterweight.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  const isDoorOpen = telemetry.doorSensorState === false || telemetry.doorState === false;
  const isMoving = telemetry.direction === 'UP' || telemetry.direction === 'DOWN';
  if (isDoorOpen && isMoving) {
    liveHazards.push({
      id: 'live-door-crit',
      alertType: 'UNSAFE_DOOR_MOTION',
      severity: 'CRITICAL',
      title: 'CRITICAL: Door Open During Cabin Movement!',
      message: 'Interlock failure detected: Landing/car doors open while hoist motor is driving.',
      sensor: 'Door Interlock Reed Sensor',
      measured: 'State: OPEN while in transit',
      action: 'Emergency brake must engage immediately; calibrate door contact interlock circuit.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  if (telemetry.isAnomalyDetected || (telemetry.anomalyScore && telemetry.anomalyScore >= 0.7)) {
    liveHazards.push({
      id: 'live-ai-anomaly',
      alertType: 'AI_ANOMALY',
      severity: 'WARNING',
      title: 'AI Anomaly Detected (Isolation Forest ML)',
      message: `Multi-sensor anomalous behavior pattern recognized with score ${telemetry.anomalyScore.toFixed(2)}.`,
      sensor: 'AI Machine Learning Anomaly Classifier',
      measured: `Score: ${telemetry.anomalyScore.toFixed(2)} (Threshold: 0.50)`,
      action: 'Correlate sensor trends with historical mechanical baseline to isolate precursor faults.',
      timestamp: telemetry.timestamp || new Date().toISOString()
    });
  }

  // Combine backend alerts with unique live hazards
  const combinedAlerts = [...activeAlerts];
  liveHazards.forEach((lh) => {
    const alreadyListed = combinedAlerts.some((a) => a.alertType === lh.alertType);
    if (!alreadyListed) {
      combinedAlerts.push(lh);
    }
  });

  const criticalCount = combinedAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = combinedAlerts.filter((a) => a.severity === 'WARNING').length;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${
            criticalCount > 0 ? 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse' :
            warningCount > 0 ? 'bg-amber-950 text-amber-400 border-amber-700' :
            'bg-emerald-950 text-emerald-400 border-emerald-800'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              Fault Alerts & Safety Inspection Center
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Threshold-based rules engine & AI anomaly detection audit log
            </p>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded-lg border font-bold ${
            criticalCount > 0 ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {criticalCount} Critical
          </span>
          <span className={`px-2.5 py-1 rounded-lg border font-bold ${
            warningCount > 0 ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {warningCount} Warning
          </span>
        </div>
      </div>

      {/* Prominent Banner if Critical Hazards Exist */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-100 flex items-start space-x-3 shadow-lg shadow-rose-950/50 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <p className="font-bold uppercase tracking-wider text-rose-200">
              Active Critical Elevator Safety Hazard!
            </p>
            <p className="text-rose-300">
              One or more parameters exceed emergency threshold limits. Refer to recommended inspection actions below.
            </p>
          </div>
        </div>
      )}

      {/* Alerts Feed */}
      {combinedAlerts.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="text-sm font-bold text-slate-200 font-mono">All Systems Operating Normally</p>
          <p className="text-xs text-slate-500 font-mono">
            No active threshold violations, interlock faults, or sensor staleness detected.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {combinedAlerts.map((alert) => {
            const meta = getSensorAction(alert.alertType);
            const sensorName = alert.sensor || meta.sensor;
            const inspectionAction = alert.action || meta.action;
            const isAI = alert.alertType?.includes('AI') || alert.alertType?.includes('ANOMALY');

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/70 border-rose-700 text-rose-200 shadow-sm'
                    : 'bg-amber-950/70 border-amber-700 text-amber-200 shadow-sm'
                }`}
              >
                {/* Title & Severity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2">
                    {isAI ? (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-current" />
                    )}
                    <span className="font-bold text-white text-sm">{alert.title}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {alert.elevatorId || 'ELV-01'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Live'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-200 text-xs">{alert.message}</p>

                {/* Sensor & Measured Value Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-slate-400">Sensor: </span>
                    <span className="text-cyan-300 font-semibold">{sensorName}</span>
                  </div>
                  {alert.measured && (
                    <div>
                      <span className="text-slate-400">Measured: </span>
                      <span className="text-amber-300 font-bold">{alert.measured}</span>
                    </div>
                  )}
                </div>

                {/* Recommended Inspection Action */}
                <div className="text-[11px] flex items-start space-x-1.5 text-slate-300 pt-0.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-cyan-300">Recommended Action: </strong>
                    {inspectionAction}
                  </span>
                </div>

                {/* Actions (if backend-persisted alert) */}
                {typeof alert.id === 'number' && (
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                    {!alert.acknowledged && onAcknowledgeAlert && (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                    {onResolveAlert && (
                      <button
                        type="button"
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-mono flex items-center space-x-1 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve Hazard</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
