package com.hubflow.fit.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hubflow.fit.exception.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
public class ReadOnlyAccountFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
    private static final Set<String> SESSION_ENDPOINTS = Set.of(
            "/api/auth/login",
            "/api/auth/logout"
    );
    private static final String READ_ONLY_AUTHORITY = "ROLE_READ_ONLY";
    private static final String READ_ONLY_MESSAGE =
            "Esta conta de demonstração é somente leitura. Alterações estão desativadas.";

    private final ObjectMapper objectMapper;

    public ReadOnlyAccountFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (isSafe(request) || !isReadOnlyAccount()) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpStatus status = HttpStatus.FORBIDDEN;
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(
                response.getOutputStream(),
                ApiErrorResponse.of(
                        status.value(),
                        status.getReasonPhrase(),
                        READ_ONLY_MESSAGE,
                        request.getRequestURI()
                )
        );
    }

    private boolean isSafe(HttpServletRequest request) {
        return SAFE_METHODS.contains(request.getMethod())
                || SESSION_ENDPOINTS.contains(request.getRequestURI());
    }

    private boolean isReadOnlyAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> READ_ONLY_AUTHORITY.equals(authority.getAuthority()));
    }
}
