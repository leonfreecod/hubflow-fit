package com.hubflow.fit.service;

import com.hubflow.fit.domain.ScheduleEvent;

public interface CalendarGateway {
    String createEvent(ScheduleEvent event);
    void updateEvent(ScheduleEvent event);
    void cancelEvent(ScheduleEvent event);
}
