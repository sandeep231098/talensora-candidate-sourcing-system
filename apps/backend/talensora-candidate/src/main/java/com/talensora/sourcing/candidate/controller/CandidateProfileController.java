package com.talensora.sourcing.candidate.controller;

import com.talensora.sourcing.candidate.dto.CandidateEducationRequest;
import com.talensora.sourcing.candidate.dto.CandidateEducationResponse;
import com.talensora.sourcing.candidate.dto.CandidateProfileRequest;
import com.talensora.sourcing.candidate.dto.CandidateProfileResponse;
import com.talensora.sourcing.candidate.dto.CandidateWorkExperienceRequest;
import com.talensora.sourcing.candidate.dto.CandidateWorkExperienceResponse;
import com.talensora.sourcing.candidate.exception.InvalidCandidateDataException;
import com.talensora.sourcing.candidate.service.CandidateProfileService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate")
public class CandidateProfileController {

    private final CandidateProfileService service;

    public CandidateProfileController(
            CandidateProfileService service
    ) {
        this.service = service;
    }

    @PutMapping("/profile")
    public CandidateProfileResponse saveProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CandidateProfileRequest request
    ) {

        return service.saveProfile(
                jwt.getSubject(),
                extractVerifiedEmail(jwt),
                request
        );
    }

    @GetMapping("/profile")
    public CandidateProfileResponse getProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return service.getProfile(
                jwt.getSubject()
        );
    }

    @PostMapping("/education")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateEducationResponse addEducation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CandidateEducationRequest request
    ) {

        return service.addEducation(
                jwt.getSubject(),
                request
        );
    }

    @GetMapping("/education")
    public List<CandidateEducationResponse> listEducation(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return service.listEducation(
                jwt.getSubject()
        );
    }

    @PutMapping("/education/{educationId}")
    public CandidateEducationResponse updateEducation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID educationId,
            @Valid @RequestBody CandidateEducationRequest request
    ) {

        return service.updateEducation(
                jwt.getSubject(),
                educationId,
                request
        );
    }

    @DeleteMapping("/education/{educationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEducation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID educationId
    ) {

        service.deleteEducation(
                jwt.getSubject(),
                educationId
        );
    }

    @PostMapping("/experience")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateWorkExperienceResponse addExperience(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CandidateWorkExperienceRequest request
    ) {

        return service.addExperience(
                jwt.getSubject(),
                request
        );
    }

    @GetMapping("/experience")
    public List<CandidateWorkExperienceResponse> listExperience(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return service.listExperience(
                jwt.getSubject()
        );
    }

    @PutMapping("/experience/{experienceId}")
    public CandidateWorkExperienceResponse updateExperience(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID experienceId,
            @Valid @RequestBody CandidateWorkExperienceRequest request
    ) {

        return service.updateExperience(
                jwt.getSubject(),
                experienceId,
                request
        );
    }

    @DeleteMapping("/experience/{experienceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExperience(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID experienceId
    ) {

        service.deleteExperience(
                jwt.getSubject(),
                experienceId
        );
    }

    private String extractVerifiedEmail(
            Jwt jwt
    ) {

        String email =
                jwt.getClaimAsString("email");

        Boolean emailVerified =
                jwt.getClaim("email_verified");

        if (email == null || email.isBlank()) {

            throw new InvalidCandidateDataException(
                    "Authenticated Keycloak account does not contain an email."
            );
        }

        if (!Boolean.TRUE.equals(emailVerified)) {

            throw new InvalidCandidateDataException(
                    "Candidate email must be verified."
            );
        }

        return email;
    }
}