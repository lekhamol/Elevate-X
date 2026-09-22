package com.elevatortwin.controller;

import com.elevatortwin.model.SystemHealthMetric;
import com.elevatortwin.repository.SystemHealthMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class SystemHealthController {

    private final SystemHealthMetricRepository systemHealthMetricRepository;

    @GetMapping
    public ResponseEntity<SystemHealthMetric> getLatestHealth(@RequestParam(defaultValue = "ESP32-ELEVATOR-TWIN") String deviceId) {
        return systemHealthMetricRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(SystemHealthMetric.builder()
                        .deviceId(deviceId)
                        .ipAddress("192.168.1.105")
                        .wifiRssi(-62)
                        .uptimeSeconds(14200L)
                        .packetLossRate(0.0)
                        .pingLatencyMs(14L)
                        .firmwareVersion("v2.4.1-ESP32")
                        .databaseStatus("ONLINE_MYSQL")
                        .aiModuleStatus("READY")
                        .timestamp(LocalDateTime.now())
                        .build()));
    }
}
