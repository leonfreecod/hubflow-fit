package com.hubflow.fit.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "organization_settings")
public class OrganizationSettings {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String document;
    @Column(nullable = false) private String phone;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private String pixKey;
    @Column(nullable = false) private String city;
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDocument() { return document; } public void setDocument(String document) { this.document = document; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPixKey() { return pixKey; } public void setPixKey(String pixKey) { this.pixKey = pixKey; }
    public String getCity() { return city; } public void setCity(String city) { this.city = city; }
}
