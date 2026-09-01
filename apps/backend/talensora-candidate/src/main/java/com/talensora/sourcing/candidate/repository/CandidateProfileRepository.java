package com.talensora.sourcing.candidate.repository;

import com.talensora.sourcing.candidate.entity.CandidateProfile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileRepository
        extends JpaRepository<CandidateProfile, UUID> {

    Optional<CandidateProfile> findByKeycloakSubject(
            String keycloakSubject
    );

    Optional<CandidateProfile> findByEmailIgnoreCase(
            String email
    );
}