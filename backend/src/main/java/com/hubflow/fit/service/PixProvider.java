package com.hubflow.fit.service;

import com.hubflow.fit.domain.Payment;

import java.time.Instant;

public interface PixProvider {
    PixProviderCharge createCharge(Payment payment, Instant expiresAt);
    String providerName();
    boolean simulated();

    record PixProviderCharge(
            String providerChargeId,
            String copyPaste,
            String qrCodePayload
    ) {
    }
}
