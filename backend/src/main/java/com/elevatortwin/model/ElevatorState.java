package com.elevatortwin.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "elevator_states")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElevatorState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String elevatorId;

    private Integer currentFloor;
    private Integer targetFloor;

    // DOOR_CLOSED, DOOR_OPENING, DOOR_OPEN, DOOR_CLOSING, DOOR_STUCK
    private String doorStatus;

    // MOTOR_IDLE, MOTOR_RUNNING_UP, MOTOR_RUNNING_DOWN, MOTOR_STALLED, MOTOR_FAULT
    private String motorStatus;

    // IDLE, MOVING_UP, MOVING_DOWN, EMERGENCY_BRAKE
    private String direction;

    private Double currentSpeedMs;
    private Boolean emergencyStop;
    private String operationalMode; // NORMAL, SIMULATION, MAINTENANCE, EMERGENCY

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
