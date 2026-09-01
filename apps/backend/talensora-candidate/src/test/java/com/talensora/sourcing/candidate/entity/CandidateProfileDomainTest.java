package com.talensora.sourcing.candidate.entity;

import com.talensora.sourcing.candidate.domain.Gender;
import com.talensora.sourcing.candidate.domain.NoticePeriod;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CandidateProfileDomainTest {

    @Test
    void fresherShouldStartWithZeroExperience() {

        CandidateProfile profile =
                CandidateProfile.create(
                        "subject-1",
                        "Test",
                        "Candidate",
                        Gender.PREFER_NOT_TO_SAY,
                        "candidate1@example.com",
                        "+919876543210",
                        LocalDate.of(2000, 1, 1),
                        "Indore",
                        null,
                        NoticePeriod.IMMEDIATE,
                        "Test Address",
                        true
                );

        assertTrue(profile.isFresher());

        assertEquals(
                0,
                profile.getTotalExperienceMonths()
        );
    }

    @Test
    void currentEmploymentShouldRemoveEndDate() {

        CandidateProfile profile =
                CandidateProfile.create(
                        "subject-2",
                        "Test",
                        "Candidate",
                        null,
                        "candidate2@example.com",
                        "+919876543211",
                        null,
                        "Bengaluru",
                        "Talensora",
                        NoticePeriod.DAYS_30,
                        null,
                        false
                );

        CandidateWorkExperience experience =
                CandidateWorkExperience.create(
                        profile,
                        "Talensora",
                        "Backend Developer",
                        LocalDate.of(2024, 1, 1),
                        LocalDate.of(2025, 1, 1),
                        true,
                        "Backend development"
                );

        assertTrue(
                experience.isCurrentlyWorkingHere()
        );

        assertNull(
                experience.getEndDate()
        );
    }

    @Test
    void endDateBeforeStartDateShouldFail() {

        CandidateProfile profile =
                CandidateProfile.create(
                        "subject-3",
                        "Test",
                        "Candidate",
                        null,
                        "candidate3@example.com",
                        "+919876543212",
                        null,
                        "Pune",
                        "Example Company",
                        NoticePeriod.DAYS_30,
                        null,
                        false
                );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        CandidateWorkExperience.create(
                                profile,
                                "Example Company",
                                "Developer",
                                LocalDate.of(2025, 6, 1),
                                LocalDate.of(2024, 6, 1),
                                false,
                                null
                        )
        );
    }
}