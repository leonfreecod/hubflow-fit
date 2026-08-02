package com.hubflow.fit.dto;

import com.hubflow.fit.domain.PixChargeStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PixChargeResponse(
        String id,
        String paymentId,
        String provider,
        String copyPaste,
        String qrCodePayload,
        PixChargeStatus status,
        BigDecimal amount,
        Instant expiresAt,
        boolean simulated
) {
}
