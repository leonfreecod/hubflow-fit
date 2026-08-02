package com.hubflow.fit.dto;

public record WorkoutExerciseResponse(
        String id,
        String name,
        String prescription,
        int restSeconds
) {
}
