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
        var currentUser = currentUserService.requireCurrentUser();
        return apiMapper.toResponse(findSettings(
                currentUserService.requireOrganizationId(currentUser)
        ));
    }

    @Transactional
    public OrganizationSettingsResponse update(OrganizationSettingsRequest request) {
        var currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        OrganizationSettings settings = findSettings(
                currentUserService.requireOrganizationId(currentUser)
        );
        apiMapper.updateEntity(settings, request);
        return apiMapper.toResponse(organizationSettingsRepository.save(settings));
    }

    private OrganizationSettings findSettings(java.util.UUID organizationId) {
        return organizationSettingsRepository.findById(organizationId)
                .orElseThrow(() ->
                        new NotFoundException("Configurações da organização não encontradas.")
                );
    }
}
