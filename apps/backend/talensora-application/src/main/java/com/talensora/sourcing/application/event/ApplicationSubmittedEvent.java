package com.talensora.sourcing.application.event;

import com.talensora.sourcing.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationSubmittedEvent(

        UUID applicationId,

        String applicationReference,

        UUID requisitionId,

        String requisitionNumber,

        String jobTitle,

        UUID candidateId,

        String candidateName,

        String candidateEmail,

        Instant submittedAt,

        ApplicationStatus status

) {
}