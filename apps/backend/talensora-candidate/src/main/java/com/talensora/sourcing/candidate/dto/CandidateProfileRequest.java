package com.talensora.sourcing.candidate.dto;

import com.talensora.sourcing.candidate.domain.Gender;
import com.talensora.sourcing.candidate.domain.NoticePeriod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CandidateProfileRequest(

        @NotBlank
        @Size(max = 50)
        String firstName,

        @NotBlank
        @Size(max = 50)
        String lastName,

        Gender gender,

        @NotBlank
        @Pattern(
                regexp = "^\\+[1-9][0-9]{7,14}$",
                message = "Mobile number must include country code"
        )
        String mobileNumber,

        @Past
        LocalDate dateOfBirth,

        @NotBlank
        @Size(max = 150)
        String currentLocation,

        @Size(max = 150)
        String currentCompany,

        NoticePeriod noticePeriod,

        @Size(max = 1000)
        String currentAddress,

        boolean fresher
) {
}