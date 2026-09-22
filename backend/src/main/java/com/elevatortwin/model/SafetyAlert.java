package com.elevatortwin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "safety_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String elevatorId;
    private String alertType; // HIGH_TEMPERATURE, EXCESSIVE_VIBRATION, UNSAFE_DOOR_MOTION, MOTOR_STALL, EMERGENCY_STOP
    private String severity;  // INFO, WARNING, CRITICAL
    private String title;
    private String message;

    private Double triggeredValue;
    private Double thresholdLimit;

    private Boolean acknowledged;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;

    private Boolean resolved;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;

    private LocalDateTime timestamp;

    @PrePersist
    public void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.acknowledged == null) {
            this.acknowledged = false;
        }
        if (this.resolved == null) {
            this.resolved = false;
        }
    }
}
