package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hubflow.fit.domain.UserRole;

public record UserResponse(
        String id,
        String name,
        String email,
        UserRole role,
        @JsonInclude(JsonInclude.Include.NON_NULL) String avatar,
        @JsonInclude(JsonInclude.Include.NON_NULL) String linkedStudentId
) {
}
