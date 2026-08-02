package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.domain.ScheduleType;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleEventResponse(
        String id,
        String studentId,
        String studentName,
        String title,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        int durationMinutes,
        String location,
        ScheduleStatus status,
        ScheduleType type,
        String recurrenceGroupId
) {
}
