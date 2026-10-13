/**
 * Elevator Digital Twin - Multi-Floor Autonomous Simulation Engine
 * Simulates elevator physics, floor transitions (1-5), door cycles,
 * sensor fluctuations, and fault injection scenarios.
 */
export class ElevatorSimulationEngine {
  constructor(elevatorId = 'ELV-01') {
    this.elevatorId = elevatorId;
    this.currentFloor = 1;
    this.targetFloor = 2;
    this.direction = 'IDLE'; // 'UP', 'DOWN', 'IDLE'
    this.doorState = true;   // true = closed/locked, false = open
    this.doorDwellTicks = 0;
    this.temperature = 27.5;
    this.vibration = 0.55;
    this.motorCurrent = 0.8;
    this.rssi = -64;
    this.scenario = 'NORMAL'; // 'NORMAL', 'EXCESSIVE_VIBRATION', 'DOOR_MALFUNCTION'
    this.anomalyScore = 0.02;
    this.isAnomalyDetected = false;
    this.movingUpPattern = true; // toggles between climbing to 5 and descending to 1
  }

  setScenario(scenario) {
    this.scenario = scenario;
    if (scenario === 'NORMAL') {
      this.isAnomalyDetected = false;
      this.anomalyScore = 0.02;
    }
  }

  callFloor(target) {
    const floor = Math.max(1, Math.min(5, target));
    this.targetFloor = floor;
    if (this.currentFloor !== this.targetFloor) {
      this.doorState = true;
      this.direction = this.targetFloor > this.currentFloor ? 'UP' : 'DOWN';
    }
  }

  step() {
    // 1. Elevator Door & Movement State Machine
    if (!this.doorState) {
      // Doors are currently open at floor
      this.doorDwellTicks += 1;
      this.direction = 'IDLE';

      if (this.doorDwellTicks >= 1) {
        // Close doors after passenger dwell
        this.doorState = true;
        this.doorDwellTicks = 0;

        // Determine next destination in continuous traversal pattern
        if (this.currentFloor >= 5) {
          this.movingUpPattern = false;
          this.targetFloor = 4;
        } else if (this.currentFloor <= 1) {
          this.movingUpPattern = true;
          this.targetFloor = 2;
        } else if (this.movingUpPattern) {
          this.targetFloor = this.currentFloor + 1;
        } else {
          this.targetFloor = this.currentFloor - 1;
        }

        this.direction = this.targetFloor > this.currentFloor ? 'UP' : 'DOWN';
      }
    } else {
      // Doors are closed - move elevator cabin towards target
      if (this.currentFloor !== this.targetFloor) {
        if (this.targetFloor > this.currentFloor) {
          this.direction = 'UP';
          this.currentFloor = Math.min(5, this.currentFloor + 1);
        } else {
          this.direction = 'DOWN';
          this.currentFloor = Math.max(1, this.currentFloor - 1);
        }

        // If arrived at target floor, open doors
        if (this.currentFloor === this.targetFloor) {
          this.direction = 'IDLE';
          this.doorState = false; // Open doors at landing
          this.doorDwellTicks = 0;
        }
      } else {
        // At target floor, open doors
        this.direction = 'IDLE';
        this.doorState = false;
        this.doorDwellTicks = 0;
      }
    }

    // 2. Compute Realistic Sensor Physics
    if (this.direction === 'UP' || this.direction === 'DOWN') {
      // Motor active
      this.motorCurrent = 4.4 + Math.random() * 0.9; // 4.4 - 5.3 A
      this.vibration = 0.55 + Math.random() * 0.5;   // 0.55 - 1.05 m/s²
      this.temperature = Math.min(31.5, this.temperature + 0.15 + Math.random() * 0.1);
    } else {
      // Motor idle
      this.motorCurrent = 0.7 + Math.random() * 0.2; // 0.7 - 0.9 A
      this.vibration = 0.12 + Math.random() * 0.18;  // 0.12 - 0.30 m/s²
      this.temperature = Math.max(26.2, this.temperature - 0.12);
    }

    this.rssi = -64 + Math.floor(Math.random() * 7 - 3);

    // 3. Apply Scenario / Fault Injection
    if (this.scenario === 'EXCESSIVE_VIBRATION') {
      // Critical rail/cable vibration anomaly (> 7.5 m/s²)
      this.vibration = 8.4 + Math.random() * 1.5;
      this.anomalyScore = 0.92;
      this.isAnomalyDetected = true;
    } else if (this.scenario === 'DOOR_MALFUNCTION') {
      // Door malfunction: door reported open during transit or failing to lock
      this.doorState = false;
      this.anomalyScore = 0.88;
      this.isAnomalyDetected = true;
    } else {
      // Normal Operation
      this.anomalyScore = 0.01 + Math.random() * 0.03;
      this.isAnomalyDetected = false;
    }

    return {
      elevatorId: this.elevatorId,
      temperatureCelsius: Number(this.temperature.toFixed(1)),
      vibrationMs2: Number(this.vibration.toFixed(2)),
      doorSensorState: this.doorState,
      motorCurrentAmps: Number(this.motorCurrent.toFixed(1)),
      floorHallSensor: this.currentFloor,
      rawRssi: this.rssi,
      anomalyScore: Number(this.anomalyScore.toFixed(2)),
      isAnomalyDetected: this.isAnomalyDetected,
      direction: this.direction,
      timestamp: new Date().toISOString()
    };
  }
}

export const defaultSimulator = new ElevatorSimulationEngine('ELV-01');
