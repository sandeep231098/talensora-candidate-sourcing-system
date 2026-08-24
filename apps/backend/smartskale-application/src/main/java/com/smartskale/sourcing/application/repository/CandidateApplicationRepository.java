package com.smartskale.sourcing.application.repository;

import com.smartskale.sourcing.application.entity.CandidateApplication;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateApplicationRepository
        extends JpaRepository<CandidateApplication, UUID> {

    boolean existsByCandidateIdAndRequisitionId(
            UUID candidateId,
            UUID requisitionId
    );

    List<CandidateApplication>
    findAllByCandidateIdOrderBySubmittedAtDesc(
            UUID candidateId
    );

    Optional<CandidateApplication>
    findByIdAndCandidateId(
            UUID id,
            UUID candidateId
    );

    List<CandidateApplication>
    findAllByRequisitionIdOrderBySubmittedAtDesc(
            UUID requisitionId
    );
}