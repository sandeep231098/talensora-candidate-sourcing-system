package com.smartskale.sourcing.requisition.dto;

import com.smartskale.sourcing.requisition.domain.EmploymentType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RequisitionRequest(

        @NotBlank
        @Size(max = 100)
        String jobTitle,

        @NotBlank
        @Size(max = 100)
        String department,

        @NotBlank
        @Size(max = 150)
        String location,

        @NotNull
        EmploymentType employmentType,

        @NotBlank
        @Size(max = 50)
        String experienceRange,

        @NotNull
        @Positive
        Integer numberOfOpenings,

        @NotBlank
        @Size(max = 150)
        String hiringManager,

        @NotBlank
        String jobDescription,

        @DecimalMin(value = "0.0", inclusive = true)
        BigDecimal maximumSalaryBudget,

        LocalDate hiringCompletedBy
) {
}