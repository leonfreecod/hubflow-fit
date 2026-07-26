package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.dto.AuthResponse;
import com.hubflow.fit.dto.LoginRequest;
import com.hubflow.fit.dto.UserResponse;
import com.hubflow.fit.repository.AppUserRepository;
import com.hubflow.fit.security.JwtService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid credentials";
    private static final String AUTHENTICATION_REQUIRED = "Authentication required";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final ApiMapper apiMapper;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AppUserRepository appUserRepository,
            ApiMapper apiMapper
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.appUserRepository = appUserRepository;
        this.apiMapper = apiMapper;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        normalizedEmail,
                        request.password()
                )
        );

        UserDetails principal = authenticatedPrincipal(authentication);
        AppUser user = findAuthenticatedUser(principal.getUsername());
        String token = jwtService.generateToken(principal);
        return apiMapper.toAuthResponse(token, user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserDetails principal) {
        if (principal == null) {
            throw new AuthenticationCredentialsNotFoundException(AUTHENTICATION_REQUIRED);
        }

        AppUser user = appUserRepository
                .findByEmailIgnoreCase(normalizeEmail(principal.getUsername()))
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(AUTHENTICATION_REQUIRED)
                );
        return apiMapper.toResponse(user);
    }

    private UserDetails authenticatedPrincipal(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }
        return principal;
    }

    private AppUser findAuthenticatedUser(String email) {
        return appUserRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new BadCredentialsException(INVALID_CREDENTIALS));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
