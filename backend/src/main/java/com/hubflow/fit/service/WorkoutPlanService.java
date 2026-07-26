package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.domain.WorkoutPlan;
import com.hubflow.fit.dto.WorkoutPlanRequest;
import com.hubflow.fit.dto.WorkoutPlanResponse;
import com.hubflow.fit.exception.ForbiddenException;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.StudentRepository;
import com.hubflow.fit.repository.WorkoutPlanRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final StudentRepository studentRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;

    public WorkoutPlanService(
            WorkoutPlanRepository workoutPlanRepository,
            StudentRepository studentRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService
    ) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.studentRepository = studentRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        List<WorkoutPlan> workoutPlans = currentUserService.isAdmin(currentUser)
                ? workoutPlanRepository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"))
                : workoutPlanRepository.findDistinctByAssignedStudents_Id(
                        currentUserService.requireLinkedStudentId(currentUser)
                );

        return workoutPlans.stream()
                .sorted((first, second) -> second.getUpdatedAt().compareTo(first.getUpdatedAt()))
                .map(apiMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutPlanResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        WorkoutPlan workoutPlan = findEntity(parseWorkoutId(id));
        requireWorkoutAccess(currentUser, workoutPlan);
        return apiMapper.toResponse(workoutPlan);
    }

    @Transactional
    public WorkoutPlanResponse create(WorkoutPlanRequest request) {
        requireAdmin();
        Set<Student> assignedStudents = resolveStudents(request.assignedStudentIds());
        WorkoutPlan workoutPlan = apiMapper.toEntity(request, assignedStudents);
        return apiMapper.toResponse(workoutPlanRepository.save(workoutPlan));
    }

    @Transactional
    public WorkoutPlanResponse update(String id, WorkoutPlanRequest request) {
        requireAdmin();
        WorkoutPlan workoutPlan = findEntity(parseWorkoutId(id));
        Set<Student> assignedStudents = resolveStudents(request.assignedStudentIds());
        apiMapper.updateEntity(workoutPlan, request, assignedStudents);
        return apiMapper.toResponse(workoutPlanRepository.save(workoutPlan));
    }

    @Transactional
    public void delete(String id) {
        requireAdmin();
        workoutPlanRepository.delete(findEntity(parseWorkoutId(id)));
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

    private Set<Student> resolveStudents(List<String> studentIds) {
        Set<Student> students = new LinkedHashSet<>();
        for (String studentId : studentIds) {
            students.add(findStudent(parseStudentId(studentId)));
        }
        return students;
    }

    private void requireAdmin() {
        currentUserService.requireAdmin(currentUserService.requireCurrentUser());
    }

    private WorkoutPlan findEntity(UUID id) {
        return workoutPlanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plano de treino não encontrado."));
    }

    private Student findStudent(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
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
