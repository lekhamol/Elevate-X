package com.elevatortwin.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "safety_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleKey; // e.g. TEMP_CRITICAL, VIB_WARNING, DOOR_SAFETY_INTERLOCK

    private String name;
    private String description;
    private Double thresholdValue;
    private String unit; // °C, m/s², A, Boolean
    private String operator; // GREATER_THAN, LESS_THAN, EQUALS
    private String defaultSeverity; // INFO, WARNING, CRITICAL
    private Boolean enabled;
}
