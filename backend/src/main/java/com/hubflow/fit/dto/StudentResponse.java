package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hubflow.fit.domain.StudentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentResponse(
        String id,
        String name,
        String email,
        String phone,
        StudentStatus status,
        String plan,
        BigDecimal monthlyFee,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate joinedAt,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate nextBillingDate,
        String goal,
        String coach,
        String initials,
        int progress
) {
}
