package com.elevatortwin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_health_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemHealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId; // ESP32-DEV-01
    private String ipAddress;
    private Integer wifiRssi; // dBm e.g. -65
    private Long uptimeSeconds;
    private Double packetLossRate;
    private Long pingLatencyMs;
    private String firmwareVersion;
    private String databaseStatus; // ONLINE, FALLBACK_H2, DEGRADED
    private String aiModuleStatus; // READY, CONNECTED, OFFLINE
    private LocalDateTime timestamp;

    @PrePersist
    public void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
