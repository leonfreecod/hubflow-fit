package com.hubflow.fit.controller;

import com.hubflow.fit.dto.OrganizationSettingsRequest;
import com.hubflow.fit.dto.OrganizationSettingsResponse;
import com.hubflow.fit.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organization")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public OrganizationSettingsResponse get() {
        return organizationService.get();
    }

    @PutMapping
    public OrganizationSettingsResponse update(
            @Valid @RequestBody OrganizationSettingsRequest request
    ) {
        return organizationService.update(request);
    }
}
