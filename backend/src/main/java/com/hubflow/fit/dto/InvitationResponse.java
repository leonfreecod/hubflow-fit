package com.hubflow.fit.dto;

import java.time.Instant;

public record InvitationResponse(
        String activationUrl,
        Instant expiresAt
) {
}
