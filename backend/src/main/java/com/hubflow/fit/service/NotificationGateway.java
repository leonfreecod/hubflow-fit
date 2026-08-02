package com.hubflow.fit.service;

import com.hubflow.fit.domain.ScheduleEvent;

public interface NotificationGateway {
    void sendAccountInvitation(String recipientName, String recipientEmail, String activationUrl);
    void sendPasswordReset(String recipientName, String recipientEmail, String resetUrl);
    void sendScheduleReminder(String recipientName, String recipientEmail, ScheduleEvent event);
}
