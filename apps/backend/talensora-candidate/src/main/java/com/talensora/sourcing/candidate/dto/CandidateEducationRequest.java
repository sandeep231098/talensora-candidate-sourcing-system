package com.talensora.sourcing.candidate.dto;

import com.talensora.sourcing.candidate.domain.EducationLevel;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CandidateEducationRequest(

        @NotBlank
        @Size(max = 150)
        String degreeQualification,

        @Size(max = 150)
        String specialization,

        @NotBlank
        @Size(max = 200)
        String institutionUniversity,

        @NotNull
        @Min(1900)
        @Max(9999)
        Integer yearOfPassing,

        @Size(max = 50)
        String gradeScore,

        @NotNull
        EducationLevel educationLevel

) {
}