package com.elevatortwin.repository;

import com.elevatortwin.model.SafetyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyAlertRepository extends JpaRepository<SafetyAlert, Long> {

    List<SafetyAlert> findByElevatorIdOrderByTimestampDesc(String elevatorId);

    List<SafetyAlert> findByElevatorIdAndResolvedFalseOrderByTimestampDesc(String elevatorId);

    long countByResolvedFalse();

    long countBySeverityAndResolvedFalse(String severity);
}
