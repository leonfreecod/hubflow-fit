package com.hubflow.fit.service;

import com.hubflow.fit.domain.AccountStatus;
import com.hubflow.fit.domain.AccountToken;
import com.hubflow.fit.domain.AccountTokenType;
import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.domain.UserRole;
import com.hubflow.fit.dto.InvitationResponse;
import com.hubflow.fit.exception.ConflictException;
import com.hubflow.fit.repository.AccountTokenRepository;
import com.hubflow.fit.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AccountLifecycleService {

    private final AppUserRepository appUserRepository;
    private final AccountTokenRepository accountTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationGateway notificationGateway;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String frontendBaseUrl;
    private final Duration invitationExpiration;
    private final Duration passwordResetExpiration;

    public AccountLifecycleService(
            AppUserRepository appUserRepository,
            AccountTokenRepository accountTokenRepository,
            PasswordEncoder passwordEncoder,
            NotificationGateway notificationGateway,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.accounts.invitation-hours:72}") long invitationHours,
            @Value("${app.accounts.password-reset-minutes:30}") long passwordResetMinutes
    ) {
        this.appUserRepository = appUserRepository;
        this.accountTokenRepository = accountTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationGateway = notificationGateway;
        this.frontendBaseUrl = frontendBaseUrl.replaceAll("/+$", "");
        this.invitationExpiration = Duration.ofHours(invitationHours);
        this.passwordResetExpiration = Duration.ofMinutes(passwordResetMinutes);
    }

    @Transactional
    public InvitationResponse inviteStudent(Student student) {
        String email = normalizeEmail(student.getEmail());
        AppUser user = appUserRepository.findByLinkedStudentId(student.getId())
                .orElseGet(() -> createInvitedUser(student, email));

        if (!user.getOrganization().getId().equals(student.getOrganization().getId())) {
            throw new ConflictException("A conta e o aluno pertencem a organizações diferentes.");
        }
        if (!user.getEmail().equalsIgnoreCase(email)) {
            ensureUserEmailAvailable(email, user);
            user.setEmail(email);
        }
        user.setName(student.getName());
        user.setAccountStatus(AccountStatus.INVITED);

        IssuedToken token = issueToken(user, AccountTokenType.ACTIVATION, invitationExpiration);
        String activationUrl = frontendBaseUrl + "/activate?token=" + token.rawToken();
        notificationGateway.sendAccountInvitation(user.getName(), user.getEmail(), activationUrl);
        return new InvitationResponse(activationUrl, token.expiresAt());
    }

    @Transactional
    public void activate(String rawToken, String password) {
        AccountToken token = requireUsableToken(rawToken, AccountTokenType.ACTIVATION);
        AppUser user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAccountStatus(AccountStatus.ACTIVE);
        token.setUsedAt(Instant.now());
    }

    @Transactional
    public void requestPasswordReset(String email) {
        appUserRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                .ifPresent(user -> {
                    IssuedToken token = issueToken(
                            user,
                            AccountTokenType.PASSWORD_RESET,
                            passwordResetExpiration
                    );
                    String resetUrl = frontendBaseUrl + "/reset-password?token=" + token.rawToken();
                    notificationGateway.sendPasswordReset(user.getName(), user.getEmail(), resetUrl);
                });
    }

    @Transactional
    public void confirmPasswordReset(String rawToken, String password) {
        AccountToken token = requireUsableToken(rawToken, AccountTokenType.PASSWORD_RESET);
        token.getUser().setPasswordHash(passwordEncoder.encode(password));
        token.setUsedAt(Instant.now());
    }

    private AppUser createInvitedUser(Student student, String email) {
        ensureUserEmailAvailable(email, null);
        AppUser user = new AppUser();
        user.setName(student.getName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(randomToken()));
        user.setRole(UserRole.STUDENT);
        user.setAccountStatus(AccountStatus.INVITED);
        user.setLinkedStudent(student);
        user.setOrganization(student.getOrganization());
        return appUserRepository.save(user);
    }

    private void ensureUserEmailAvailable(String email, AppUser currentUser) {
        appUserRepository.findByEmailIgnoreCase(email)
                .filter(existing -> currentUser == null || !existing.getId().equals(currentUser.getId()))
                .ifPresent(existing -> {
                    throw new ConflictException("Já existe uma conta com este e-mail.");
                });
    }

    private IssuedToken issueToken(
            AppUser user,
            AccountTokenType type,
            Duration expiration
    ) {
        accountTokenRepository.deleteAllByUserIdAndType(user.getId(), type);
        Instant now = Instant.now();
        String rawToken = randomToken();
        AccountToken token = new AccountToken();
        token.setUser(user);
        token.setType(type);
        token.setTokenHash(hashToken(rawToken));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plus(expiration));
        accountTokenRepository.save(token);
        return new IssuedToken(rawToken, token.getExpiresAt());
    }

    private AccountToken requireUsableToken(String rawToken, AccountTokenType type) {
        AccountToken token = accountTokenRepository
                .findByTokenHashAndType(hashToken(rawToken), type)
                .orElseThrow(() -> new ConflictException("Token inválido ou expirado."));
        if (token.getUsedAt() != null || !token.getExpiresAt().isAfter(Instant.now())) {
            throw new ConflictException("Token inválido ou expirado.");
        }
        return token;
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponível.", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private record IssuedToken(String rawToken, Instant expiresAt) {
    }
}
