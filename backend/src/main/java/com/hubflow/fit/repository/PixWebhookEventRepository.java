package com.hubflow.fit.repository;

import com.hubflow.fit.domain.PixWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PixWebhookEventRepository extends JpaRepository<PixWebhookEvent, UUID> {
    boolean existsByEventId(String eventId);
}
