package com.hubflow.fit.repository;

import com.hubflow.fit.domain.OrganizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrganizationSettingsRepository extends JpaRepository<OrganizationSettings, UUID> {
}
