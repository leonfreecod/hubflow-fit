package com.hubflow.fit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pix_webhook_events")
public class PixWebhookEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "event_id", nullable = false, unique = true) private String eventId;
    @Column(name = "provider_charge_id", nullable = false) private String providerChargeId;
    @Column(nullable = false, length = 30) private String status;
    @Column(name = "processed_at", nullable = false) private Instant processedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getProviderChargeId() { return providerChargeId; }
    public void setProviderChargeId(String providerChargeId) { this.providerChargeId = providerChargeId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}
