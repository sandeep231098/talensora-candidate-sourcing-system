package com.smartskale.sourcing.candidate.repository;

import com.smartskale.sourcing.candidate.entity.CandidateEducation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateEducationRepository
        extends JpaRepository<CandidateEducation, UUID> {

    List<CandidateEducation>
    findAllByCandidateKeycloakSubjectOrderByYearOfPassingDesc(
            String keycloakSubject
    );

    Optional<CandidateEducation>
    findByIdAndCandidateKeycloakSubject(
            UUID id,
            String keycloakSubject
    );
}