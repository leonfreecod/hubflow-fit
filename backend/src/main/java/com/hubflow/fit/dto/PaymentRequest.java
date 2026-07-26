package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hubflow.fit.domain.PaymentMethod;
import com.hubflow.fit.domain.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaymentRequest(
        String id,
        @NotBlank String studentId,
        String studentName,
        @NotBlank @Size(max = 255) String description,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal amount,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate paidAt,
        @NotNull PaymentStatus status,
        @NotNull PaymentMethod method
) {
}
