package com.talensora.sourcing.application.dto;

import com.talensora.sourcing.application.domain.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(

        @NotNull(
                message = "Application status is required."
        )
        ApplicationStatus status

) {
}