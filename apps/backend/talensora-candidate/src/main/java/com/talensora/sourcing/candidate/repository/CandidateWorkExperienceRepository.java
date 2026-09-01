package com.talensora.sourcing.candidate.repository;

import com.talensora.sourcing.candidate.entity.CandidateWorkExperience;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateWorkExperienceRepository
        extends JpaRepository<CandidateWorkExperience, UUID> {

    List<CandidateWorkExperience>
    findAllByCandidateKeycloakSubjectOrderByStartDateDesc(
            String keycloakSubject
    );

    Optional<CandidateWorkExperience>
    findByIdAndCandidateKeycloakSubject(
            UUID id,
            String keycloakSubject
    );
}