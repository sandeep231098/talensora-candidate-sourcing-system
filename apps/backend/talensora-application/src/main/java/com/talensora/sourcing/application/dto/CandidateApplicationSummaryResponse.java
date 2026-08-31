package com.talensora.sourcing.application.dto;

import com.talensora.sourcing.application.domain.ApplicationStatus;
import com.talensora.sourcing.requisition.domain.EmploymentType;
import com.talensora.sourcing.requisition.domain.RequisitionStatus;

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