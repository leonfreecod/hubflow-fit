package com.hubflow.fit.repository;

import com.hubflow.fit.domain.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.util.UUID;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, UUID> {

    List<ScheduleEvent> findAllByStudentIdOrderByDateAscTimeAsc(UUID studentId);

    List<ScheduleEvent> findAllByStudentOrganizationIdOrderByDateAscTimeAsc(UUID organizationId);

    List<ScheduleEvent> findAllByStudentOrganizationIdAndDate(UUID organizationId, LocalDate date);

    Optional<ScheduleEvent> findByIdAndStudentOrganizationId(UUID id, UUID organizationId);

    List<ScheduleEvent> findAllByStatusAndDateBetweenAndReminderSentAtIsNull(
            com.hubflow.fit.domain.ScheduleStatus status,
            LocalDate start,
            LocalDate end
    );
}
