package com.talensora.sourcing.candidate.dto;

import com.talensora.sourcing.candidate.domain.Gender;
import com.talensora.sourcing.candidate.domain.NoticePeriod;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CandidateProfileResponse(

        UUID id,
        String firstName,
        String lastName,
        Gender gender,
        String email,
        String mobileNumber,
        LocalDate dateOfBirth,
        String currentLocation,
        String currentCompany,
        NoticePeriod noticePeriod,
        String currentAddress,
        boolean fresher,
        Integer totalExperienceMonths,
        Instant createdAt,
        Instant updatedAt,
        Long version

) {
}