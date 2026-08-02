package com.hubflow.fit.service;

import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.repository.ScheduleEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class ScheduleReminderJob {

    private final ScheduleEventRepository scheduleEventRepository;
    private final NotificationGateway notificationGateway;

    public ScheduleReminderJob(
            ScheduleEventRepository scheduleEventRepository,
            NotificationGateway notificationGateway
    ) {
        this.scheduleEventRepository = scheduleEventRepository;
        this.notificationGateway = notificationGateway;
    }

    @Scheduled(fixedDelayString = "${app.schedule.reminder-check-ms:300000}")
    @Transactional
    public void sendUpcomingReminders() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime now = LocalDateTime.now(zone);
        LocalDateTime cutoff = now.plusHours(24);
        scheduleEventRepository.findAllByStatusAndDateBetweenAndReminderSentAtIsNull(
                        ScheduleStatus.SCHEDULED,
                        now.toLocalDate(),
                        cutoff.toLocalDate()
                ).stream()
                .filter(event -> {
                    LocalDateTime startsAt = LocalDateTime.of(event.getDate(), event.getTime());
                    return startsAt.isAfter(now) && !startsAt.isAfter(cutoff);
                })
                .forEach(event -> {
                    notificationGateway.sendScheduleReminder(
                            event.getStudent().getName(),
                            event.getStudent().getEmail(),
                            event
                    );
                    event.setReminderSentAt(Instant.now());
                });
    }
}
