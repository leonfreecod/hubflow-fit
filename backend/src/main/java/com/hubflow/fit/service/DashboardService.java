package com.hubflow.fit.service;

import com.hubflow.fit.domain.AppUser;
import com.hubflow.fit.dto.MonthlyRevenueResponse;
import com.hubflow.fit.dto.StudentProgressPointResponse;
import com.hubflow.fit.repository.MonthlyRevenueRepository;
import com.hubflow.fit.repository.StudentProgressPointRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final MonthlyRevenueRepository monthlyRevenueRepository;
    private final StudentProgressPointRepository studentProgressPointRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(
            MonthlyRevenueRepository monthlyRevenueRepository,
            StudentProgressPointRepository studentProgressPointRepository,
            CurrentUserService currentUserService
    ) {
        this.monthlyRevenueRepository = monthlyRevenueRepository;
        this.studentProgressPointRepository = studentProgressPointRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<MonthlyRevenueResponse> monthlyRevenue() {
        AppUser user = currentUserService.requireCurrentUser();
        currentUserService.requireAdmin(user);
        return monthlyRevenueRepository.findAllByOrganizationIdOrderByDisplayOrderAsc(
                        currentUserService.requireOrganizationId(user)
                ).stream()
                .map(item -> new MonthlyRevenueResponse(
                        item.getMonth(), item.getRevenue(), item.getExpenses()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentProgressPointResponse> studentProgress() {
        AppUser user = currentUserService.requireCurrentUser();
        var studentId = currentUserService.requireLinkedStudentId(user);
        return studentProgressPointRepository
                .findAllByStudentIdOrderByDisplayOrderAsc(studentId)
                .stream()
                .map(item -> new StudentProgressPointResponse(
                        item.getMonth(), item.getPerformance(), item.getConsistency()
                ))
                .toList();
    }
}
