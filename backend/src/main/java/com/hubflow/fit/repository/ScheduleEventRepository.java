package com.hubflow.fit.repository;

import com.hubflow.fit.domain.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, UUID> {

    List<ScheduleEvent> findAllByStudentIdOrderByDateAscTimeAsc(UUID studentId);
}
