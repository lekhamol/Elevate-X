package com.elevatortwin.repository;

import com.elevatortwin.model.SafetyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SafetyRuleRepository extends JpaRepository<SafetyRule, Long> {
    Optional<SafetyRule> findByRuleKey(String ruleKey);
}
