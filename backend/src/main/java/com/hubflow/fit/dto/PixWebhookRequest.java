package com.hubflow.fit.dto;

import com.hubflow.fit.domain.PixChargeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PixWebhookRequest(
        @NotBlank @Size(max = 255) String eventId,
        @NotBlank @Size(max = 255) String providerChargeId,
        @NotNull PixChargeStatus status
) {
}
