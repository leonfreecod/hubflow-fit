package com.hubflow.fit.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;

@Service
public class AuthCookieService {

    private final JwtService jwtService;
    private final String cookieName;
    private final boolean secure;
    private final String sameSite;

    public AuthCookieService(
            JwtService jwtService,
            @Value("${app.auth.cookie-name:hubflow_session}") String cookieName,
            @Value("${app.auth.cookie-secure:false}") boolean secure,
            @Value("${app.auth.cookie-same-site:Strict}") String sameSite
    ) {
        this.jwtService = jwtService;
        this.cookieName = cookieName;
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void write(HttpServletResponse response, String token) {
        addCookie(response, token, Duration.ofSeconds(jwtService.getExpirationSeconds()));
    }

    public void clear(HttpServletResponse response) {
        addCookie(response, "", Duration.ZERO);
    }

    public String resolve(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    public String getCookieName() {
        return cookieName;
    }

    public boolean isSecure() {
        return secure;
    }

    private void addCookie(HttpServletResponse response, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
