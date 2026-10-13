package com.elevatortwin.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryPayload {

    private String elevatorId;

    @JsonAlias({"temperatureCelsius", "temp"})
    private Double temperature;

    @JsonAlias({"vibrationMs2", "vib"})
    private Double vibration;

    @JsonAlias({"doorSensorState", "doorClosed"})
    private Boolean doorState; // true = closed/locked, false = open

    @JsonAlias({"motorCurrentAmps", "current"})
    private Double motorCurrent;

    @JsonAlias({"floorHallSensor", "floor", "currentFloor"})
    private Integer floorPosition; // 1 to 5

    @JsonAlias({"rawRssi"})
    private Integer rssi;

    private Double anomalyScore;
    private Boolean isAnomalyDetected;

    private String direction; // UP, DOWN, IDLE
    private Double healthScore;
    private String healthStatus;
}
