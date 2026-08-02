package com.hubflow.fit.controller;

import com.hubflow.fit.dto.WorkoutPlanRequest;
import com.hubflow.fit.dto.WorkoutPlanResponse;
import com.hubflow.fit.service.WorkoutPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    public WorkoutPlanController(WorkoutPlanService workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
    }

    @GetMapping
    public List<WorkoutPlanResponse> findAll() {
        return workoutPlanService.findAll();
    }

    @GetMapping("/{id}")
    public WorkoutPlanResponse findById(@PathVariable String id) {
        return workoutPlanService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutPlanResponse create(@Valid @RequestBody WorkoutPlanRequest request) {
        return workoutPlanService.create(request);
    }

    @PutMapping("/{id}")
    public WorkoutPlanResponse update(
            @PathVariable String id,
            @Valid @RequestBody WorkoutPlanRequest request
    ) {
        return workoutPlanService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        workoutPlanService.delete(id);
    }

    @PatchMapping("/{planId}/sessions/{sessionId}/complete")
    public WorkoutPlanResponse completeSession(
            @PathVariable String planId,
            @PathVariable String sessionId
    ) {
        return workoutPlanService.completeSession(planId, sessionId);
    }

    @DeleteMapping("/{planId}/sessions/{sessionId}/complete")
    public WorkoutPlanResponse undoSessionCompletion(
            @PathVariable String planId,
            @PathVariable String sessionId
    ) {
        return workoutPlanService.undoSessionCompletion(planId, sessionId);
    }
}
