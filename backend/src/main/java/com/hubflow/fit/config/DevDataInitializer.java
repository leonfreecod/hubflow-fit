package com.hubflow.fit.config;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.OrganizationSettings;
import com.hubflow.fit.domain.Payment;
import com.hubflow.fit.domain.PaymentMethod;
import com.hubflow.fit.domain.PaymentStatus;
import com.hubflow.fit.domain.ScheduleEvent;
import com.hubflow.fit.domain.ScheduleStatus;
import com.hubflow.fit.domain.ScheduleType;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.domain.StudentStatus;
import com.hubflow.fit.domain.UserRole;
import com.hubflow.fit.domain.WorkoutLevel;
import com.hubflow.fit.domain.WorkoutPlan;
import com.hubflow.fit.repository.AppUserRepository;
import com.hubflow.fit.repository.OrganizationSettingsRepository;
import com.hubflow.fit.repository.PaymentRepository;
import com.hubflow.fit.repository.ScheduleEventRepository;
import com.hubflow.fit.repository.StudentRepository;
import com.hubflow.fit.repository.WorkoutPlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@Profile({"dev", "docker"})
public class DevDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);
    private static final String DEVELOPMENT_PASSWORD = "hubflow123";

    private static final List<StudentSeed> STUDENTS = List.of(
            new StudentSeed(
                    "student-001", "Mariana Costa", "mariana.costa@email.com", "(11) 98810-2201",
                    StudentStatus.ACTIVE, "Performance Pro", "289.90", "2026-02-10", "2026-08-05",
                    "Correr 10 km abaixo de 50 minutos", "Rafael Martins", "MC", 82
            ),
            new StudentSeed(
                    "student-002", "Lucas Almeida", "lucas.almeida@email.com", "(11) 97731-4402",
                    StudentStatus.ACTIVE, "Essencial", "189.90", "2026-03-18", "2026-08-10",
                    "Ganho de força e condicionamento", "Rafael Martins", "LA", 68
            ),
            new StudentSeed(
                    "student-003", "Bianca Rodrigues", "bianca.rodrigues@email.com", "(11) 99700-8710",
                    StudentStatus.ACTIVE, "Assessoria Running", "229.90", "2025-11-02", "2026-08-02",
                    "Completar a primeira meia maratona", "Camila Nunes", "BR", 75
            ),
            new StudentSeed(
                    "student-004", "Gabriel Santos", "gabriel.santos@email.com", "(11) 98192-7311",
                    StudentStatus.PAUSED, "Essencial", "189.90", "2026-01-20", "2026-08-15",
                    "Redução de gordura corporal", "Rafael Martins", "GS", 44
            ),
            new StudentSeed(
                    "student-005", "Fernanda Lima", "fernanda.lima@email.com", "(11) 96680-2214",
                    StudentStatus.ACTIVE, "Performance Pro", "289.90", "2025-09-11", "2026-07-22",
                    "Melhorar mobilidade e resistência", "Camila Nunes", "FL", 89
            ),
            new StudentSeed(
                    "student-006", "Diego Oliveira", "diego.oliveira@email.com", "(11) 97520-1180",
                    StudentStatus.INACTIVE, "Assessoria Running", "229.90", "2025-08-04", "2026-07-05",
                    "Retorno gradual às corridas", "Rafael Martins", "DO", 31
            )
    );

    private static final List<PaymentSeed> PAYMENTS = List.of(
            new PaymentSeed(
                    "student-001", "Mensalidade — agosto", "289.90", "2026-08-05", null,
                    PaymentStatus.PENDING, PaymentMethod.PIX
            ),
            new PaymentSeed(
                    "student-002", "Mensalidade — julho", "189.90", "2026-07-10", "2026-07-08",
                    PaymentStatus.PAID, PaymentMethod.PIX
            ),
            new PaymentSeed(
                    "student-003", "Mensalidade — julho", "229.90", "2026-07-02", "2026-07-02",
                    PaymentStatus.PAID, PaymentMethod.CARD
            ),
            new PaymentSeed(
                    "student-004", "Mensalidade — julho", "189.90", "2026-07-15", null,
                    PaymentStatus.OVERDUE, PaymentMethod.PIX
            ),
            new PaymentSeed(
                    "student-005", "Mensalidade — julho", "289.90", "2026-07-22", null,
                    PaymentStatus.OVERDUE, PaymentMethod.TRANSFER
            ),
            new PaymentSeed(
                    "student-001", "Avaliação física", "120.00", "2026-07-05", "2026-07-05",
                    PaymentStatus.PAID, PaymentMethod.PIX
            )
    );

    private static final List<ScheduleSeed> SCHEDULE = List.of(
            new ScheduleSeed(
                    "student-001", "Treino de ritmo", "2026-07-27", "07:00", 60,
                    "Parque Central", ScheduleStatus.SCHEDULED, ScheduleType.PERSONAL
            ),
            new ScheduleSeed(
                    "student-002", "Treino de força", "2026-07-27", "10:30", 50,
                    "Studio Hub", ScheduleStatus.SCHEDULED, ScheduleType.PERSONAL
            ),
            new ScheduleSeed(
                    "student-003", "Longão em grupo", "2026-07-28", "06:00", 100,
                    "Parque do Ibirapuera", ScheduleStatus.SCHEDULED, ScheduleType.GROUP
            ),
            new ScheduleSeed(
                    "student-005", "Avaliação trimestral", "2026-07-29", "18:30", 45,
                    "Studio Hub", ScheduleStatus.SCHEDULED, ScheduleType.ASSESSMENT
            ),
            new ScheduleSeed(
                    "student-001", "Revisão de planilha", "2026-07-24", "19:00", 30,
                    "Google Meet", ScheduleStatus.COMPLETED, ScheduleType.ONLINE
            )
    );

    private static final List<WorkoutSeed> WORKOUTS = List.of(
            new WorkoutSeed(
                    "10K Performance", "Velocidade e resistência", WorkoutLevel.INTERMEDIATE, 8, 4,
                    Set.of("student-001", "student-003"), "2026-07-22",
                    "Ciclo progressivo com intervalados, tempo run, rodagem leve e longão."
            ),
            new WorkoutSeed(
                    "Força Essencial", "Força geral e estabilidade", WorkoutLevel.BEGINNER, 6, 3,
                    Set.of("student-002", "student-004"), "2026-07-20",
                    "Base de movimentos fundamentais, mobilidade e progressão semanal."
            ),
            new WorkoutSeed(
                    "Meia Maratona Base", "Construção de volume", WorkoutLevel.INTERMEDIATE, 12, 5,
                    Set.of("student-003"), "2026-07-18",
                    "Bloco de base aeróbia para preparação segura da primeira meia maratona."
            ),
            new WorkoutSeed(
                    "Mobilidade & Condicionamento", "Mobilidade e resistência", WorkoutLevel.BEGINNER, 4, 3,
                    Set.of("student-005"), "2026-07-24",
                    "Sessões curtas combinando mobilidade ativa, core e condicionamento leve."
            )
    );

    private final StudentRepository studentRepository;
    private final AppUserRepository appUserRepository;
    private final OrganizationSettingsRepository organizationSettingsRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DevDataInitializer(
            StudentRepository studentRepository,
            AppUserRepository appUserRepository,
            OrganizationSettingsRepository organizationSettingsRepository,
            PaymentRepository paymentRepository,
            ScheduleEventRepository scheduleEventRepository,
            WorkoutPlanRepository workoutPlanRepository
    ) {
        this.studentRepository = studentRepository;
        this.appUserRepository = appUserRepository;
        this.organizationSettingsRepository = organizationSettingsRepository;
        this.paymentRepository = paymentRepository;
        this.scheduleEventRepository = scheduleEventRepository;
        this.workoutPlanRepository = workoutPlanRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        SeedResult<Student> students = seedStudents();
        int organizationsCreated = seedOrganization();
        int usersCreated = seedUsers(students.byKey());
        int paymentsCreated = seedPayments(students.byKey());
        int eventsCreated = seedSchedule(students.byKey());
        int workoutsCreated = seedWorkouts(students.byKey());

        log.info(
                "Seed dev verificado: {} aluno(s), {} organização(ões), {} usuário(s), "
                        + "{} pagamento(s), {} evento(s) e {} treino(s) criado(s)",
                students.created(), organizationsCreated, usersCreated, paymentsCreated,
                eventsCreated, workoutsCreated
        );
    }

    private SeedResult<Student> seedStudents() {
        Map<String, Student> studentsByKey = new LinkedHashMap<>();
        int created = 0;

        for (StudentSeed seed : STUDENTS) {
            Student student = studentRepository.findByEmailIgnoreCase(seed.email()).orElse(null);
            if (student == null) {
                student = studentRepository.save(toStudent(seed));
                created++;
            }
            studentsByKey.put(seed.key(), student);
        }

        return new SeedResult<>(studentsByKey, created);
    }

    private int seedOrganization() {
        if (organizationSettingsRepository.count() > 0) {
            return 0;
        }

        OrganizationSettings organization = new OrganizationSettings();
        organization.setName("Hub Running Assessoria");
        organization.setDocument("12.345.678/0001-90");
        organization.setPhone("(11) 4002-8922");
        organization.setEmail("contato@hubrunning.com.br");
        organization.setPixKey("financeiro@hubrunning.com.br");
        organization.setCity("São Paulo — SP");
        organizationSettingsRepository.save(organization);
        return 1;
    }

    private int seedUsers(Map<String, Student> studentsByKey) {
        int created = 0;
        if (appUserRepository.findByEmailIgnoreCase("admin@hubflow.fit").isEmpty()) {
            appUserRepository.save(newUser(
                    "Rafael Martins", "admin@hubflow.fit", UserRole.ADMIN, null
            ));
            created++;
        }

        if (appUserRepository.findByEmailIgnoreCase("aluno@hubflow.fit").isEmpty()) {
            appUserRepository.save(newUser(
                    "Mariana Costa", "aluno@hubflow.fit", UserRole.STUDENT,
                    studentsByKey.get("student-001")
            ));
            created++;
        }
        return created;
    }

    private int seedPayments(Map<String, Student> studentsByKey) {
        List<Payment> existing = paymentRepository.findAll();
        int created = 0;

        for (PaymentSeed seed : PAYMENTS) {
            Student student = studentsByKey.get(seed.studentKey());
            LocalDate dueDate = LocalDate.parse(seed.dueDate());
            boolean alreadyExists = existing.stream().anyMatch(payment ->
                    payment.getStudent().getId().equals(student.getId())
                            && payment.getDescription().equals(seed.description())
                            && payment.getDueDate().equals(dueDate)
            );
            if (!alreadyExists) {
                paymentRepository.save(toPayment(seed, student));
                created++;
            }
        }
        return created;
    }

    private int seedSchedule(Map<String, Student> studentsByKey) {
        List<ScheduleEvent> existing = scheduleEventRepository.findAll();
        int created = 0;

        for (ScheduleSeed seed : SCHEDULE) {
            Student student = studentsByKey.get(seed.studentKey());
            LocalDate date = LocalDate.parse(seed.date());
            LocalTime time = LocalTime.parse(seed.time());
            boolean alreadyExists = existing.stream().anyMatch(event ->
                    event.getStudent().getId().equals(student.getId())
                            && event.getTitle().equals(seed.title())
                            && event.getDate().equals(date)
                            && event.getTime().equals(time)
            );
            if (!alreadyExists) {
                scheduleEventRepository.save(toScheduleEvent(seed, student));
                created++;
            }
        }
        return created;
    }

    private int seedWorkouts(Map<String, Student> studentsByKey) {
        Set<String> existingNames = workoutPlanRepository.findAll().stream()
                .map(WorkoutPlan::getName)
                .collect(java.util.stream.Collectors.toSet());
        int created = 0;

        for (WorkoutSeed seed : WORKOUTS) {
            if (!existingNames.contains(seed.name())) {
                workoutPlanRepository.save(toWorkoutPlan(seed, studentsByKey));
                created++;
            }
        }
        return created;
    }

    private Student toStudent(StudentSeed seed) {
        Student student = new Student();
        student.setName(seed.name());
        student.setEmail(seed.email());
        student.setPhone(seed.phone());
        student.setStatus(seed.status());
        student.setPlan(seed.plan());
        student.setMonthlyFee(new BigDecimal(seed.monthlyFee()));
        student.setJoinedAt(LocalDate.parse(seed.joinedAt()));
        student.setNextBillingDate(LocalDate.parse(seed.nextBillingDate()));
        student.setGoal(seed.goal());
        student.setCoach(seed.coach());
        student.setInitials(seed.initials());
        student.setProgress(seed.progress());
        return student;
    }

    private AppUser newUser(String name, String email, UserRole role, Student linkedStudent) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(DEVELOPMENT_PASSWORD));
        user.setRole(role);
        user.setLinkedStudent(linkedStudent);
        return user;
    }

    private Payment toPayment(PaymentSeed seed, Student student) {
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setDescription(seed.description());
        payment.setAmount(new BigDecimal(seed.amount()));
        payment.setDueDate(LocalDate.parse(seed.dueDate()));
        payment.setPaidAt(seed.paidAt() == null ? null : LocalDate.parse(seed.paidAt()));
        payment.setStatus(seed.status());
        payment.setMethod(seed.method());
        return payment;
    }

    private ScheduleEvent toScheduleEvent(ScheduleSeed seed, Student student) {
        ScheduleEvent event = new ScheduleEvent();
        event.setStudent(student);
        event.setTitle(seed.title());
        event.setDate(LocalDate.parse(seed.date()));
        event.setTime(LocalTime.parse(seed.time()));
        event.setDurationMinutes(seed.durationMinutes());
        event.setLocation(seed.location());
        event.setStatus(seed.status());
        event.setType(seed.type());
        return event;
    }

    private WorkoutPlan toWorkoutPlan(WorkoutSeed seed, Map<String, Student> studentsByKey) {
        WorkoutPlan workout = new WorkoutPlan();
        workout.setName(seed.name());
        workout.setObjective(seed.objective());
        workout.setLevel(seed.level());
        workout.setWeeks(seed.weeks());
        workout.setSessionsPerWeek(seed.sessionsPerWeek());
        LinkedHashSet<Student> assignedStudents = new LinkedHashSet<>();
        seed.studentKeys().forEach(key -> assignedStudents.add(studentsByKey.get(key)));
        workout.setAssignedStudents(assignedStudents);
        workout.setUpdatedAt(LocalDate.parse(seed.updatedAt()));
        workout.setDescription(seed.description());
        return workout;
    }

    private record SeedResult<T>(Map<String, T> byKey, int created) {
    }

    private record StudentSeed(
            String key,
            String name,
            String email,
            String phone,
            StudentStatus status,
            String plan,
            String monthlyFee,
            String joinedAt,
            String nextBillingDate,
            String goal,
            String coach,
            String initials,
            int progress
    ) {
    }

    private record PaymentSeed(
            String studentKey,
            String description,
            String amount,
            String dueDate,
            String paidAt,
            PaymentStatus status,
            PaymentMethod method
    ) {
    }

    private record ScheduleSeed(
            String studentKey,
            String title,
            String date,
            String time,
            int durationMinutes,
            String location,
            ScheduleStatus status,
            ScheduleType type
    ) {
    }

    private record WorkoutSeed(
            String name,
            String objective,
            WorkoutLevel level,
            int weeks,
            int sessionsPerWeek,
            Set<String> studentKeys,
            String updatedAt,
            String description
    ) {
    }
}
