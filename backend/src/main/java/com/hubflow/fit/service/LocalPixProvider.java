package com.hubflow.fit.service;

import com.hubflow.fit.domain.Payment;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class LocalPixProvider implements PixProvider {
    @Override
    public PixProviderCharge createCharge(Payment payment, Instant expiresAt) {
        String chargeId = "local_" + UUID.randomUUID();
        String payload = "HUBFLOW-PIX-SIMULADO|" + chargeId + "|"
                + payment.getAmount().toPlainString() + "|" + expiresAt;
        return new PixProviderCharge(chargeId, payload, payload);
    }

    @Override
    public String providerName() {
        return "LOCAL";
    }

    @Override
    public boolean simulated() {
        return true;
    }
}
