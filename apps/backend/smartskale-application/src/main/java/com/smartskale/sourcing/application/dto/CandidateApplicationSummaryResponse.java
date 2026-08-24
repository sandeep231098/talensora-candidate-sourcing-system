package com.smartskale.sourcing.application.dto;

import com.smartskale.sourcing.application.domain.ApplicationStatus;
import com.smartskale.sourcing.requisition.domain.EmploymentType;
import com.smartskale.sourcing.requisition.domain.RequisitionStatus;

import java.time.Instant;
import java.util.UUID;

public record CandidateApplicationSummaryResponse(

        UUID applicationId,

        String applicationReference,

        ApplicationStatus status,

        Instant submittedAt,

        UUID requisitionId,

        String requisitionNumber,

        String jobTitle,

        String department,

        String location,

        EmploymentType employmentType,

        String experienceRange,

        RequisitionStatus requisitionStatus,

        Integer resumeVersion

) {
}