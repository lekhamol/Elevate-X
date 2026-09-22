package com.elevatortwin.controller;

import com.elevatortwin.dto.ElevatorCommandRequest;
import com.elevatortwin.model.ElevatorState;
import com.elevatortwin.service.ElevatorTwinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/elevator")
@RequiredArgsConstructor
public class ElevatorStateController {

    private final ElevatorTwinService elevatorTwinService;

    @GetMapping("/state")
    public ResponseEntity<ElevatorState> getState(@RequestParam(defaultValue = "ELV-01") String elevatorId) {
        return ResponseEntity.ok(elevatorTwinService.getElevatorState(elevatorId));
    }

    @PostMapping("/command")
    public ResponseEntity<ElevatorState> sendCommand(@RequestBody ElevatorCommandRequest command) {
        ElevatorState updated = elevatorTwinService.processCommand(command);
        return ResponseEntity.ok(updated);
    }
}
