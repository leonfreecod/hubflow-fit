package com.hubflow.fit.service;

import com.hubflow.fit.domain.OrganizationSettings;
import com.hubflow.fit.dto.OrganizationSettingsRequest;
import com.hubflow.fit.dto.OrganizationSettingsResponse;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.OrganizationSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private final OrganizationSettingsRepository organizationSettingsRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;

    public OrganizationService(
            OrganizationSettingsRepository organizationSettingsRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService
    ) {
        this.organizationSettingsRepository = organizationSettingsRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public OrganizationSettingsResponse get() {
        currentUserService.requireCurrentUser();
        return apiMapper.toResponse(findSettings());
    }

    @Transactional
    public OrganizationSettingsResponse update(OrganizationSettingsRequest request) {
        currentUserService.requireAdmin(currentUserService.requireCurrentUser());
        OrganizationSettings settings = organizationSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> apiMapper.toEntity(request));
        apiMapper.updateEntity(settings, request);
        return apiMapper.toResponse(organizationSettingsRepository.save(settings));
    }

    private OrganizationSettings findSettings() {
        return organizationSettingsRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() ->
                        new NotFoundException("Configurações da organização não encontradas.")
                );
    }
}
