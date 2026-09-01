package com.talensora.sourcing.application.dto;

import com.talensora.sourcing.application.domain.ApplicationStatus;

import java.time.Instant;

import java.util.UUID;

public record ApplicationResponse(

        UUID id,

        String applicationReference,

        UUID requisitionId,

        UUID resumeId,

        Integer resumeVersion,

        ApplicationStatus status,

        String coverNote,

        Instant submittedAt,

        Instant updatedAt

) {
}