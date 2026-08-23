package com.smartskale.sourcing.application.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SubmitApplicationRequest(

        @NotNull(
                message = "Requisition ID is required."
        )
        UUID requisitionId,

        @Size(
                max = 2000,
                message = "Cover note must not exceed 2000 characters."
        )
        String coverNote,

        @AssertTrue(
                message = "Data accuracy consent must be accepted."
        )
        boolean dataAccuracyConsent,

        @AssertTrue(
                message = "Privacy consent must be accepted."
        )
        boolean privacyConsent

) {
}