package com.elevatortwin.controller;

import com.elevatortwin.model.SafetyAlert;
import com.elevatortwin.repository.SafetyAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertsController {

    private final SafetyAlertRepository safetyAlertRepository;

    @GetMapping
    public ResponseEntity<List<SafetyAlert>> getAlerts(
            @RequestParam(defaultValue = "ELV-01") String elevatorId,
            @RequestParam(required = false) Boolean unresolvedOnly) {
        if (Boolean.TRUE.equals(unresolvedOnly)) {
            return ResponseEntity.ok(safetyAlertRepository.findByElevatorIdAndResolvedFalseOrderByTimestampDesc(elevatorId));
        }
        return ResponseEntity.ok(safetyAlertRepository.findByElevatorIdOrderByTimestampDesc(elevatorId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("unresolvedCount", safetyAlertRepository.countByResolvedFalse());
        summary.put("criticalCount", safetyAlertRepository.countBySeverityAndResolvedFalse("CRITICAL"));
        summary.put("warningCount", safetyAlertRepository.countBySeverityAndResolvedFalse("WARNING"));
        summary.put("infoCount", safetyAlertRepository.countBySeverityAndResolvedFalse("INFO"));
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<SafetyAlert> acknowledgeAlert(@PathVariable Long id, @RequestParam(defaultValue = "Operator") String user) {
        return safetyAlertRepository.findById(id).map(alert -> {
            alert.setAcknowledged(true);
            alert.setAcknowledgedBy(user);
            alert.setAcknowledgedAt(LocalDateTime.now());
            return ResponseEntity.ok(safetyAlertRepository.save(alert));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<SafetyAlert> resolveAlert(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String notes = body.getOrDefault("notes", "Resolved by Safety Engineering team");
        return safetyAlertRepository.findById(id).map(alert -> {
            alert.setResolved(true);
            alert.setResolutionNotes(notes);
            alert.setResolvedAt(LocalDateTime.now());
            return ResponseEntity.ok(safetyAlertRepository.save(alert));
        }).orElse(ResponseEntity.notFound().build());
    }
}
