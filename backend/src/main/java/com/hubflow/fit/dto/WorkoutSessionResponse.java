package com.hubflow.fit.dto;

import java.util.List;

public record WorkoutSessionResponse(
        String id,
        int weekNumber,
        int dayOrder,
        String name,
        String instructions,
        List<WorkoutExerciseResponse> exercises,
        boolean completed
) {
    public WorkoutSessionResponse {
        exercises = List.copyOf(exercises);
    }
}
