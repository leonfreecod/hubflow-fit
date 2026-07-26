package com.hubflow.fit.dto;

public record OrganizationSettingsResponse(
        String name,
        String document,
        String phone,
        String email,
        String pixKey,
        String city
) {
}
