package com.hubflow.fit.repository;

import com.hubflow.fit.domain.WorkoutCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutCompletionRepository extends JpaRepository<WorkoutCompletion, UUID> {
    List<WorkoutCompletion> findAllByStudentIdAndSessionWorkoutPlanId(UUID studentId, UUID planId);
    Optional<WorkoutCompletion> findByStudentIdAndSessionId(UUID studentId, UUID sessionId);
}
