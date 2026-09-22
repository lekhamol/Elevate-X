package com.elevatortwin.service;

import com.elevatortwin.model.SensorReading;
import com.elevatortwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionService {

    private final SensorReadingRepository sensorReadingRepository;

    public List<SensorReading> getDatasetForTraining(String elevatorId, int limit) {
        String id = (elevatorId == null || elevatorId.isEmpty()) ? "ELV-01" : elevatorId;
        return sensorReadingRepository.findTop50ByElevatorIdOrderByTimestampDesc(id);
    }

    public Map<String, Object> updateAnomalyScores(List<Map<String, Object>> predictions) {
        int updated = 0;
        for (Map<String, Object> pred : predictions) {
            if (pred.containsKey("readingId") && pred.containsKey("score")) {
                Long readingId = Long.parseLong(pred.get("readingId").toString());
                Double score = Double.parseDouble(pred.get("score").toString());
                Boolean isAnomaly = Boolean.parseBoolean(pred.getOrDefault("isAnomaly", "false").toString());

                sensorReadingRepository.findById(readingId).ifPresent(r -> {
                    r.setAnomalyScore(score);
                    r.setIsAnomalyDetected(isAnomaly);
                    sensorReadingRepository.save(r);
                });
                updated++;
            }
        }
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("recordsProcessed", updated);
        res.put("message", "Scikit-Learn ML Anomaly predictions synchronized with Digital Twin backend.");
        return res;
    }
}
