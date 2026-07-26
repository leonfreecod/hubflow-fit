package com.hubflow.fit.dto;

import java.math.BigDecimal;

public record MonthlyRevenueResponse(
        String month,
        BigDecimal revenue,
        BigDecimal expenses
) {
}
