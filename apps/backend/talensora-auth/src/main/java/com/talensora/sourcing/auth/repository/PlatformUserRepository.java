package com.talensora.sourcing.auth.repository;

import com.talensora.sourcing.auth.entity.PlatformUser;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PlatformUserRepository
        extends JpaRepository<PlatformUser, UUID> {

    Optional<PlatformUser> findByKeycloakSubject(
            String keycloakSubject
    );

    Optional<PlatformUser> findByEmail(
            String email
    );
}