package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.domain.Payment;
import com.hubflow.fit.domain.PaymentStatus;
import com.hubflow.fit.domain.Student;
import com.hubflow.fit.dto.PaymentRequest;
import com.hubflow.fit.dto.PaymentResponse;
import com.hubflow.fit.exception.NotFoundException;
import com.hubflow.fit.repository.PaymentRepository;
import com.hubflow.fit.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ApiMapper apiMapper;
    private final CurrentUserService currentUserService;

    public PaymentService(
            PaymentRepository paymentRepository,
            StudentRepository studentRepository,
            ApiMapper apiMapper,
            CurrentUserService currentUserService
    ) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.apiMapper = apiMapper;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        List<Payment> payments = currentUserService.isAdmin(currentUser)
                ? paymentRepository.findAllByStudentOrganizationIdOrderByDueDateDesc(
                        currentUserService.requireOrganizationId(currentUser)
                )
                : paymentRepository.findAllByStudentIdOrderByDueDateDesc(
                        currentUserService.requireLinkedStudentId(currentUser)
                );
        return payments.stream()
                .peek(this::deriveOpenStatus)
                .map(apiMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        Payment payment = findEntity(
                parsePaymentId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        currentUserService.requireStudentAccess(currentUser, payment.getStudent().getId());
        deriveOpenStatus(payment);
        return apiMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Student student = findStudent(parseStudentId(request.studentId()), organizationId);
        Payment payment = apiMapper.toEntity(request, student);
        normalizePaymentState(payment);
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(String id, PaymentRequest request) {
        AppUser currentUser = requireAdmin();
        UUID organizationId = currentUserService.requireOrganizationId(currentUser);
        Payment payment = findEntity(parsePaymentId(id), organizationId);
        Student student = findStudent(parseStudentId(request.studentId()), organizationId);
        apiMapper.updateEntity(payment, request, student);
        normalizePaymentState(payment);
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse markPaid(String id) {
        AppUser currentUser = requireAdmin();
        Payment payment = findEntity(
                parsePaymentId(id),
                currentUserService.requireOrganizationId(currentUser)
        );
        payment.setStatus(PaymentStatus.PAID);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDate.now());
        }
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void delete(String id) {
        AppUser currentUser = requireAdmin();
        paymentRepository.delete(findEntity(
                parsePaymentId(id),
                currentUserService.requireOrganizationId(currentUser)
        ));
    }

    private AppUser requireAdmin() {
        AppUser currentUser = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(currentUser);
        return currentUser;
    }

    private Payment findEntity(UUID id, UUID organizationId) {
        return paymentRepository.findByIdAndStudentOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado."));
    }

    private Student findStudent(UUID id, UUID organizationId) {
        return studentRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
    }

    private void normalizePaymentState(Payment payment) {
        if (payment.getStatus() == PaymentStatus.PAID) {
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDate.now());
            }
            return;
        }
        payment.setPaidAt(null);
        deriveOpenStatus(payment);
    }

    private void deriveOpenStatus(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(payment.getDueDate().isBefore(LocalDate.now())
                    ? PaymentStatus.OVERDUE
                    : PaymentStatus.PENDING);
        }
    }

    private UUID parsePaymentId(String id) {
        return parseId(id, "Pagamento não encontrado.");
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
