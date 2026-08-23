package com.smartskale.sourcing.candidate.dto;

import com.smartskale.sourcing.candidate.domain.EducationLevel;

import java.time.Instant;
import java.util.UUID;

public record CandidateEducationResponse(

        UUID id,
        String degreeQualification,
        String specialization,
        String institutionUniversity,
        Integer yearOfPassing,
        String gradeScore,
        EducationLevel educationLevel,
        Instant createdAt,
        Instant updatedAt,
        Long version

) {
}