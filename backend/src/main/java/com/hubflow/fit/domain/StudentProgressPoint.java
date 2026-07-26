package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "student_progress_points")
public class StudentProgressPoint {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private Student student;
    @Column(name = "month_label", nullable = false) private String month;
    @Column(nullable = false) private int performance;
    @Column(nullable = false) private int consistency;
    @Column(nullable = false) private int displayOrder;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public int getPerformance() { return performance; }
    public void setPerformance(int performance) { this.performance = performance; }
    public int getConsistency() { return consistency; }
    public void setConsistency(int consistency) { this.consistency = consistency; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
