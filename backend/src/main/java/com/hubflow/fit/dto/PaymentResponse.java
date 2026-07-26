package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.hubflow.fit.domain.PaymentMethod;
import com.hubflow.fit.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(
        String id,
        String studentId,
        String studentName,
        String description,
        BigDecimal amount,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate paidAt,
        PaymentStatus status,
        PaymentMethod method
) {
}
