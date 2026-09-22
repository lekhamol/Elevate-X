package com.elevatortwin.controller;

import com.elevatortwin.model.SensorReading;
import com.elevatortwin.service.AnomalyDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLIntegrationController {

    private final AnomalyDetectionService anomalyDetectionService;

    // Export dataset vector for Python Scikit-Learn training
    @GetMapping("/telemetry-dataset")
    public ResponseEntity<List<SensorReading>> getTrainingData(
            @RequestParam(defaultValue = "ELV-01") String elevatorId,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(anomalyDetectionService.getDatasetForTraining(elevatorId, limit));
    }

    // Endpoint for Python Scikit-Learn model to push back anomaly predictions
    @PostMapping("/anomaly-predictions")
    public ResponseEntity<Map<String, Object>> receivePredictions(@RequestBody List<Map<String, Object>> predictions) {
        return ResponseEntity.ok(anomalyDetectionService.updateAnomalyScores(predictions));
    }
}
