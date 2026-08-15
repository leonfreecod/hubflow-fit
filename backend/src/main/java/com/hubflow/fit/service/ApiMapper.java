package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.OrganizationSettings;
import com.hubflow.fit.domain.Payment;
import com.hubflow.fit.domain.ScheduleEvent;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.domain.WorkoutPlan;
import com.hubflow.fit.domain.WorkoutSession;
import com.hubflow.fit.domain.WorkoutExercise;
import com.hubflow.fit.dto.AuthResponse;
import com.hubflow.fit.dto.OrganizationSettingsRequest;
import com.hubflow.fit.dto.OrganizationSettingsResponse;
import com.hubflow.fit.dto.PaymentRequest;
import com.hubflow.fit.dto.PaymentResponse;
import com.hubflow.fit.dto.ScheduleEventRequest;
import com.hubflow.fit.dto.ScheduleEventResponse;
import com.hubflow.fit.dto.StudentRequest;
import com.hubflow.fit.dto.StudentResponse;
import com.hubflow.fit.dto.UserRequest;
import com.hubflow.fit.dto.UserResponse;
import com.hubflow.fit.dto.WorkoutPlanRequest;
import com.hubflow.fit.dto.WorkoutPlanResponse;
import com.hubflow.fit.dto.WorkoutSessionRequest;
import com.hubflow.fit.dto.WorkoutSessionResponse;
import com.hubflow.fit.dto.WorkoutExerciseRequest;
import com.hubflow.fit.dto.WorkoutExerciseResponse;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.ArrayList;

@Component
public class ApiMapper {

    public StudentResponse toResponse(Student student) {
        Objects.requireNonNull(student, "student must not be null");
        return new StudentResponse(
                idAsString(student.getId()),
                student.getName(),
                student.getEmail(),
                student.getPhone(),
                student.getStatus(),
                student.getPlan(),
                student.getMonthlyFee(),
                student.getJoinedAt(),
                student.getNextBillingDate(),
                student.getGoal(),
                student.getCoach(),
                student.getInitials(),
                student.getProgress()
        );
    }

    public Student toEntity(StudentRequest request) {
        Student student = new Student();
        updateEntity(student, request);
        return student;
    }

    public void updateEntity(Student student, StudentRequest request) {
        Objects.requireNonNull(student, "student must not be null");
        Objects.requireNonNull(request, "request must not be null");
        student.setName(request.name());
        student.setEmail(request.email());
        student.setPhone(request.phone());
        student.setStatus(request.status());
        student.setPlan(request.plan());
        student.setMonthlyFee(request.monthlyFee());
        student.setJoinedAt(request.joinedAt());
        student.setNextBillingDate(request.nextBillingDate());
        student.setGoal(request.goal());
        student.setCoach(request.coach());
        student.setInitials(request.initials());
        student.setProgress(request.progress());
    }

    public PaymentResponse toResponse(Payment payment) {
        Objects.requireNonNull(payment, "payment must not be null");
        Student student = requireStudent(payment.getStudent());
        return new PaymentResponse(
                idAsString(payment.getId()),
                idAsString(student.getId()),
                student.getName(),
                payment.getDescription(),
                payment.getAmount(),
                payment.getDueDate(),
                payment.getPaidAt(),
                payment.getStatus(),
                payment.getMethod()
        );
    }

    public Payment toEntity(PaymentRequest request, Student student) {
        Payment payment = new Payment();
        updateEntity(payment, request, student);
        return payment;
    }

    public void updateEntity(Payment payment, PaymentRequest request, Student student) {
        Objects.requireNonNull(payment, "payment must not be null");
        Objects.requireNonNull(request, "request must not be null");
        payment.setStudent(requireStudent(student));
        payment.setDescription(request.description());
        payment.setAmount(request.amount());
        payment.setDueDate(request.dueDate());
        payment.setPaidAt(request.paidAt());
        payment.setStatus(request.status());
        payment.setMethod(request.method());
    }

    public ScheduleEventResponse toResponse(ScheduleEvent event) {
        Objects.requireNonNull(event, "event must not be null");
        Student student = requireStudent(event.getStudent());
        return new ScheduleEventResponse(
                idAsString(event.getId()),
                idAsString(student.getId()),
                student.getName(),
                event.getTitle(),
                event.getDate(),
                event.getTime(),
                event.getDurationMinutes(),
                event.getLocation(),
                event.getStatus(),
                event.getType(),
                idAsString(event.getRecurrenceGroupId())
        );
    }

    public ScheduleEvent toEntity(ScheduleEventRequest request, Student student) {
        ScheduleEvent event = new ScheduleEvent();
        updateEntity(event, request, student);
        return event;
    }

    public void updateEntity(ScheduleEvent event, ScheduleEventRequest request, Student student) {
        Objects.requireNonNull(event, "event must not be null");
        Objects.requireNonNull(request, "request must not be null");
        event.setStudent(requireStudent(student));
        event.setTitle(request.title());
        event.setDate(request.date());
        event.setTime(request.time());
        event.setDurationMinutes(request.durationMinutes());
        event.setLocation(request.location());
        event.setStatus(request.status());
        event.setType(request.type());
    }

    public WorkoutPlanResponse toResponse(WorkoutPlan workoutPlan) {
        return toResponse(workoutPlan, Set.of());
    }

    public WorkoutPlanResponse toResponse(
            WorkoutPlan workoutPlan,
            Set<UUID> completedSessionIds
    ) {
        Objects.requireNonNull(workoutPlan, "workoutPlan must not be null");
        List<String> assignedStudentIds = safeAssignedStudents(workoutPlan.getAssignedStudents()).stream()
                .map(Student::getId)
                .filter(Objects::nonNull)
                .map(UUID::toString)
                .toList();
        return new WorkoutPlanResponse(
                idAsString(workoutPlan.getId()),
                workoutPlan.getName(),
                workoutPlan.getObjective(),
                workoutPlan.getLevel(),
                workoutPlan.getWeeks(),
                workoutPlan.getSessionsPerWeek(),
                assignedStudentIds,
                workoutPlan.getUpdatedAt(),
                workoutPlan.getDescription(),
                workoutPlan.getSessions().stream()
                        .map(session -> toResponse(session, completedSessionIds))
                        .toList()
        );
    }

    public WorkoutPlan toEntity(WorkoutPlanRequest request, Set<Student> assignedStudents) {
        WorkoutPlan workoutPlan = new WorkoutPlan();
        updateEntity(workoutPlan, request, assignedStudents);
        return workoutPlan;
    }

    public void updateEntity(
            WorkoutPlan workoutPlan,
            WorkoutPlanRequest request,
            Set<Student> assignedStudents
    ) {
        Objects.requireNonNull(workoutPlan, "workoutPlan must not be null");
        Objects.requireNonNull(request, "request must not be null");
        Objects.requireNonNull(assignedStudents, "assignedStudents must not be null");
        workoutPlan.setName(request.name());
        workoutPlan.setObjective(request.objective());
        workoutPlan.setLevel(request.level());
        workoutPlan.setWeeks(request.weeks());
        workoutPlan.setSessionsPerWeek(request.sessionsPerWeek());
        replaceAssignedStudents(workoutPlan, assignedStudents);
        workoutPlan.setUpdatedAt(request.updatedAt());
        workoutPlan.setDescription(request.description());
        replaceSessions(workoutPlan, request.sessions());
    }

    public OrganizationSettingsResponse toResponse(OrganizationSettings settings) {
        Objects.requireNonNull(settings, "settings must not be null");
        return new OrganizationSettingsResponse(
                settings.getName(),
                settings.getDocument(),
                settings.getPhone(),
                settings.getEmail(),
                settings.getPixKey(),
                settings.getCity()
        );
    }

    public OrganizationSettings toEntity(OrganizationSettingsRequest request) {
        OrganizationSettings settings = new OrganizationSettings();
        updateEntity(settings, request);
        return settings;
    }

    public void updateEntity(OrganizationSettings settings, OrganizationSettingsRequest request) {
        Objects.requireNonNull(settings, "settings must not be null");
        Objects.requireNonNull(request, "request must not be null");
        settings.setName(request.name());
        settings.setDocument(request.document());
        settings.setPhone(request.phone());
        settings.setEmail(request.email());
        settings.setPixKey(request.pixKey());
        settings.setCity(request.city());
    }

    public UserResponse toResponse(AppUser user) {
        Objects.requireNonNull(user, "user must not be null");
        return new UserResponse(
                idAsString(user.getId()),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                user.isReadOnly(),
                user.getAvatar(),
                user.getLinkedStudent() == null ? null : idAsString(user.getLinkedStudent().getId())
        );
    }

    public AuthResponse toAuthResponse(String token, AppUser user) {
        return new AuthResponse(Objects.requireNonNull(token, "token must not be null"), toResponse(user));
    }

    public AppUser toEntity(UserRequest request, String passwordHash, Student linkedStudent) {
        Objects.requireNonNull(passwordHash, "passwordHash must not be null");
        AppUser user = new AppUser();
        updateEntity(user, request, passwordHash, linkedStudent);
        return user;
    }

    public void updateEntity(
            AppUser user,
            UserRequest request,
            String passwordHash,
            Student linkedStudent
    ) {
        Objects.requireNonNull(user, "user must not be null");
        Objects.requireNonNull(request, "request must not be null");
        user.setName(request.name());
        user.setEmail(request.email());
        if (passwordHash != null) {
            user.setPasswordHash(passwordHash);
        }
        user.setRole(request.role());
        user.setAvatar(request.avatar());
        user.setLinkedStudent(linkedStudent);
    }

    private static String idAsString(UUID id) {
        return id == null ? null : id.toString();
    }

    private static Student requireStudent(Student student) {
        return Objects.requireNonNull(student, "student relationship must not be null");
    }

    private static Set<Student> safeAssignedStudents(Set<Student> assignedStudents) {
        return assignedStudents == null ? Set.of() : assignedStudents;
    }

    private static void replaceAssignedStudents(WorkoutPlan workoutPlan, Set<Student> assignedStudents) {
        Set<Student> currentStudents = workoutPlan.getAssignedStudents();
        if (currentStudents == null) {
            workoutPlan.setAssignedStudents(new LinkedHashSet<>(assignedStudents));
            return;
        }
        currentStudents.clear();
        currentStudents.addAll(assignedStudents);
    }

    private WorkoutSessionResponse toResponse(
            WorkoutSession session,
            Set<UUID> completedSessionIds
    ) {
        return new WorkoutSessionResponse(
                idAsString(session.getId()),
                session.getWeekNumber(),
                session.getDayOrder(),
                session.getName(),
                session.getInstructions(),
                session.getExercises().stream()
                        .map(exercise -> new WorkoutExerciseResponse(
                                idAsString(exercise.getId()),
                                exercise.getName(),
                                exercise.getPrescription(),
                                exercise.getRestSeconds()
                        ))
                        .toList(),
                session.getId() != null && completedSessionIds.contains(session.getId())
        );
    }

    private void replaceSessions(
            WorkoutPlan workoutPlan,
            List<WorkoutSessionRequest> sessionRequests
    ) {
        List<WorkoutSession> sessions = workoutPlan.getSessions();
        if (sessions == null) {
            sessions = new ArrayList<>();
            workoutPlan.setSessions(sessions);
        } else {
            sessions.clear();
        }

        for (WorkoutSessionRequest sessionRequest : sessionRequests) {
            WorkoutSession session = new WorkoutSession();
            session.setWorkoutPlan(workoutPlan);
            session.setWeekNumber(sessionRequest.weekNumber());
            session.setDayOrder(sessionRequest.dayOrder());
            session.setName(sessionRequest.name());
            session.setInstructions(sessionRequest.instructions());

            List<WorkoutExercise> exercises = new ArrayList<>();
            int displayOrder = 0;
            for (WorkoutExerciseRequest exerciseRequest : sessionRequest.exercises()) {
                WorkoutExercise exercise = new WorkoutExercise();
                exercise.setSession(session);
                exercise.setDisplayOrder(displayOrder++);
                exercise.setName(exerciseRequest.name());
                exercise.setPrescription(exerciseRequest.prescription());
                exercise.setRestSeconds(exerciseRequest.restSeconds());
                exercises.add(exercise);
            }
            session.setExercises(exercises);
            sessions.add(session);
        }
    }
}
