package com.hubflow.fit.repository;

import com.hubflow.fit.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByLinkedStudentId(UUID studentId);

    boolean existsByEmailIgnoreCase(String email);
}
