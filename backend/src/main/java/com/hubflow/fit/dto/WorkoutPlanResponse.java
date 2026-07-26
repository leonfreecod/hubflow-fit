package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hubflow.fit.domain.WorkoutLevel;

import java.time.LocalDate;
import java.util.List;

public record WorkoutPlanResponse(
        String id,
        String name,
        String objective,
        WorkoutLevel level,
        int weeks,
        int sessionsPerWeek,
        List<String> assignedStudentIds,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate updatedAt,
        String description
) {
    public WorkoutPlanResponse {
        assignedStudentIds = List.copyOf(assignedStudentIds);
    }
}
