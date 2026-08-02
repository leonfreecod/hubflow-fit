package com.hubflow.fit.service;

import com.hubflow.fit.domain.ScheduleEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ConfigurableLogNotificationGateway implements NotificationGateway {

    private static final Logger log = LoggerFactory.getLogger(ConfigurableLogNotificationGateway.class);
    private final boolean logLinks;

    public ConfigurableLogNotificationGateway(
            @Value("${app.notifications.log-links:false}") boolean logLinks
    ) {
        this.logLinks = logLinks;
    }

    @Override
    public void sendAccountInvitation(
            String recipientName,
            String recipientEmail,
            String activationUrl
    ) {
        if (logLinks) {
            log.info("Convite local para {} <{}>: {}", recipientName, recipientEmail, activationUrl);
        } else {
            log.info("Convite criado para {}. Configure um provedor de e-mail para entrega automática.", recipientEmail);
        }
    }

    @Override
    public void sendPasswordReset(String recipientName, String recipientEmail, String resetUrl) {
        if (logLinks) {
            log.info("Redefinição local para {} <{}>: {}", recipientName, recipientEmail, resetUrl);
        } else {
            log.info("Redefinição criada para {}. Configure um provedor de e-mail para entrega automática.", recipientEmail);
        }
    }

    @Override
    public void sendScheduleReminder(
            String recipientName,
            String recipientEmail,
            ScheduleEvent event
    ) {
        log.info(
                "Lembrete local para {} <{}>: {} em {} às {}",
                recipientName,
                recipientEmail,
                event.getTitle(),
                event.getDate(),
                event.getTime()
        );
    }
}
