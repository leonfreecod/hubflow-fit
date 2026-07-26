package com.hubflow.fit.controller;

import com.hubflow.fit.dto.MonthlyRevenueResponse;
import com.hubflow.fit.dto.StudentProgressPointResponse;
import com.hubflow.fit.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/monthly-revenue")
    public List<MonthlyRevenueResponse> monthlyRevenue() {
        return dashboardService.monthlyRevenue();
    }

    @GetMapping("/student-progress")
    public List<StudentProgressPointResponse> studentProgress() {
        return dashboardService.studentProgress();
    }
}
