package com.hubflow.fit.service;

import com.hubflow.fit.domain.ScheduleEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class LocalCalendarGateway implements CalendarGateway {
    private static final Logger log = LoggerFactory.getLogger(LocalCalendarGateway.class);

    @Override
    public String createEvent(ScheduleEvent event) {
        String externalId = "local-calendar-" + UUID.randomUUID();
        log.debug("Evento {} sincronizado no calendário local como {}", event.getId(), externalId);
        return externalId;
    }

    @Override
    public void updateEvent(ScheduleEvent event) {
        log.debug("Evento local {} atualizado", event.getExternalEventId());
    }

    @Override
    public void cancelEvent(ScheduleEvent event) {
        log.debug("Evento local {} cancelado", event.getExternalEventId());
    }
}
