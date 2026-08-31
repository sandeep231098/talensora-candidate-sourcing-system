package com.talensora.sourcing.requisition.dto;

import com.talensora.sourcing.requisition.domain.EmploymentType;
import com.talensora.sourcing.requisition.domain.RequisitionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RequisitionResponse(

        UUID id,

        String requisitionId,

        String jobTitle,

        String department,

        String location,

        EmploymentType employmentType,

        String experienceRange,

        Integer numberOfOpenings,

        String hiringManager,

        String jobDescription,

        BigDecimal maximumSalaryBudget,

        LocalDate hiringCompletedBy,

        RequisitionStatus status,

        Instant postedAt,

        Instant createdAt,

        Instant updatedAt,

        Long version
) {
}