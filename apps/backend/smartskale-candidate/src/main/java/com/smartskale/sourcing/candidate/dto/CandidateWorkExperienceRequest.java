package com.smartskale.sourcing.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CandidateWorkExperienceRequest(

        @NotBlank
        @Size(max = 200)
        String employerName,

        @NotBlank
        @Size(max = 150)
        String jobTitle,

        @NotNull
        @PastOrPresent
        LocalDate startDate,

        @PastOrPresent
        LocalDate endDate,

        boolean currentlyWorkingHere,

        @Size(max = 1000)
        String keyResponsibilities

) {
}