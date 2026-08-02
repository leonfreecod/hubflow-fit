package com.hubflow.fit.controller;

import com.hubflow.fit.dto.AuthResponse;
import com.hubflow.fit.dto.ActivateAccountRequest;
import com.hubflow.fit.dto.LoginRequest;
import com.hubflow.fit.dto.PasswordResetConfirmRequest;
import com.hubflow.fit.dto.PasswordResetRequest;
import com.hubflow.fit.dto.UserResponse;
import com.hubflow.fit.dto.CsrfTokenResponse;
import com.hubflow.fit.service.AccountLifecycleService;
import com.hubflow.fit.service.AuthService;
import com.hubflow.fit.security.AuthCookieService;
import com.hubflow.fit.security.LoginRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AccountLifecycleService accountLifecycleService;
    private final AuthCookieService authCookieService;
    private final LoginRateLimiter loginRateLimiter;

    public AuthController(
            AuthService authService,
            AccountLifecycleService accountLifecycleService,
            AuthCookieService authCookieService,
            LoginRateLimiter loginRateLimiter
    ) {
        this.authService = authService;
        this.accountLifecycleService = accountLifecycleService;
        this.authCookieService = authCookieService;
        this.loginRateLimiter = loginRateLimiter;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String rateLimitKey = httpRequest.getRemoteAddr() + "|"
                + request.email().trim().toLowerCase(Locale.ROOT);
        loginRateLimiter.check(rateLimitKey);
        try {
            AuthResponse response = authService.login(request);
            loginRateLimiter.recordSuccess(rateLimitKey);
            authCookieService.write(httpResponse, response.token());
            return response;
        } catch (AuthenticationException exception) {
            loginRateLimiter.recordFailure(rateLimitKey);
            throw exception;
        }
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetails principal) {
        return authService.getCurrentUser(principal);
    }

    @GetMapping("/csrf")
    public CsrfTokenResponse csrf(CsrfToken csrfToken) {
        return new CsrfTokenResponse(csrfToken.getToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        authCookieService.clear(response);
    }

    @PostMapping("/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@Valid @RequestBody ActivateAccountRequest request) {
        accountLifecycleService.activate(request.token(), request.password());
    }

    @PostMapping("/password-reset/request")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        accountLifecycleService.requestPasswordReset(request.email());
    }

    @PostMapping("/password-reset/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        accountLifecycleService.confirmPasswordReset(request.token(), request.password());
    }
}
