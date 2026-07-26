package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrganizationSettingsRequest(
        String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 30) String document,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 255) String pixKey,
        @NotBlank @Size(max = 255) String city
) {
}
