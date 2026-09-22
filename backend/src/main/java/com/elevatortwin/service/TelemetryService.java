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
                .anomalyScore(0.02)
                .isAnomalyDetected(false)
                .timestamp(LocalDateTime.now())
                .build();

        SensorReading savedReading = sensorReadingRepository.save(reading);

        // Fetch & update elevator state
        ElevatorState state = elevatorTwinService.getElevatorState(elevatorId);
        if (payload.getFloorPosition() != null) {
            state.setCurrentFloor(payload.getFloorPosition());
        }

        // Run rule engine
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
