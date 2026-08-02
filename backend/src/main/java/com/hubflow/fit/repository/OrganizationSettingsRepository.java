package com.hubflow.fit.repository;

import com.hubflow.fit.domain.OrganizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

public interface OrganizationSettingsRepository extends JpaRepository<OrganizationSettings, UUID> {
    Optional<OrganizationSettings> findByDocument(String document);
}
