package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id") private Student student;
    @Column(nullable = false) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private LocalDate dueDate;
    private LocalDate paidAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentStatus status;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentMethod method;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public Student getStudent() { return student; } public void setStudent(Student student) { this.student = student; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDueDate() { return dueDate; } public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getPaidAt() { return paidAt; } public void setPaidAt(LocalDate paidAt) { this.paidAt = paidAt; }
    public PaymentStatus getStatus() { return status; } public void setStatus(PaymentStatus status) { this.status = status; }
    public PaymentMethod getMethod() { return method; } public void setMethod(PaymentMethod method) { this.method = method; }
}
