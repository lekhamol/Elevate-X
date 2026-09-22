package com.elevatortwin.dto;

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
    private Double temperature;
    private Double vibration;
    private Boolean doorState; // true = closed, false = open
    private Double motorCurrent;
    private Integer floorPosition;
    private Integer rssi;
}
