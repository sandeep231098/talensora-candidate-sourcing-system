package com.smartskale.sourcing.application.dto;

import com.smartskale.sourcing.application.domain.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(

        @NotNull(
                message = "Application status is required."
        )
        ApplicationStatus status

) {
}