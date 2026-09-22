package com.elevatortwin.service;

import com.elevatortwin.dto.TelemetryPayload;
import com.elevatortwin.model.ElevatorState;
import com.elevatortwin.model.SystemHealthMetric;
import com.elevatortwin.repository.SystemHealthMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class SimulatorService {

    private final TelemetryService telemetryService;
    private final ElevatorTwinService elevatorTwinService;
    private final SystemHealthMetricRepository systemHealthMetricRepository;

    private boolean simulationActive = true;
    private boolean injectOverTemp = false;
    private boolean injectHighVibration = false;
    private boolean injectUnsafeDoor = false;
    private boolean injectMotorStall = false;

    private final Random random = new Random();

    @Scheduled(fixedRate = 1000)
    public void runPhysicsStep() {
        if (!simulationActive) return;

        ElevatorState state = elevatorTwinService.getElevatorState("ELV-01");

        // Physics step: move cabin towards target floor if required
        if (!Boolean.TRUE.equals(state.getEmergencyStop())) {
            if (!state.getCurrentFloor().equals(state.getTargetFloor())) {
                state.setDoorStatus("DOOR_CLOSED");
                if (state.getTargetFloor() > state.getCurrentFloor()) {
                    state.setDirection("MOVING_UP");
                    state.setMotorStatus("MOTOR_RUNNING_UP");
                    state.setCurrentSpeedMs(1.5);
                    // Move 1 floor after physics tick
                    state.setCurrentFloor(state.getCurrentFloor() + 1);
                } else if (state.getTargetFloor() < state.getCurrentFloor()) {
                    state.setDirection("MOVING_DOWN");
                    state.setMotorStatus("MOTOR_RUNNING_DOWN");
                    state.setCurrentSpeedMs(1.5);
                    state.setCurrentFloor(state.getCurrentFloor() - 1);
                }
            } else {
                state.setDirection("IDLE");
                state.setMotorStatus("MOTOR_IDLE");
                state.setCurrentSpeedMs(0.0);
            }
        }

        // Calculate realistic physical telemetry values
        double temp = 27.0 + (random.nextDouble() * 2.5);
        if ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection())) {
            temp += 3.5; // motor heating during run
        }
        if (injectOverTemp) {
            temp = 68.4; // Critical over-temp fault injection
        }

        double vib = 0.4 + (random.nextDouble() * 0.6);
        if ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection())) {
            vib += 1.8;
        }
        if (injectHighVibration) {
            vib = 9.8; // Critical structural vibration fault injection
        }

        boolean doorClosed = true;
        if ("DOOR_OPEN".equals(state.getDoorStatus()) || "DOOR_OPENING".equals(state.getDoorStatus())) {
            doorClosed = false;
        }
        if (injectUnsafeDoor && ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection()))) {
            doorClosed = false; // Door opened while moving fault injection!
        }

        double motorCurrent = 0.8;
        if ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection())) {
            motorCurrent = 4.8 + (random.nextDouble() * 0.9);
        }
        if (injectMotorStall) {
            motorCurrent = 15.2; // Motor current overload spike
        }

        TelemetryPayload payload = TelemetryPayload.builder()
                .elevatorId("ELV-01")
                .temperature(Math.round(temp * 10.0) / 10.0)
                .vibration(Math.round(vib * 100.0) / 100.0)
                .doorState(doorClosed)
                .motorCurrent(Math.round(motorCurrent * 10.0) / 10.0)
                .floorPosition(state.getCurrentFloor())
                .rssi(-55 - random.nextInt(15))
                .build();

        telemetryService.ingestTelemetry(payload);

        // Update health metric
        SystemHealthMetric health = SystemHealthMetric.builder()
                .deviceId("ESP32-ELEVATOR-TWIN")
                .ipAddress("192.168.1.105")
                .wifiRssi(payload.getRssi())
                .uptimeSeconds(System.currentTimeMillis() / 1000)
                .packetLossRate(0.01)
                .pingLatencyMs((long) (12 + random.nextInt(15)))
                .firmwareVersion("v2.4.1-ESP32-C3")
                .databaseStatus("ONLINE_MYSQL")
                .aiModuleStatus("READY")
                .build();
        systemHealthMetricRepository.save(health);
    }

    public void setSimulationActive(boolean active) {
        this.simulationActive = active;
        log.info("Digital twin hardware simulation active: {}", active);
    }

    public boolean isSimulationActive() {
        return simulationActive;
    }

    public void injectFault(String faultType, boolean active) {
        switch (faultType.toUpperCase()) {
            case "OVER_TEMP":
                this.injectOverTemp = active;
                break;
            case "HIGH_VIBRATION":
                this.injectHighVibration = active;
                break;
            case "UNSAFE_DOOR":
                this.injectUnsafeDoor = active;
                break;
            case "MOTOR_STALL":
                this.injectMotorStall = active;
                break;
            default:
                log.warn("Unknown fault injection type: {}", faultType);
        }
        log.warn("FAULTS INJECTED -> Temp: {}, Vib: {}, Door: {}, Motor: {}",
                injectOverTemp, injectHighVibration, injectUnsafeDoor, injectMotorStall);
        // Force immediate tick
        runPhysicsStep();
    }
}
