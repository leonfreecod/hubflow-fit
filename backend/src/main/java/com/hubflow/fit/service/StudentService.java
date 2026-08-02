package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.dto.StudentRequest;
import com.hubflow.fit.dto.StudentResponse;
import com.hubflow.fit.dto.InvitationResponse;
import com.hubflow.fit.exception.ConflictException;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.AppUserRepository;
import com.hubflow.fit.repository.PaymentRepository;
import com.hubflow.fit.repository.ScheduleEventRepository;
import com.hubflow.fit.repository.StudentRepository;
import com.hubflow.fit.repository.StudentProgressPointRepository;
import com.hubflow.fit.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AppUserRepository appUserRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final StudentProgressPointRepository studentProgressPointRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;
    private final AccountLifecycleService accountLifecycleService;

    public StudentService(
            StudentRepository studentRepository,
            AppUserRepository appUserRepository,
            PaymentRepository paymentRepository,
            ScheduleEventRepository scheduleEventRepository,
            WorkoutPlanRepository workoutPlanRepository,
            StudentProgressPointRepository studentProgressPointRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService,
            AccountLifecycleService accountLifecycleService
    ) {
        this.studentRepository = studentRepository;
        this.appUserRepository = appUserRepository;
        this.paymentRepository = paymentRepository;
        this.scheduleEventRepository = scheduleEventRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.studentProgressPointRepository = studentProgressPointRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
        this.accountLifecycleService = accountLifecycleService;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        if (!currentUserService.isAdmin(currentUser)) {
            Student student = findEntity(
                    currentUserService.requireLinkedStudentId(currentUser),
                    currentUserService.requireOrganizationId(currentUser)
            );
            return List.of(apiMapper.toResponse(student));
        }

        return studentRepository.findAllByOrganizationIdOrderByNameAsc(
                        currentUserService.requireOrganizationId(currentUser)
                ).stream()
                .map(apiMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse findById(String id) {
        UUID studentId = parseId(id);
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireStudentAccess(currentUser, studentId);
        return apiMapper.toResponse(findEntity(
                studentId,
                currentUserService.requireOrganizationId(currentUser)
        ));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        String email = normalizeEmail(request.email());
        ensureEmailAvailable(email, organizationId, null);

        Student student = apiMapper.toEntity(request);
        student.setEmail(email);
        student.setOrganization(currentUser.getOrganization());
        Student saved = studentRepository.save(student);
        accountLifecycleService.inviteStudent(saved);
        return apiMapper.toResponse(saved);
    }

    @Transactional
    public StudentResponse update(String id, StudentRequest request) {
        UUID studentId = parseId(id);
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireStudentAccess(currentUser, studentId);

        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Student student = findEntity(studentId, organizationId);
        String email = normalizeEmail(request.email());
        ensureEmailAvailable(email, organizationId, studentId);

        if (currentUserService.isAdmin(currentUser)) {
            apiMapper.updateEntity(student, request);
        } else {
            updateOwnProfile(student, request);
        }
        student.setEmail(email);

        appUserRepository.findByLinkedStudentIdAndOrganizationId(studentId, organizationId)
                .ifPresent(user -> {
                    ensurePortalEmailAvailable(email, user.getId());
                    user.setName(student.getName());
                    user.setEmail(email);
                });

        return apiMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public void delete(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Student student = findEntity(parseId(id), organizationId);
        appUserRepository.findByLinkedStudentIdAndOrganizationId(student.getId(), organizationId)
                .ifPresent(appUserRepository::delete);
        paymentRepository.deleteAll(
                paymentRepository.findAllByStudentIdOrderByDueDateDesc(student.getId())
        );
        scheduleEventRepository.deleteAll(
                scheduleEventRepository.findAllByStudentIdOrderByDateAscTimeAsc(student.getId())
        );
        studentProgressPointRepository.deleteAllByStudentId(student.getId());
        workoutPlanRepository.findDistinctByAssignedStudents_Id(student.getId())
                .forEach(workout -> workout.getAssignedStudents().remove(student));
        studentRepository.delete(student);
    }

    @Transactional
    public InvitationResponse resendInvitation(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        Student student = findEntity(
                parseId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        return accountLifecycleService.inviteStudent(student);
    }

    private void updateOwnProfile(Student student, StudentRequest request) {
        student.setName(request.name());
        student.setEmail(request.email());
        student.setPhone(request.phone());
        student.setGoal(request.goal());
    }

    private void ensureEmailAvailable(String email, UUID organizationId, UUID currentStudentId) {
        studentRepository.findByEmailIgnoreCaseAndOrganizationId(email, organizationId)
                .filter(student -> !student.getId().equals(currentStudentId))
                .ifPresent(student -> {
                    throw new ConflictException("Já existe um aluno com este e-mail.");
                });
    }

    private void ensurePortalEmailAvailable(String email, UUID currentUserId) {
        appUserRepository.findByEmailIgnoreCase(email)
                .filter(user -> !user.getId().equals(currentUserId))
                .ifPresent(user -> {
                    throw new ConflictException("Já existe uma conta com este e-mail.");
                });
    }

    private Student findEntity(UUID id, UUID organizationId) {
        return studentRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
    }

    private UUID parseId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new NotFoundException("Aluno não encontrado.", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
