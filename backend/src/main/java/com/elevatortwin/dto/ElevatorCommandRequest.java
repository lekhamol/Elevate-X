package com.elevatortwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElevatorCommandRequest {
    private String elevatorId;
    private String action; // CALL_FLOOR, OPEN_DOORS, CLOSE_DOORS, EMERGENCY_STOP, RESET_FAULT
    private Integer targetFloor;
}
