package com.elevatortwin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String elevatorId;

    private Double temperatureCelsius;
    private Double vibrationMs2;
    private Boolean doorSensorState; // true = Closed, false = Open
    private Double motorCurrentAmps;
    private Integer floorHallSensor; // 1 to 5
    private Integer rawRssi; // ESP32 Wi-Fi Signal Strength
    private Double anomalyScore; // Scikit-Learn predictions (0.0 to 1.0)
    private Boolean isAnomalyDetected;

    private LocalDateTime timestamp;

    @PrePersist
    public void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
