package com.hubflow.fit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession session;
    @Column(nullable = false) private int displayOrder;
    @Column(nullable = false) private String name;
    @Column(nullable = false, length = 1000) private String prescription;
    @Column(nullable = false) private int restSeconds;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkoutSession getSession() { return session; }
    public void setSession(WorkoutSession session) { this.session = session; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }
    public int getRestSeconds() { return restSeconds; }
    public void setRestSeconds(int restSeconds) { this.restSeconds = restSeconds; }
}
