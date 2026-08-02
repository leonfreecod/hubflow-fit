package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private UserRole role;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private AccountStatus accountStatus;
    private String avatar;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationSettings organization;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_student_id", unique = true)
    private Student linkedStudent;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Student getLinkedStudent() { return linkedStudent; }
    public void setLinkedStudent(Student linkedStudent) { this.linkedStudent = linkedStudent; }
    public OrganizationSettings getOrganization() { return organization; }
    public void setOrganization(OrganizationSettings organization) { this.organization = organization; }
}
