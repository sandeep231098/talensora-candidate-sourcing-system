package com.smartskale.sourcing.application.controller;

import com.smartskale.sourcing.application.dto.ApplicationResponse;
import com.smartskale.sourcing.application.dto.SubmitApplicationRequest;
import com.smartskale.sourcing.application.service.ApplicationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidate/applications")
public class CandidateApplicationController {

    private final ApplicationService applicationService;

    public CandidateApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> submit(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubmitApplicationRequest request
    ) {

        ApplicationResponse response =
                applicationService.submit(
                        jwt.getSubject(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public List<ApplicationResponse> listMine(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return applicationService.listMine(
                jwt.getSubject()
        );
    }
}