package com.elevatortwin.controller;

import com.elevatortwin.dto.TelemetryPayload;
import com.elevatortwin.model.SensorReading;
import com.elevatortwin.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    // ESP32 or Simulator HTTP POST Ingest endpoint
    @PostMapping
    public ResponseEntity<SensorReading> postTelemetry(@RequestBody TelemetryPayload payload) {
        SensorReading reading = telemetryService.ingestTelemetry(payload);
        return ResponseEntity.ok(reading);
    }

    // Live Feed endpoint
    @GetMapping("/recent")
    public ResponseEntity<List<SensorReading>> getRecent(
            @RequestParam(defaultValue = "ELV-01") String elevatorId,
            @RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(telemetryService.getRecentReadings(elevatorId, limit));
    }

    // Historical range endpoint
    @GetMapping("/history")
    public ResponseEntity<List<SensorReading>> getHistory(
            @RequestParam(defaultValue = "ELV-01") String elevatorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        if (start == null) start = LocalDateTime.now().minusDays(7);
        if (end == null) end = LocalDateTime.now();

        return ResponseEntity.ok(telemetryService.getHistoricalReadings(elevatorId, start, end));
    }
}
