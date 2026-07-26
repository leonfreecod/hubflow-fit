package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hubflow.fit.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserRequest(
        String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(min = 8, max = 72) String password,
        @NotNull UserRole role,
        @Size(max = 2048) String avatar,
        String linkedStudentId
) {
}
