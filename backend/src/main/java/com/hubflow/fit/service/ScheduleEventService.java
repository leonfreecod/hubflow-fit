package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.ScheduleEvent;
import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.dto.ScheduleEventRequest;
import com.hubflow.fit.dto.ScheduleEventResponse;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.ScheduleEventRepository;
import com.hubflow.fit.repository.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ScheduleEventService {

    private final ScheduleEventRepository scheduleEventRepository;
    private final StudentRepository studentRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;

    public ScheduleEventService(
            ScheduleEventRepository scheduleEventRepository,
            StudentRepository studentRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService
    ) {
        this.scheduleEventRepository = scheduleEventRepository;
        this.studentRepository = studentRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        List<ScheduleEvent> events = currentUserService.isAdmin(currentUser)
                ? scheduleEventRepository.findAll(
                        Sort.by(Sort.Order.asc("date"), Sort.Order.asc("time"))
                )
                : scheduleEventRepository.findAllByStudentIdOrderByDateAscTimeAsc(
                        currentUserService.requireLinkedStudentId(currentUser)
                );
        return events.stream().map(apiMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ScheduleEventResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        ScheduleEvent event = findEntity(parseEventId(id));
        currentUserService.requireStudentAccess(currentUser, event.getStudent().getId());
        return apiMapper.toResponse(event);
    }

    @Transactional
    public ScheduleEventResponse create(ScheduleEventRequest request) {
        requireAdmin();
        Student student = findStudent(parseStudentId(request.studentId()));
        ScheduleEvent event = apiMapper.toEntity(request, student);
        return apiMapper.toResponse(scheduleEventRepository.save(event));
    }

    @Transactional
    public ScheduleEventResponse update(String id, ScheduleEventRequest request) {
        requireAdmin();
        ScheduleEvent event = findEntity(parseEventId(id));
        Student student = findStudent(parseStudentId(request.studentId()));
        apiMapper.updateEntity(event, request, student);
        return apiMapper.toResponse(scheduleEventRepository.save(event));
    }

    @Transactional
    public ScheduleEventResponse complete(String id) {
        requireAdmin();
        ScheduleEvent event = findEntity(parseEventId(id));
        event.setStatus(ScheduleStatus.COMPLETED);
        return apiMapper.toResponse(scheduleEventRepository.save(event));
    }

    @Transactional
    public void delete(String id) {
        requireAdmin();
        scheduleEventRepository.delete(findEntity(parseEventId(id)));
    }

    private void requireAdmin() {
        currentUserService.requireAdmin(currentUserService.requireCurrentUser());
    }

    private ScheduleEvent findEntity(UUID id) {
        return scheduleEventRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Evento não encontrado."));
    }

    private Student findStudent(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
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
