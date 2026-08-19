package com.smartskale.sourcing.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "platform_users")
public class PlatformUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "keycloak_subject",
            nullable = false,
            unique = true,
            length = 100
    )
    private String keycloakSubject;

    @Column(
            name = "email",
            nullable = false,
            unique = true,
            length = 254
    )
    private String email;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    protected PlatformUser() {
    }

    public PlatformUser(
            String keycloakSubject,
            String email
    ) {
        this.keycloakSubject = keycloakSubject;
        this.email = email;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getKeycloakSubject() {
        return keycloakSubject;
    }

    public String getEmail() {
        return email;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}