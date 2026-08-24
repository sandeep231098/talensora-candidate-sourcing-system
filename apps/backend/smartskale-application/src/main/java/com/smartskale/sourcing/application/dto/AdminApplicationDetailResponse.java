package com.smartskale.sourcing.application.dto;

import com.smartskale.sourcing.candidate.dto.CandidateEducationResponse;
import com.smartskale.sourcing.candidate.dto.CandidateProfileResponse;
import com.smartskale.sourcing.candidate.dto.CandidateWorkExperienceResponse;

import java.util.List;

public record AdminApplicationDetailResponse(

        AdminApplicationResponse application,

        CandidateProfileResponse candidateProfile,

        List<CandidateEducationResponse> education,

        List<CandidateWorkExperienceResponse> workExperience

) {
}