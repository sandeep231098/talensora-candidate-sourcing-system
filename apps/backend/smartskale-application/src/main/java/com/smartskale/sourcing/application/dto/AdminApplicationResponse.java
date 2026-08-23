package com.smartskale.sourcing.application.dto;

import com.smartskale.sourcing.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record AdminApplicationResponse(

        UUID id,

        String applicationReference,

        ApplicationStatus status,

        Instant submittedAt,

        UUID candidateId,

        String candidateFirstName,

        String candidateLastName,

        String candidateEmail,

        String candidateLocation,

        Integer totalExperienceMonths,

        UUID requisitionId,

        String requisitionNumber,

        String jobTitle,

        String department,

        String jobLocation,

        UUID resumeId,

        Integer resumeVersion,

        String resumeFilename,

        String resumeFileType,

        Long resumeSizeBytes,

        String coverNote,

        Instant updatedAt

) {
}