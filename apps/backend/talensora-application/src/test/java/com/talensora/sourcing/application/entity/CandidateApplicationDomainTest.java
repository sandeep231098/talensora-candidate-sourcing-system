package com.talensora.sourcing.application.entity;

import com.talensora.sourcing.application.domain.ApplicationStatus;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CandidateApplicationDomainTest {

    @Test
    void newApplicationShouldStartWithNewStatus() {

        CandidateApplication application =
                CandidateApplication.create(
                        UUID.randomUUID(),
                        UUID.randomUUID(),
                        UUID.randomUUID(),
                        1,
                        "Interested in this opportunity.",
                        true,
                        true
                );

        assertEquals(
                ApplicationStatus.NEW,
                application.getStatus()
        );

        assertTrue(
                application.getApplicationReference()
                        .startsWith("APP-")
        );
    }

    @Test
    void submissionShouldRequireDataAccuracyConsent() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        CandidateApplication.create(
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                1,
                                null,
                                false,
                                true
                        )
        );
    }

    @Test
    void submissionShouldRequirePrivacyConsent() {

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        CandidateApplication.create(
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                1,
                                null,
                                true,
                                false
                        )
        );
    }
}