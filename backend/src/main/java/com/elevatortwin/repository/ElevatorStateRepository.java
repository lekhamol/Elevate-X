package com.elevatortwin.repository;

import com.elevatortwin.model.ElevatorState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ElevatorStateRepository extends JpaRepository<ElevatorState, Long> {
    Optional<ElevatorState> findByElevatorId(String elevatorId);
}
