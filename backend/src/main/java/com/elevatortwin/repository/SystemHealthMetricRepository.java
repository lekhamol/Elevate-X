package com.elevatortwin.repository;

import com.elevatortwin.model.SystemHealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemHealthMetricRepository extends JpaRepository<SystemHealthMetric, Long> {
    Optional<SystemHealthMetric> findTopByDeviceIdOrderByTimestampDesc(String deviceId);
}
