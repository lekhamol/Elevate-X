package com.elevatortwin.service;

import com.elevatortwin.model.ElevatorState;
import com.elevatortwin.model.SafetyAlert;
import com.elevatortwin.model.SafetyRule;
import com.elevatortwin.model.SensorReading;
import com.elevatortwin.repository.SafetyAlertRepository;
import com.elevatortwin.repository.SafetyRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SafetyEngineService {

    private final SafetyRuleRepository safetyRuleRepository;
    private final SafetyAlertRepository safetyAlertRepository;

    @PostConstruct
    public void initDefaultRules() {
        if (safetyRuleRepository.count() == 0) {
            log.info("Initializing default safety rules in database...");
            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("TEMP_HIGH")
                    .name("Elevator Over-Temperature Warning")
                    .description("Triggers when cabin or motor room temperature exceeds upper safety limit")
                    .thresholdValue(45.0)
                    .unit("°C")
                    .operator("GREATER_THAN")
                    .defaultSeverity("WARNING")
                    .enabled(true)
                    .build());

            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("TEMP_CRITICAL")
                    .name("Elevator Over-Temperature Critical Fire Hazard")
                    .description("Critical thermal anomaly, potential motor fire hazard")
                    .thresholdValue(60.0)
                    .unit("°C")
                    .operator("GREATER_THAN")
                    .defaultSeverity("CRITICAL")
                    .enabled(true)
                    .build());

            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("VIB_HIGH")
                    .name("Excessive Mechanical Vibration")
                    .description("Detects guide rail misalignment, cable friction or bearing degradation")
                    .thresholdValue(5.0)
                    .unit("m/s²")
                    .operator("GREATER_THAN")
                    .defaultSeverity("WARNING")
                    .enabled(true)
                    .build());

            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("VIB_CRITICAL")
                    .name("Dangerous Mechanical Structural Vibration")
                    .description("Severe mechanical instability requiring immediate brake clamp")
                    .thresholdValue(8.5)
                    .unit("m/s²")
                    .operator("GREATER_THAN")
                    .defaultSeverity("CRITICAL")
                    .enabled(true)
                    .build());

            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("DOOR_UNSAFE_MOTION")
                    .name("Unsafe Door Motion Interlock Hazard")
                    .description("Triggers if doors are open while motor is actively driving elevator cabin")
                    .thresholdValue(0.0)
                    .unit("State")
                    .operator("EQUALS")
                    .defaultSeverity("CRITICAL")
                    .enabled(true)
                    .build());

            safetyRuleRepository.save(SafetyRule.builder()
                    .ruleKey("MOTOR_STALL_CURRENT")
                    .name("Motor Over-Current Stall Risk")
                    .description("High current draw indicating stuck mechanical pulley or cable snag")
                    .thresholdValue(12.5)
                    .unit("A")
                    .operator("GREATER_THAN")
                    .defaultSeverity("CRITICAL")
                    .enabled(true)
                    .build());
        }
    }

    /**
     * Calculates the 0-100 numerical Health Score and classifies the status:
     * - 85 - 100 : Normal (Green)
     * - 70 - 84  : Warning (Cyan)
     * - 50 - 69  : Attention (Amber)
     * - < 50     : Critical (Red)
     */
    public HealthResult calculateHealthScore(SensorReading reading, ElevatorState state) {
        if (reading == null) {
            return new HealthResult(100.0, "Normal");
        }

        double score = 100.0;

        // 1. Temperature Deductions
        double temp = reading.getTemperatureCelsius() != null ? reading.getTemperatureCelsius() : 25.0;
        if (temp > 60.0) {
            score -= 35.0 + Math.min(20.0, (temp - 60.0) * 2.0);
        } else if (temp > 45.0) {
            score -= 10.0 + ((temp - 45.0) / 15.0) * 15.0;
        } else if (temp > 38.0) {
            score -= ((temp - 38.0) / 7.0) * 5.0;
        }

        // 2. Vibration Deductions
        double vib = reading.getVibrationMs2() != null ? reading.getVibrationMs2() : 0.5;
        if (vib > 8.5) {
            score -= 30.0 + Math.min(20.0, (vib - 8.5) * 4.0);
        } else if (vib > 5.0) {
            score -= 12.0 + ((vib - 5.0) / 3.5) * 15.0;
        } else if (vib > 2.0) {
            score -= ((vib - 2.0) / 3.0) * 6.0;
        }

        // 3. Motor Current Deductions
        double current = reading.getMotorCurrentAmps() != null ? reading.getMotorCurrentAmps() : 4.0;
        if (current > 12.5) {
            score -= 25.0 + Math.min(15.0, (current - 12.5) * 3.0);
        } else if (current > 8.0) {
            score -= ((current - 8.0) / 4.5) * 10.0;
        }

        // 4. Door Motion Interlock Deduction
        if (state != null && Boolean.FALSE.equals(reading.getDoorSensorState()) &&
                ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection()))) {
            score -= 35.0;
        }

        // 5. ML Anomaly Score Deduction
        double anomaly = reading.getAnomalyScore() != null ? reading.getAnomalyScore() : 0.0;
        score -= (anomaly * 25.0);

        if (Boolean.TRUE.equals(reading.getIsAnomalyDetected())) {
            score -= 15.0;
        }

        // Clamp final score between 0.0 and 100.0
        double finalScore = Math.max(0.0, Math.min(100.0, Math.round(score * 10.0) / 10.0));

        // Classify Status: Normal, Warning, Attention, Critical
        String status;
        if (finalScore >= 85.0) {
            status = "Normal";
        } else if (finalScore >= 70.0) {
            status = "Warning";
        } else if (finalScore >= 50.0) {
            status = "Attention";
        } else {
            status = "Critical";
        }

        return new HealthResult(finalScore, status);
    }

    public static class HealthResult {
        public final double score;
        public final String status;

        public HealthResult(double score, String status) {
            this.score = score;
            this.status = status;
        }
    }

    public void evaluateReading(SensorReading reading, ElevatorState state) {
        if (reading == null) return;

        // Calculate and set Health Score & Health Status
        HealthResult health = calculateHealthScore(reading, state);
        reading.setHealthScore(health.score);
        reading.setHealthStatus(health.status);

        // Generate Alert if Health Score drops below 50.0
        if (health.score < 50.0) {
            createAlert(reading.getElevatorId(), "HEALTH_SCORE_CRITICAL", "CRITICAL",
                    "CRITICAL: Elevator Health Score Below 50!",
                    String.format("Overall Health Score dropped to %.1f (%s status). Immediate inspection recommended.",
                            health.score, health.status),
                    health.score, 50.0);
        }

        List<SafetyRule> activeRules = safetyRuleRepository.findAll();

        for (SafetyRule rule : activeRules) {
            if (!Boolean.TRUE.equals(rule.getEnabled())) continue;

            switch (rule.getRuleKey()) {
                case "TEMP_CRITICAL":
                    if (reading.getTemperatureCelsius() != null && reading.getTemperatureCelsius() >= rule.getThresholdValue()) {
                        createAlert(reading.getElevatorId(), "HIGH_TEMPERATURE", "CRITICAL",
                                "CRITICAL: Elevator Over-Temperature Detected!",
                                String.format("Temperature reading (%.1f °C) exceeds critical safety limit (%.1f °C). Emergency cooling required.",
                                        reading.getTemperatureCelsius(), rule.getThresholdValue()),
                                reading.getTemperatureCelsius(), rule.getThresholdValue());
                    }
                    break;

                case "TEMP_HIGH":
                    if (reading.getTemperatureCelsius() != null &&
                            reading.getTemperatureCelsius() >= rule.getThresholdValue() &&
                            reading.getTemperatureCelsius() < 60.0) {
                        createAlert(reading.getElevatorId(), "HIGH_TEMPERATURE", "WARNING",
                                "Elevator Temperature High",
                                String.format("Elevator temperature (%.1f °C) elevated above normal limit (%.1f °C).",
                                        reading.getTemperatureCelsius(), rule.getThresholdValue()),
                                reading.getTemperatureCelsius(), rule.getThresholdValue());
                    }
                    break;

                case "VIB_CRITICAL":
                    if (reading.getVibrationMs2() != null && reading.getVibrationMs2() >= rule.getThresholdValue()) {
                        createAlert(reading.getElevatorId(), "EXCESSIVE_VIBRATION", "CRITICAL",
                                "CRITICAL: Dangerous Structural Vibration!",
                                String.format("Vibration level (%.2f m/s²) breached structural hazard limit (%.2f m/s²). Guide rail check mandatory.",
                                        reading.getVibrationMs2(), rule.getThresholdValue()),
                                reading.getVibrationMs2(), rule.getThresholdValue());
                    }
                    break;

                case "VIB_HIGH":
                    if (reading.getVibrationMs2() != null &&
                            reading.getVibrationMs2() >= rule.getThresholdValue() &&
                            reading.getVibrationMs2() < 8.5) {
                        createAlert(reading.getElevatorId(), "EXCESSIVE_VIBRATION", "WARNING",
                                "Vibration Level Elevated",
                                String.format("Vibration level (%.2f m/s²) exceeds smooth operation limit (%.2f m/s²).",
                                        reading.getVibrationMs2(), rule.getThresholdValue()),
                                reading.getVibrationMs2(), rule.getThresholdValue());
                    }
                    break;

                case "DOOR_UNSAFE_MOTION":
                    if (state != null && Boolean.FALSE.equals(reading.getDoorSensorState()) &&
                            ("MOVING_UP".equals(state.getDirection()) || "MOVING_DOWN".equals(state.getDirection()))) {
                        createAlert(reading.getElevatorId(), "UNSAFE_DOOR_MOTION", "CRITICAL",
                                "CRITICAL: Unsafe Door Opening During Cabin Motion!",
                                "Door sensor reads OPEN while elevator motor is actively moving! Safety interlock failure.",
                                1.0, 0.0);
                        state.setEmergencyStop(true);
                        state.setMotorStatus("MOTOR_STALL");
                        state.setDirection("EMERGENCY_BRAKE");
                    }
                    break;

                case "MOTOR_STALL_CURRENT":
                    if (reading.getMotorCurrentAmps() != null && reading.getMotorCurrentAmps() >= rule.getThresholdValue()) {
                        createAlert(reading.getElevatorId(), "MOTOR_STALL", "CRITICAL",
                                "CRITICAL: Elevator Motor Current Spike / Stall!",
                                String.format("Motor current (%.1f A) exceeded overload safety breaker limit (%.1f A).",
                                        reading.getMotorCurrentAmps(), rule.getThresholdValue()),
                                reading.getMotorCurrentAmps(), rule.getThresholdValue());
                    }
                    break;
            }
        }
    }

    private void createAlert(String elevatorId, String alertType, String severity, String title, String message, Double value, Double limit) {
        List<SafetyAlert> existing = safetyAlertRepository.findByElevatorIdAndResolvedFalseOrderByTimestampDesc(elevatorId);
        boolean duplicate = existing.stream().anyMatch(a -> a.getAlertType().equals(alertType) && a.getSeverity().equals(severity));

        if (!duplicate) {
            SafetyAlert alert = SafetyAlert.builder()
                    .elevatorId(elevatorId)
                    .alertType(alertType)
                    .severity(severity)
                    .title(title)
                    .message(message)
                    .triggeredValue(value)
                    .thresholdLimit(limit)
                    .acknowledged(false)
                    .resolved(false)
                    .build();
            safetyAlertRepository.save(alert);
            log.warn("SAFETY RULE TRIGGERED [{}] - {}", severity, title);
        }
    }
}
