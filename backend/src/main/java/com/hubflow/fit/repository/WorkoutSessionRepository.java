package com.hubflow.fit.repository;

import com.hubflow.fit.domain.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    Optional<WorkoutSession> findByIdAndWorkoutPlanIdAndWorkoutPlanOrganizationId(
            UUID id,
            UUID workoutPlanId,
            UUID organizationId
    );
}
