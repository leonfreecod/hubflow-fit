package com.hubflow.fit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pix_charges")
public class PixCharge {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;
    @Column(nullable = false, length = 50) private String provider;
    @Column(name = "provider_charge_id", nullable = false, unique = true) private String providerChargeId;
    @Column(name = "copy_paste", nullable = false, length = 2000) private String copyPaste;
    @Column(name = "qr_code_payload", nullable = false, length = 4000) private String qrCodePayload;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private PixChargeStatus status;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "paid_at") private Instant paidAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getProviderChargeId() { return providerChargeId; }
    public void setProviderChargeId(String providerChargeId) { this.providerChargeId = providerChargeId; }
    public String getCopyPaste() { return copyPaste; }
    public void setCopyPaste(String copyPaste) { this.copyPaste = copyPaste; }
    public String getQrCodePayload() { return qrCodePayload; }
    public void setQrCodePayload(String qrCodePayload) { this.qrCodePayload = qrCodePayload; }
    public PixChargeStatus getStatus() { return status; }
    public void setStatus(PixChargeStatus status) { this.status = status; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
