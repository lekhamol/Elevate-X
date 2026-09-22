package com.elevatortwin.controller;

import com.elevatortwin.service.SimulatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final SimulatorService simulatorService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("active", simulatorService.isSimulationActive());
        status.put("mode", "AUTONOMOUS_PHYSICS_ENGINE");
        return ResponseEntity.ok(status);
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleSimulator(@RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.getOrDefault("active", true);
        simulatorService.setSimulationActive(active);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("active", active);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/inject-fault")
    public ResponseEntity<Map<String, Object>> injectFault(@RequestBody Map<String, Object> payload) {
        String faultType = payload.getOrDefault("faultType", "OVER_TEMP").toString();
        Boolean active = Boolean.parseBoolean(payload.getOrDefault("active", "true").toString());
        simulatorService.injectFault(faultType, active);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "FAULT_INJECTED");
        res.put("faultType", faultType);
        res.put("active", active);
        return ResponseEntity.ok(res);
    }
}
