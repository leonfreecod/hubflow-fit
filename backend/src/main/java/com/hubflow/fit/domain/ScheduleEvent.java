package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import java.time.Instant;

@Entity
@Table(name = "schedule_events")
public class ScheduleEvent {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private LocalDate date;
    @Column(nullable = false) private LocalTime time;
    @Column(nullable = false) private int durationMinutes;
    @Column(nullable = false) private String location;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ScheduleStatus status;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ScheduleType type;
    @Column(name = "recurrence_group_id") private UUID recurrenceGroupId;
    @Column(name = "external_event_id") private String externalEventId;
    @Column(name = "reminder_sent_at") private Instant reminderSentAt;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public Student getStudent() { return student; } public void setStudent(Student student) { this.student = student; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; } public void setTime(LocalTime time) { this.time = time; }
    public int getDurationMinutes() { return durationMinutes; } public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getLocation() { return location; } public void setLocation(String location) { this.location = location; }
    public ScheduleStatus getStatus() { return status; } public void setStatus(ScheduleStatus status) { this.status = status; }
    public ScheduleType getType() { return type; } public void setType(ScheduleType type) { this.type = type; }
    public UUID getRecurrenceGroupId() { return recurrenceGroupId; } public void setRecurrenceGroupId(UUID recurrenceGroupId) { this.recurrenceGroupId = recurrenceGroupId; }
    public String getExternalEventId() { return externalEventId; } public void setExternalEventId(String externalEventId) { this.externalEventId = externalEventId; }
    public Instant getReminderSentAt() { return reminderSentAt; } public void setReminderSentAt(Instant reminderSentAt) { this.reminderSentAt = reminderSentAt; }
}
