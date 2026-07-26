package com.hubflow.fit.repository;

import com.hubflow.fit.domain.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {

    List<WorkoutPlan> findDistinctByAssignedStudents_Id(UUID studentId);
}
