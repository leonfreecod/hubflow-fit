package com.hubflow.fit.controller;

import com.hubflow.fit.dto.ScheduleEventRequest;
import com.hubflow.fit.dto.ScheduleEventResponse;
import com.hubflow.fit.service.ScheduleEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleEventController {

    private final ScheduleEventService scheduleEventService;

    public ScheduleEventController(ScheduleEventService scheduleEventService) {
        this.scheduleEventService = scheduleEventService;
    }

    @GetMapping
    public List<ScheduleEventResponse> findAll() {
        return scheduleEventService.findAll();
    }

    @GetMapping("/{id}")
    public ScheduleEventResponse findById(@PathVariable String id) {
        return scheduleEventService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleEventResponse create(@Valid @RequestBody ScheduleEventRequest request) {
        return scheduleEventService.create(request);
    }

    @PutMapping("/{id}")
    public ScheduleEventResponse update(
            @PathVariable String id,
            @Valid @RequestBody ScheduleEventRequest request
    ) {
        return scheduleEventService.update(id, request);
    }

    @PatchMapping("/{id}/complete")
    public ScheduleEventResponse complete(@PathVariable String id) {
        return scheduleEventService.complete(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        scheduleEventService.delete(id);
    }
}
