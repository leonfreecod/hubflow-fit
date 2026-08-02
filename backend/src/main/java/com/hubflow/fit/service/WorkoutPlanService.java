package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.domain.WorkoutPlan;
import com.hubflow.fit.domain.WorkoutCompletion;
import com.hubflow.fit.domain.WorkoutSession;
import com.hubflow.fit.dto.WorkoutPlanRequest;
import com.hubflow.fit.dto.WorkoutPlanResponse;
import com.hubflow.fit.exception.ForbiddenException;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.StudentRepository;
import com.hubflow.fit.repository.WorkoutPlanRepository;
import com.hubflow.fit.repository.WorkoutCompletionRepository;
import com.hubflow.fit.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDate;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final StudentRepository studentRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutCompletionRepository workoutCompletionRepository;

    public WorkoutPlanService(
            WorkoutPlanRepository workoutPlanRepository,
            StudentRepository studentRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService,
            WorkoutSessionRepository workoutSessionRepository,
            WorkoutCompletionRepository workoutCompletionRepository
    ) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.studentRepository = studentRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutCompletionRepository = workoutCompletionRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        List<WorkoutPlan> workoutPlans = currentUserService.isAdmin(currentUser)
                ? workoutPlanRepository.findAllByOrganizationIdOrderByUpdatedAtDesc(
                        currentUserService.requireOrganizationId(currentUser)
                )
                : workoutPlanRepository.findDistinctByAssignedStudents_Id(
                        currentUserService.requireLinkedStudentId(currentUser)
                );

        return workoutPlans.stream()
                .sorted((first, second) -> second.getUpdatedAt().compareTo(first.getUpdatedAt()))
                .map(plan -> toResponse(plan, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutPlanResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        WorkoutPlan workoutPlan = findEntity(
                parseWorkoutId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        requireWorkoutAccess(currentUser, workoutPlan);
        return toResponse(workoutPlan, currentUser);
    }

    @Transactional
    public WorkoutPlanResponse create(WorkoutPlanRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Set<Student> assignedStudents = resolveStudents(request.assignedStudentIds(), organizationId);
        WorkoutPlan workoutPlan = apiMapper.toEntity(request, assignedStudents);
        workoutPlan.setOrganization(currentUser.getOrganization());
        workoutPlan.setUpdatedAt(LocalDate.now());
        return apiMapper.toResponse(workoutPlanRepository.save(workoutPlan));
    }

    @Transactional
    public WorkoutPlanResponse update(String id, WorkoutPlanRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        WorkoutPlan workoutPlan = findEntity(parseWorkoutId(id), organizationId);
        Set<Student> assignedStudents = resolveStudents(request.assignedStudentIds(), organizationId);
        apiMapper.updateEntity(workoutPlan, request, assignedStudents);
        workoutPlan.setUpdatedAt(LocalDate.now());
        return apiMapper.toResponse(workoutPlanRepository.save(workoutPlan));
    }

    @Transactional
    public void delete(String id) {
        AppUser currentUser = requireAdmin();
        workoutPlanRepository.delete(findEntity(
                parseWorkoutId(id),
                currentUserService.requireOrganizationId(currentUser)
        ));
    }

    @Transactional
    public WorkoutPlanResponse completeSession(String planId, String sessionId) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        WorkoutPlan plan = findEntity(parseWorkoutId(planId), organizationId);
        requireWorkoutAccess(currentUser, plan);
        UUID studentId = currentUserService.requireLinkedStudentId(currentUser);
        WorkoutSession session = findSession(
                parseId(sessionId, "Sessão de treino não encontrada."),
                plan.getId(),
                organizationId
        );
        workoutCompletionRepository.findByStudentIdAndSessionId(studentId, session.getId())
                .orElseGet(() -> {
                    WorkoutCompletion completion = new WorkoutCompletion();
                    completion.setSession(session);
                    completion.setStudent(findStudent(studentId, organizationId));
                    completion.setCompletedAt(Instant.now());
                    return workoutCompletionRepository.save(completion);
                });
        return toResponse(plan, currentUser);
    }

    @Transactional
    public WorkoutPlanResponse undoSessionCompletion(String planId, String sessionId) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        WorkoutPlan plan = findEntity(parseWorkoutId(planId), organizationId);
        requireWorkoutAccess(currentUser, plan);
        UUID studentId = currentUserService.requireLinkedStudentId(currentUser);
        WorkoutSession session = findSession(
                parseId(sessionId, "Sessão de treino não encontrada."),
                plan.getId(),
                organizationId
        );
        workoutCompletionRepository.findByStudentIdAndSessionId(studentId, session.getId())
                .ifPresent(workoutCompletionRepository::delete);
        return toResponse(plan, currentUser);
    }

    private void requireWorkoutAccess(AppUser user, WorkoutPlan workoutPlan) {
        if (currentUserService.isAdmin(user)) {
            return;
        }

        UUID studentId = currentUserService.requireLinkedStudentId(user);
        boolean assigned = workoutPlan.getAssignedStudents().stream()
                .anyMatch(student -> studentId.equals(student.getId()));
        if (!assigned) {
            throw new ForbiddenException(
                    "Você não tem permissão para acessar este plano de treino."
            );
        }
    }

    private WorkoutPlanResponse toResponse(WorkoutPlan plan, AppUser currentUser) {
        if (currentUserService.isAdmin(currentUser)) {
            return apiMapper.toResponse(plan);
        }
        UUID studentId = currentUserService.requireLinkedStudentId(currentUser);
        Set<UUID> completedSessionIds = workoutCompletionRepository
                .findAllByStudentIdAndSessionWorkoutPlanId(studentId, plan.getId())
                .stream()
                .map(completion -> completion.getSession().getId())
                .collect(Collectors.toSet());
        return apiMapper.toResponse(plan, completedSessionIds);
    }

    private Set<Student> resolveStudents(List<String> studentIds, UUID organizationId) {
        Set<Student> students = new LinkedHashSet<>();
        for (String studentId : studentIds) {
            students.add(findStudent(parseStudentId(studentId), organizationId));
        }
        return students;
    }

    private AppUser requireAdmin() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        return currentUser;
    }

    private WorkoutPlan findEntity(UUID id, UUID organizationId) {
        return workoutPlanRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Plano de treino não encontrado."));
    }

    private Student findStudent(UUID id, UUID organizationId) {
        return studentRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
    }

    private WorkoutSession findSession(UUID id, UUID planId, UUID organizationId) {
        return workoutSessionRepository
                .findByIdAndWorkoutPlanIdAndWorkoutPlanOrganizationId(id, planId, organizationId)
                .orElseThrow(() -> new NotFoundException("Sessão de treino não encontrada."));
    }

    private UUID parseWorkoutId(String id) {
        return parseId(id, "Plano de treino não encontrado.");
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
