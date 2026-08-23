package com.smartskale.sourcing.candidate.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CandidateWorkExperienceResponse(

        UUID id,
        String employerName,
        String jobTitle,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyWorkingHere,
        String keyResponsibilities,
        Instant createdAt,
        Instant updatedAt,
        Long version

) {
}