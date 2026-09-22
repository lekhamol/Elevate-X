package com.elevatortwin.service;

import com.elevatortwin.dto.ElevatorCommandRequest;
import com.elevatortwin.model.ElevatorState;
import com.elevatortwin.repository.ElevatorStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElevatorTwinService {

    private final ElevatorStateRepository elevatorStateRepository;

    private static final String DEFAULT_ELEVATOR_ID = "ELV-01";

    @PostConstruct
    public void initElevatorState() {
        if (elevatorStateRepository.findByElevatorId(DEFAULT_ELEVATOR_ID).isEmpty()) {
            ElevatorState initialState = ElevatorState.builder()
                    .elevatorId(DEFAULT_ELEVATOR_ID)
                    .currentFloor(1)
                    .targetFloor(1)
                    .doorStatus("DOOR_CLOSED")
                    .motorStatus("MOTOR_IDLE")
                    .direction("IDLE")
                    .currentSpeedMs(0.0)
                    .emergencyStop(false)
                    .operationalMode("NORMAL")
                    .build();
            elevatorStateRepository.save(initialState);
            log.info("Initialized default Elevator Digital Twin state: {}", DEFAULT_ELEVATOR_ID);
        }
    }

    public ElevatorState getElevatorState(String elevatorId) {
        String id = (elevatorId == null || elevatorId.isEmpty()) ? DEFAULT_ELEVATOR_ID : elevatorId;
        return elevatorStateRepository.findByElevatorId(id)
                .orElseGet(() -> {
                    ElevatorState newState = ElevatorState.builder()
                            .elevatorId(id)
                            .currentFloor(1)
                            .targetFloor(1)
                            .doorStatus("DOOR_CLOSED")
                            .motorStatus("MOTOR_IDLE")
                            .direction("IDLE")
                            .currentSpeedMs(0.0)
                            .emergencyStop(false)
                            .operationalMode("NORMAL")
                            .build();
                    return elevatorStateRepository.save(newState);
                });
    }

    public ElevatorState processCommand(ElevatorCommandRequest command) {
        ElevatorState state = getElevatorState(command.getElevatorId());

        if (Boolean.TRUE.equals(state.getEmergencyStop()) && !"RESET_FAULT".equalsIgnoreCase(command.getAction())) {
            log.warn("Command rejected: Elevator is under Emergency Stop override!");
            return state;
        }

        switch (command.getAction().toUpperCase()) {
            case "CALL_FLOOR":
                if (command.getTargetFloor() != null && command.getTargetFloor() >= 1 && command.getTargetFloor() <= 5) {
                    state.setTargetFloor(command.getTargetFloor());
                    if (!state.getTargetFloor().equals(state.getCurrentFloor())) {
                        state.setDoorStatus("DOOR_CLOSED");
                        if (state.getTargetFloor() > state.getCurrentFloor()) {
                            state.setDirection("MOVING_UP");
                            state.setMotorStatus("MOTOR_RUNNING_UP");
                            state.setCurrentSpeedMs(1.5);
                        } else {
                            state.setDirection("MOVING_DOWN");
                            state.setMotorStatus("MOTOR_RUNNING_DOWN");
                            state.setCurrentSpeedMs(1.5);
                        }
                    }
                }
                break;

            case "OPEN_DOORS":
                if ("IDLE".equalsIgnoreCase(state.getDirection())) {
                    state.setDoorStatus("DOOR_OPEN");
                } else {
                    log.warn("Safety interlock prevents opening doors while elevator cabin is moving!");
                }
                break;

            case "CLOSE_DOORS":
                state.setDoorStatus("DOOR_CLOSED");
                break;

            case "EMERGENCY_STOP":
                state.setEmergencyStop(true);
                state.setDirection("EMERGENCY_BRAKE");
                state.setMotorStatus("MOTOR_STALLED");
                state.setDoorStatus("DOOR_CLOSED");
                state.setCurrentSpeedMs(0.0);
                log.warn("EMERGENCY STOP ENGAGED FOR ELEVATOR DIGITAL TWIN!");
                break;

            case "RESET_FAULT":
                state.setEmergencyStop(false);
                state.setDirection("IDLE");
                state.setMotorStatus("MOTOR_IDLE");
                state.setDoorStatus("DOOR_CLOSED");
                state.setCurrentSpeedMs(0.0);
                log.info("Emergency fault override reset successfully.");
                break;

            default:
                log.warn("Unknown elevator command action: {}", command.getAction());
        }

        return elevatorStateRepository.save(state);
    }

    public ElevatorState saveState(ElevatorState state) {
        return elevatorStateRepository.save(state);
    }
}
