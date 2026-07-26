package com.hubflow.fit.repository;

import com.hubflow.fit.domain.MonthlyRevenue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MonthlyRevenueRepository extends JpaRepository<MonthlyRevenue, UUID> {
    List<MonthlyRevenue> findAllByOrderByDisplayOrderAsc();
}
