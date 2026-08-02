package com.hubflow.fit.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_plan_id", nullable = false)
    private WorkoutPlan workoutPlan;
    @Column(nullable = false) private int weekNumber;
    @Column(nullable = false) private int dayOrder;
    @Column(nullable = false) private String name;
    @Column(nullable = false, length = 2000) private String instructions;
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<WorkoutExercise> exercises = new ArrayList<>();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkoutPlan getWorkoutPlan() { return workoutPlan; }
    public void setWorkoutPlan(WorkoutPlan workoutPlan) { this.workoutPlan = workoutPlan; }
    public int getWeekNumber() { return weekNumber; }
    public void setWeekNumber(int weekNumber) { this.weekNumber = weekNumber; }
    public int getDayOrder() { return dayOrder; }
    public void setDayOrder(int dayOrder) { this.dayOrder = dayOrder; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public List<WorkoutExercise> getExercises() { return exercises; }
    public void setExercises(List<WorkoutExercise> exercises) { this.exercises = exercises; }
}
