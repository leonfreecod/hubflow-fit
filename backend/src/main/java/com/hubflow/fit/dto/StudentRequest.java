package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hubflow.fit.domain.StudentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StudentRequest(
        String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 30) String phone,
        @NotNull StudentStatus status,
        @NotBlank @Size(max = 255) String plan,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal monthlyFee,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate joinedAt,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate nextBillingDate,
        @NotBlank @Size(max = 1000) String goal,
        @NotBlank @Size(max = 255) String coach,
        @NotBlank @Size(max = 4) String initials,
        @NotNull @Min(0) @Max(100) Integer progress
) {
}
