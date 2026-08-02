package com.hubflow.fit.repository;

import com.hubflow.fit.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Student> findByEmailIgnoreCaseAndOrganizationId(String email, UUID organizationId);

    List<Student> findAllByOrganizationIdOrderByNameAsc(UUID organizationId);

    boolean existsByEmailIgnoreCaseAndOrganizationId(String email, UUID organizationId);
}
