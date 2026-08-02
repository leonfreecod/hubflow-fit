package com.hubflow.fit.repository;

import com.hubflow.fit.domain.PixCharge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PixChargeRepository extends JpaRepository<PixCharge, UUID> {
    Optional<PixCharge> findByPaymentId(UUID paymentId);
    Optional<PixCharge> findByProviderChargeId(String providerChargeId);
}
