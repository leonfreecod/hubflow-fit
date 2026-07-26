package com.hubflow.fit.repository;

import com.hubflow.fit.domain.StudentProgressPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentProgressPointRepository extends JpaRepository<StudentProgressPoint, UUID> {
    List<StudentProgressPoint> findAllByStudentIdOrderByDisplayOrderAsc(UUID studentId);
    void deleteAllByStudentId(UUID studentId);
}
