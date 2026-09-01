package com.talensora.sourcing.application.repository;

import com.talensora.sourcing.application.domain.ApplicationStatus;
import com.talensora.sourcing.application.entity.CandidateApplication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            SELECT application
            FROM CandidateApplication application
            WHERE (
                :search = ''
                OR LOWER(application.applicationReference)
                    LIKE CONCAT('%', LOWER(:search), '%')
                OR EXISTS (
                    SELECT candidate.id
                    FROM CandidateProfile candidate
                    WHERE candidate.id = application.candidateId
                      AND (
                          LOWER(candidate.firstName)
                              LIKE CONCAT('%', LOWER(:search), '%')
                          OR LOWER(candidate.lastName)
                              LIKE CONCAT('%', LOWER(:search), '%')
                          OR LOWER(candidate.email)
                              LIKE CONCAT('%', LOWER(:search), '%')
                          OR LOWER(
                              CONCAT(
                                  CONCAT(candidate.firstName, ' '),
                                  candidate.lastName
                              )
                          )
                              LIKE CONCAT('%', LOWER(:search), '%')
                      )
                )
            )
            AND (
                :status IS NULL
                OR application.status = :status
            )
            AND (
                :requisitionId IS NULL
                OR application.requisitionId = :requisitionId
            )
            ORDER BY application.submittedAt DESC
            """)
    List<CandidateApplication> searchAdminApplications(
            @Param("search")
            String search,

            @Param("status")
            ApplicationStatus status,

            @Param("requisitionId")
            UUID requisitionId
    );
}