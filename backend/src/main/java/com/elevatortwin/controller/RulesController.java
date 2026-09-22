package com.elevatortwin.controller;

import com.elevatortwin.dto.RuleUpdateRequest;
import com.elevatortwin.model.SafetyRule;
import com.elevatortwin.repository.SafetyRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RulesController {

    private final SafetyRuleRepository safetyRuleRepository;

    @GetMapping
    public ResponseEntity<List<SafetyRule>> getRules() {
        return ResponseEntity.ok(safetyRuleRepository.findAll());
    }

    @PutMapping
    public ResponseEntity<SafetyRule> updateRule(@RequestBody RuleUpdateRequest request) {
        return safetyRuleRepository.findByRuleKey(request.getRuleKey()).map(rule -> {
            if (request.getThresholdValue() != null) rule.setThresholdValue(request.getThresholdValue());
            if (request.getSeverity() != null) rule.setDefaultSeverity(request.getSeverity());
            if (request.getEnabled() != null) rule.setEnabled(request.getEnabled());
            return ResponseEntity.ok(safetyRuleRepository.save(rule));
        }).orElse(ResponseEntity.notFound().build());
    }
}
