package com.smartskale.sourcing.application.event;

import com.smartskale.sourcing.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationStatusChangedEvent(

        UUID applicationId,

        String applicationReference,

        UUID requisitionId,

        String requisitionNumber,

        String jobTitle,

        UUID candidateId,

        String candidateName,

        String candidateEmail,

        ApplicationStatus previousStatus,

        ApplicationStatus newStatus,

        Instant changedAt

) {
}