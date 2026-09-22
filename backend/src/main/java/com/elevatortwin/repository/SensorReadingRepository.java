package com.elevatortwin.repository;

import com.elevatortwin.model.SensorReading;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findTop50ByElevatorIdOrderByTimestampDesc(String elevatorId);

    List<SensorReading> findByElevatorIdAndTimestampBetweenOrderByTimestampAsc(
            String elevatorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM SensorReading r WHERE r.elevatorId = :elevatorId ORDER BY r.timestamp DESC")
    List<SensorReading> findRecentReadings(String elevatorId, Pageable pageable);
}
