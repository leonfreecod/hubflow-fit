package com.hubflow.fit.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record WorkoutSessionRequest(
        String id,
        @NotNull @Min(1) @Max(520) Integer weekNumber,
        @NotNull @Min(1) @Max(7) Integer dayOrder,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 2000) String instructions,
        @NotNull @Size(max = 100) List<@Valid WorkoutExerciseRequest> exercises
) {
    public WorkoutSessionRequest {
        exercises = exercises == null ? List.of() : List.copyOf(exercises);
    }
}
