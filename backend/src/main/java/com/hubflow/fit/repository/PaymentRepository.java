package com.hubflow.fit.repository;

import com.hubflow.fit.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findAllByStudentIdOrderByDueDateDesc(UUID studentId);

    List<Payment> findAllByStudentOrganizationIdOrderByDueDateDesc(UUID organizationId);

    Optional<Payment> findByIdAndStudentOrganizationId(UUID id, UUID organizationId);
}
