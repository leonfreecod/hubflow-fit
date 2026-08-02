package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hubflow.fit.domain.WorkoutLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WorkoutPlanRequest(
        String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String objective,
        @NotNull WorkoutLevel level,
        @NotNull @Min(1) @Max(520) Integer weeks,
        @NotNull @Min(1) @Max(7) Integer sessionsPerWeek,
        @NotNull @Size(max = 10000) List<@NotBlank String> assignedStudentIds,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate updatedAt,
        @NotBlank @Size(max = 2000) String description,
        @Size(max = 3640) List<@Valid WorkoutSessionRequest> sessions
) {
    public WorkoutPlanRequest {
        assignedStudentIds = assignedStudentIds == null ? null : List.copyOf(assignedStudentIds);
        sessions = sessions == null ? List.of() : List.copyOf(sessions);
    }
}
