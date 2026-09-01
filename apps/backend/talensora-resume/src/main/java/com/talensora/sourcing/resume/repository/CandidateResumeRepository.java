package com.talensora.sourcing.resume.repository;

import com.talensora.sourcing.resume.entity.CandidateResume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateResumeRepository
        extends JpaRepository<CandidateResume, UUID> {

    Optional<CandidateResume>
    findFirstByCandidateKeycloakSubjectAndActiveTrue(
            String keycloakSubject
    );

    List<CandidateResume>
    findAllByCandidateKeycloakSubjectOrderByResumeVersionDesc(
            String keycloakSubject
    );

    @Query("""
            select coalesce(max(r.resumeVersion), 0)
            from CandidateResume r
            where r.candidate.id = :candidateId
            """)
    Integer findMaximumVersion(
            @Param("candidateId")
            UUID candidateId
    );
}