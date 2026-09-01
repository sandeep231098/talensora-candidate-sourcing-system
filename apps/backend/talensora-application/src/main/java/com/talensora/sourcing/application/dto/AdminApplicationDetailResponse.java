package com.talensora.sourcing.application.dto;

import com.talensora.sourcing.candidate.dto.CandidateEducationResponse;
import com.talensora.sourcing.candidate.dto.CandidateProfileResponse;
import com.talensora.sourcing.candidate.dto.CandidateWorkExperienceResponse;

import java.util.List;

public record AdminApplicationDetailResponse(

        AdminApplicationResponse application,

        CandidateProfileResponse candidateProfile,

        List<CandidateEducationResponse> education,

        List<CandidateWorkExperienceResponse> workExperience

) {
}