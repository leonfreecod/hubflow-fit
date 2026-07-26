package com.hubflow.fit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AuthResponse(
        @NotBlank String token,
        @NotNull UserResponse user
) {
}
