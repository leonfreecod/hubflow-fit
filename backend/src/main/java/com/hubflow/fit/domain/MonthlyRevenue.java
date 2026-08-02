package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "monthly_revenues")
public class MonthlyRevenue {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationSettings organization;
    @Column(name = "month_label", nullable = false) private String month;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal revenue;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal expenses;
    @Column(nullable = false) private int displayOrder;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public OrganizationSettings getOrganization() { return organization; }
    public void setOrganization(OrganizationSettings organization) { this.organization = organization; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getExpenses() { return expenses; }
    public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
