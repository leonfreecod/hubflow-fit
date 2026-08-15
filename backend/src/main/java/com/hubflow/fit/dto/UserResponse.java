package com.hubflow.fit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hubflow.fit.domain.UserRole;
import com.hubflow.fit.domain.AccountStatus;

public record UserResponse(
        String id,
        String name,
        String email,
        UserRole role,
        AccountStatus accountStatus,
        boolean readOnly,
        @JsonInclude(JsonInclude.Include.NON_NULL) String avatar,
        @JsonInclude(JsonInclude.Include.NON_NULL) String linkedStudentId
) {
}
