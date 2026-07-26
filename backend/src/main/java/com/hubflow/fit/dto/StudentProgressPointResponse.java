package com.hubflow.fit.dto;

public record StudentProgressPointResponse(
        String month,
        int performance,
        int consistency
) {
}
