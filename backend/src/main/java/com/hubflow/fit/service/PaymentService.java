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
import org.springframework.data.domain.Sort;
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
                ? paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "dueDate"))
                : paymentRepository.findAllByStudentIdOrderByDueDateDesc(
                        currentUserService.requireLinkedStudentId(currentUser)
                );
        return payments.stream().map(apiMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse findById(String id) {
        AppUser currentUser = currentUserService.requireCurrentUser();
        Payment payment = findEntity(parsePaymentId(id));
        currentUserService.requireStudentAccess(currentUser, payment.getStudent().getId());
        return apiMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse create(PaymentRequest request) {
        requireAdmin();
        Student student = findStudent(parseStudentId(request.studentId()));
        Payment payment = apiMapper.toEntity(request, student);
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse update(String id, PaymentRequest request) {
        requireAdmin();
        Payment payment = findEntity(parsePaymentId(id));
        Student student = findStudent(parseStudentId(request.studentId()));
        apiMapper.updateEntity(payment, request, student);
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse markPaid(String id) {
        requireAdmin();
        Payment payment = findEntity(parsePaymentId(id));
        payment.setStatus(PaymentStatus.PAID);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDate.now());
        }
        return apiMapper.toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void delete(String id) {
        requireAdmin();
        paymentRepository.delete(findEntity(parsePaymentId(id)));
    }

    private void requireAdmin() {
        currentUserService.requireAdmin(currentUserService.requireCurrentUser());
    }

    private Payment findEntity(UUID id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado."));
    }

    private Student findStudent(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Aluno não encontrado."));
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
