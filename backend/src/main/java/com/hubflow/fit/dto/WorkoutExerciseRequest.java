package com.hubflow.fit.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkoutExerciseRequest(
        String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 1000) String prescription,
        @NotNull @Min(0) @Max(86400) Integer restSeconds
) {
}
