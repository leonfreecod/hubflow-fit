package com.hubflow.fit.security;

import com.hubflow.fit.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final String BLOCKED_MESSAGE =
            "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";

    private final ConcurrentHashMap<String, AttemptState> attempts = new ConcurrentHashMap<>();
    private final int maxFailures;
    private final Duration window;
    private final Duration blockDuration;

    public LoginRateLimiter(
            @Value("${app.auth.rate-limit.max-failures:5}") int maxFailures,
            @Value("${app.auth.rate-limit.window-minutes:10}") long windowMinutes,
            @Value("${app.auth.rate-limit.block-minutes:15}") long blockMinutes
    ) {
        this.maxFailures = maxFailures;
        this.window = Duration.ofMinutes(windowMinutes);
        this.blockDuration = Duration.ofMinutes(blockMinutes);
    }

    public void check(String key) {
        AttemptState state = attempts.get(key);
        if (state != null && state.isBlocked(Instant.now())) {
            throw new TooManyRequestsException(BLOCKED_MESSAGE);
        }
    }

    public void recordFailure(String key) {
        Instant now = Instant.now();
        AttemptState state = attempts.computeIfAbsent(key, ignored -> new AttemptState(now));
        synchronized (state) {
            if (state.windowStarted.plus(window).isBefore(now)) {
                state.failures = 0;
                state.windowStarted = now;
                state.blockedUntil = null;
            }
            state.failures++;
            if (state.failures >= maxFailures) {
                state.blockedUntil = now.plus(blockDuration);
            }
        }
    }

    public void recordSuccess(String key) {
        attempts.remove(key);
    }

    private static final class AttemptState {
        private int failures;
        private Instant windowStarted;
        private Instant blockedUntil;

        private AttemptState(Instant windowStarted) {
            this.windowStarted = windowStarted;
        }

        private synchronized boolean isBlocked(Instant now) {
            return blockedUntil != null && blockedUntil.isAfter(now);
        }
    }
}
