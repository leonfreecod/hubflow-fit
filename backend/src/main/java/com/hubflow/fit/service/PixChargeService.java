package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Payment;
import com.hubflow.fit.domain.PaymentMethod;
import com.hubflow.fit.domain.PaymentStatus;
import com.hubflow.fit.domain.PixCharge;
import com.hubflow.fit.domain.PixChargeStatus;
import com.hubflow.fit.domain.PixWebhookEvent;
import com.hubflow.fit.dto.PixChargeResponse;
import com.hubflow.fit.dto.PixWebhookRequest;
import com.hubflow.fit.exception.ConflictException;
import com.hubflow.fit.exception.ForbiddenException;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.PaymentRepository;
import com.hubflow.fit.repository.PixChargeRepository;
import com.hubflow.fit.repository.PixWebhookEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class PixChargeService {

    private final PixChargeRepository pixChargeRepository;
    private final PixWebhookEventRepository webhookEventRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final PixProvider pixProvider;
    private final Duration expiration;
    private final String webhookSecret;

    public PixChargeService(
            PixChargeRepository pixChargeRepository,
            PixWebhookEventRepository webhookEventRepository,
            PaymentRepository paymentRepository,
            CurrentUserService currentUserService,
            PixProvider pixProvider,
            @Value("${app.pix.expiration-minutes:30}") long expirationMinutes,
            @Value("${app.pix.webhook-secret:hubflow-local-webhook-secret}") String webhookSecret
    ) {
        this.pixChargeRepository = pixChargeRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
        this.pixProvider = pixProvider;
        this.expiration = Duration.ofMinutes(expirationMinutes);
        this.webhookSecret = webhookSecret;
    }

    @Transactional(readOnly = true)
    public PixChargeResponse get(String paymentId) {
        AppUser user = currentUserService.requireCurrentUser();
        Payment payment = findPayment(parseId(paymentId), currentUserService.requireOrganizationId(user));
        currentUserService.requireStudentAccess(user, payment.getStudent().getId());
        PixCharge charge = pixChargeRepository.findByPaymentId(payment.getId())
                .orElseThrow(() -> new NotFoundException("Cobrança PIX ainda não foi gerada."));
        return toResponse(charge);
    }

    @Transactional
    public PixChargeResponse createOrRefresh(String paymentId) {
        AppUser user = currentUserService.requireCurrentUser();
        Payment payment = findPayment(parseId(paymentId), currentUserService.requireOrganizationId(user));
        currentUserService.requireStudentAccess(user, payment.getStudent().getId());
        if (payment.getMethod() != PaymentMethod.PIX) {
            throw new ConflictException("Este pagamento não utiliza PIX.");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Este pagamento já foi confirmado.");
        }

        Instant now = Instant.now();
        PixCharge charge = pixChargeRepository.findByPaymentId(payment.getId()).orElse(null);
        if (charge != null
                && charge.getStatus() == PixChargeStatus.ACTIVE
                && charge.getExpiresAt().isAfter(now)) {
            return toResponse(charge);
        }

        Instant expiresAt = now.plus(expiration);
        PixProvider.PixProviderCharge providerCharge = pixProvider.createCharge(payment, expiresAt);
        if (charge == null) {
            charge = new PixCharge();
            charge.setPayment(payment);
            charge.setCreatedAt(now);
        }
        charge.setProvider(pixProvider.providerName());
        charge.setProviderChargeId(providerCharge.providerChargeId());
        charge.setCopyPaste(providerCharge.copyPaste());
        charge.setQrCodePayload(providerCharge.qrCodePayload());
        charge.setStatus(PixChargeStatus.ACTIVE);
        charge.setExpiresAt(expiresAt);
        charge.setUpdatedAt(now);
        charge.setPaidAt(null);
        return toResponse(pixChargeRepository.save(charge));
    }

    @Transactional
    public void processWebhook(PixWebhookRequest request, String suppliedSecret) {
        requireValidWebhookSecret(suppliedSecret);
        if (webhookEventRepository.existsByEventId(request.eventId())) {
            return;
        }

        PixCharge charge = pixChargeRepository.findByProviderChargeId(request.providerChargeId())
                .orElseThrow(() -> new NotFoundException("Cobrança PIX não encontrada."));
        Instant now = Instant.now();
        if (request.status() == PixChargeStatus.PAID) {
            charge.setStatus(PixChargeStatus.PAID);
            charge.setPaidAt(now);
            Payment payment = charge.getPayment();
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDate.now());
        } else if (request.status() == PixChargeStatus.EXPIRED
                || request.status() == PixChargeStatus.CANCELED) {
            if (charge.getStatus() != PixChargeStatus.PAID) {
                charge.setStatus(request.status());
            }
        }
        charge.setUpdatedAt(now);

        PixWebhookEvent event = new PixWebhookEvent();
        event.setEventId(request.eventId());
        event.setProviderChargeId(request.providerChargeId());
        event.setStatus(request.status().name());
        event.setProcessedAt(now);
        webhookEventRepository.save(event);
    }

    private Payment findPayment(UUID id, UUID organizationId) {
        return paymentRepository.findByIdAndStudentOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado."));
    }

    private PixChargeResponse toResponse(PixCharge charge) {
        PixChargeStatus status = charge.getStatus();
        if (status == PixChargeStatus.ACTIVE && !charge.getExpiresAt().isAfter(Instant.now())) {
            status = PixChargeStatus.EXPIRED;
        }
        return new PixChargeResponse(
                charge.getId().toString(),
                charge.getPayment().getId().toString(),
                charge.getProvider(),
                charge.getCopyPaste(),
                charge.getQrCodePayload(),
                status,
                charge.getPayment().getAmount(),
                charge.getExpiresAt(),
                "LOCAL".equals(charge.getProvider())
        );
    }

    private void requireValidWebhookSecret(String suppliedSecret) {
        if (suppliedSecret == null || !MessageDigest.isEqual(
                webhookSecret.getBytes(StandardCharsets.UTF_8),
                suppliedSecret.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ForbiddenException("Assinatura de webhook inválida.");
        }
    }

    private UUID parseId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new NotFoundException("Pagamento não encontrado.", exception);
        }
    }
}
