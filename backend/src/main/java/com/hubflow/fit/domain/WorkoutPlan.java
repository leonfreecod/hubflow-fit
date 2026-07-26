package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "workout_plans")
public class WorkoutPlan {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String objective;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private WorkoutLevel level;
    @Column(nullable = false) private int weeks;
    @Column(nullable = false) private int sessionsPerWeek;
    @ManyToMany
    @JoinTable(name = "workout_plan_students", joinColumns = @JoinColumn(name = "workout_plan_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    private Set<Student> assignedStudents = new LinkedHashSet<>();
    @Column(nullable = false) private LocalDate updatedAt;
    @Column(nullable = false, length = 2000) private String description;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getObjective() { return objective; } public void setObjective(String objective) { this.objective = objective; }
    public WorkoutLevel getLevel() { return level; } public void setLevel(WorkoutLevel level) { this.level = level; }
    public int getWeeks() { return weeks; } public void setWeeks(int weeks) { this.weeks = weeks; }
    public int getSessionsPerWeek() { return sessionsPerWeek; } public void setSessionsPerWeek(int sessionsPerWeek) { this.sessionsPerWeek = sessionsPerWeek; }
    public Set<Student> getAssignedStudents() { return assignedStudents; } public void setAssignedStudents(Set<Student> assignedStudents) { this.assignedStudents = assignedStudents; }
    public LocalDate getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
}
