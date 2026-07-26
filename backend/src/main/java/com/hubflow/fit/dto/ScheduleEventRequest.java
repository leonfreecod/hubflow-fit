package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.domain.ScheduleType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ScheduleEventRequest(
        String id,
        @NotBlank String studentId,
        String studentName,
        @NotBlank @Size(max = 255) String title,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime time,
        @NotNull @Min(1) @Max(1440) Integer durationMinutes,
        @NotBlank @Size(max = 255) String location,
        @NotNull ScheduleStatus status,
        @NotNull ScheduleType type
) {
}
