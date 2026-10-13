package com.elevatortwin.service;

import com.elevatortwin.dto.TelemetryPayload;
import com.elevatortwin.model.ElevatorState;
import com.elevatortwin.model.SensorReading;
import com.elevatortwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final SensorReadingRepository sensorReadingRepository;
    private final ElevatorTwinService elevatorTwinService;
    private final SafetyEngineService safetyEngineService;

    public SensorReading ingestTelemetry(TelemetryPayload payload) {
        String elevatorId = (payload.getElevatorId() == null || payload.getElevatorId().isEmpty())
                ? "ELV-01" : payload.getElevatorId();

        SensorReading reading = SensorReading.builder()
                .elevatorId(elevatorId)
                .temperatureCelsius(payload.getTemperature() != null ? payload.getTemperature() : 28.5)
                .vibrationMs2(payload.getVibration() != null ? payload.getVibration() : 0.8)
                .doorSensorState(payload.getDoorState() != null ? payload.getDoorState() : true)
                .motorCurrentAmps(payload.getMotorCurrent() != null ? payload.getMotorCurrent() : 4.2)
                .floorHallSensor(payload.getFloorPosition() != null ? payload.getFloorPosition() : 1)
                .rawRssi(payload.getRssi() != null ? payload.getRssi() : -62)
                .anomalyScore(payload.getAnomalyScore() != null ? payload.getAnomalyScore() : 0.02)
                .isAnomalyDetected(payload.getIsAnomalyDetected() != null ? payload.getIsAnomalyDetected() : false)
                .timestamp(LocalDateTime.now())
                .build();

        // Fetch elevator state for physics & interlock evaluation
        ElevatorState state = elevatorTwinService.getElevatorState(elevatorId);
        if (payload.getFloorPosition() != null) {
            state.setCurrentFloor(payload.getFloorPosition());
        }
        if (payload.getDirection() != null && !payload.getDirection().isEmpty()) {
            String dir = payload.getDirection().toUpperCase();
            if (dir.contains("UP")) {
                state.setDirection("MOVING_UP");
                state.setMotorStatus("MOTOR_RUNNING_UP");
                state.setCurrentSpeedMs(1.2);
            } else if (dir.contains("DOWN")) {
                state.setDirection("MOVING_DOWN");
                state.setMotorStatus("MOTOR_RUNNING_DOWN");
                state.setCurrentSpeedMs(1.2);
            } else {
                state.setDirection("IDLE");
                state.setMotorStatus("MOTOR_IDLE");
                state.setCurrentSpeedMs(0.0);
            }
        }
        if (Boolean.FALSE.equals(payload.getDoorState())) {
            state.setDoorStatus("DOOR_OPEN");
        } else if (Boolean.TRUE.equals(payload.getDoorState())) {
            state.setDoorStatus("DOOR_CLOSED");
        }

        // Calculate 0-100 Health Score & Classification (Normal, Warning, Attention, Critical)
        SafetyEngineService.HealthResult health = safetyEngineService.calculateHealthScore(reading, state);
        reading.setHealthScore(health.score);
        reading.setHealthStatus(health.status);

        SensorReading savedReading = sensorReadingRepository.save(reading);

        // Run safety rules engine & alerts
        safetyEngineService.evaluateReading(savedReading, state);
        elevatorTwinService.saveState(state);

        return savedReading;
    }

    public List<SensorReading> getRecentReadings(String elevatorId, int limit) {
        String id = (elevatorId == null || elevatorId.isEmpty()) ? "ELV-01" : elevatorId;
        return sensorReadingRepository.findRecentReadings(id, PageRequest.of(0, limit));
    }

    public List<SensorReading> getHistoricalReadings(String elevatorId, LocalDateTime start, LocalDateTime end) {
        String id = (elevatorId == null || elevatorId.isEmpty()) ? "ELV-01" : elevatorId;
        return sensorReadingRepository.findByElevatorIdAndTimestampBetweenOrderByTimestampAsc(id, start, end);
    }
}
