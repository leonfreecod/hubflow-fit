package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "students")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationSettings organization;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private StudentStatus status;
    @Column(nullable = false) private String plan;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal monthlyFee;
    @Column(nullable = false) private LocalDate joinedAt;
    @Column(nullable = false) private LocalDate nextBillingDate;
    @Column(nullable = false, length = 1000) private String goal;
    @Column(nullable = false) private String coach;
    @Column(nullable = false, length = 4) private String initials;
    @Column(nullable = false) private int progress;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public OrganizationSettings getOrganization() { return organization; }
    public void setOrganization(OrganizationSettings organization) { this.organization = organization; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public StudentStatus getStatus() { return status; }
    public void setStatus(StudentStatus status) { this.status = status; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public BigDecimal getMonthlyFee() { return monthlyFee; }
    public void setMonthlyFee(BigDecimal monthlyFee) { this.monthlyFee = monthlyFee; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDate joinedAt) { this.joinedAt = joinedAt; }
    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getCoach() { return coach; }
    public void setCoach(String coach) { this.coach = coach; }
    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
}
