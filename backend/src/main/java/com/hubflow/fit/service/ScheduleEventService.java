package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.ScheduleEvent;
import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.dto.ScheduleEventRequest;
import com.hubflow.fit.dto.ScheduleEventResponse;
import com.hubflow.fit.exception.ConflictException;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.ScheduleEventRepository;
import com.hubflow.fit.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalTime;

@Service
public class ScheduleEventService {

    private final ScheduleEventRepository scheduleEventRepository;
    private final StudentRepository studentRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;
    private final CalendarGateway calendarGateway;

    public ScheduleEventService(
            ScheduleEventRepository scheduleEventRepository,
            StudentRepository studentRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService,
            CalendarGateway calendarGateway
    ) {
        this.scheduleEventRepository = scheduleEventRepository;
        this.studentRepository = studentRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
        this.calendarGateway = calendarGateway;
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        List<ScheduleEvent> events = currentUserService.isAdmin(currentUser)
                ? scheduleEventRepository.findAllByStudentOrganizationIdOrderByDateAscTimeAsc(
                        currentUserService.requireOrganizationId(currentUser)
                )
                : scheduleEventRepository.findAllByStudentIdOrderByDateAscTimeAsc(
                        currentUserService.requireLinkedStudentId(currentUser)
                );
        return events.stream().map(apiMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ScheduleEventResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        ScheduleEvent event = findEntity(
                parseEventId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        currentUserService.requireStudentAccess(currentUser, event.getStudent().getId());
        return apiMapper.toResponse(event);
    }

    @Transactional
    public ScheduleEventResponse create(ScheduleEventRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Student student = findStudent(parseStudentId(request.studentId()), organizationId);
        int occurrences = request.recurrenceWeeks() == null ? 1 : request.recurrenceWeeks();
        UUID recurrenceGroupId = occurrences > 1 ? UUID.randomUUID() : null;
        ScheduleEvent first = null;
        for (int week = 0; week < occurrences; week++) {
            ScheduleEvent event = apiMapper.toEntity(request, student);
            event.setDate(request.date().plusWeeks(week));
            event.setStatus(ScheduleStatus.SCHEDULED);
            event.setRecurrenceGroupId(recurrenceGroupId);
            ensureNoConflict(event, organizationId, null);
            event = scheduleEventRepository.save(event);
            event.setExternalEventId(calendarGateway.createEvent(event));
            if (first == null) first = event;
        }
        return apiMapper.toResponse(first);
    }

    @Transactional
    public ScheduleEventResponse update(String id, ScheduleEventRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        ScheduleEvent event = findEntity(parseEventId(id), organizationId);
        Student student = findStudent(parseStudentId(request.studentId()), organizationId);
        ScheduleStatus currentStatus = event.getStatus();
        apiMapper.updateEntity(event, request, student);
        event.setStatus(currentStatus);
        event.setReminderSentAt(null);
        if (event.getStatus() == ScheduleStatus.SCHEDULED) {
            ensureNoConflict(event, organizationId, event.getId());
        }
        ScheduleEvent saved = scheduleEventRepository.save(event);
        calendarGateway.updateEvent(saved);
        return apiMapper.toResponse(saved);
    }

    @Transactional
    public ScheduleEventResponse complete(String id) {
        AppUser currentUser = requireAdmin();
        ScheduleEvent event = findEntity(
                parseEventId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        if (event.getStatus() == ScheduleStatus.CANCELED) {
            throw new ConflictException("Um evento cancelado não pode ser concluído.");
        }
        event.setStatus(ScheduleStatus.COMPLETED);
        ScheduleEvent saved = scheduleEventRepository.save(event);
        calendarGateway.updateEvent(saved);
        return apiMapper.toResponse(saved);
    }

    @Transactional
    public void delete(String id) {
        AppUser currentUser = requireAdmin();
        ScheduleEvent event = findEntity(
                parseEventId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        calendarGateway.cancelEvent(event);
        scheduleEventRepository.delete(event);
    }

    @Transactional
    public ScheduleEventResponse cancel(String id) {
        AppUser currentUser = requireAdmin();
        ScheduleEvent event = findEntity(
                parseEventId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        if (event.getStatus() == ScheduleStatus.COMPLETED) {
            throw new ConflictException("Um evento concluído não pode ser cancelado.");
        }
        event.setStatus(ScheduleStatus.CANCELED);
        ScheduleEvent saved = scheduleEventRepository.save(event);
        calendarGateway.cancelEvent(saved);
        return apiMapper.toResponse(saved);
    }

    private AppUser requireAdmin() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        return currentUser;
    }

    private ScheduleEvent findEntity(UUID id, UUID organizationId) {
        return scheduleEventRepository.findByIdAndStudentOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Evento não encontrado."));
    }

    private Student findStudent(UUID id, UUID organizationId) {
        return studentRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
    }

    private void ensureNoConflict(ScheduleEvent candidate, UUID organizationId, UUID ignoredId) {
        LocalTime candidateEnd = candidate.getTime().plusMinutes(candidate.getDurationMinutes());
        boolean conflict = scheduleEventRepository
                .findAllByStudentOrganizationIdAndDate(organizationId, candidate.getDate())
                .stream()
                .filter(event -> event.getStatus() == ScheduleStatus.SCHEDULED)
                .filter(event -> ignoredId == null || !ignoredId.equals(event.getId()))
                .anyMatch(event -> {
                    LocalTime existingEnd = event.getTime().plusMinutes(event.getDurationMinutes());
                    return candidate.getTime().isBefore(existingEnd)
                            && event.getTime().isBefore(candidateEnd);
                });
        if (conflict) {
            throw new ConflictException("Já existe um evento agendado nesse intervalo.");
        }
    }

    private UUID parseEventId(String id) {
        return parseId(id, "Evento não encontrado.");
    }

    private UUID parseStudentId(String id) {
        return parseId(id, "Aluno não encontrado.");
    }

    private UUID parseId(String id, String message) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new NotFoundException(message, exception);
        }
    }
}
