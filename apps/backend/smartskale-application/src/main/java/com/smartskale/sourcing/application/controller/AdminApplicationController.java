package com.smartskale.sourcing.application.controller;

import com.smartskale.sourcing.application.dto.AdminApplicationResponse;
import com.smartskale.sourcing.application.dto.UpdateApplicationStatusRequest;
import com.smartskale.sourcing.application.service.ApplicationService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    public AdminApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    @GetMapping("/applications")
    public List<AdminApplicationResponse> listAll() {

        return applicationService.listAllAdmin();
    }

    @GetMapping("/requisitions/{requisitionId}/applications")
    public List<AdminApplicationResponse> listByRequisition(
            @PathVariable UUID requisitionId
    ) {

        return applicationService.listByRequisition(
                requisitionId
        );
    }

    @GetMapping("/applications/{applicationId}")
    public AdminApplicationResponse find(
            @PathVariable UUID applicationId
    ) {

        return applicationService.findAdmin(
                applicationId
        );
    }

    @PatchMapping("/applications/{applicationId}/status")
    public AdminApplicationResponse updateStatus(
            @PathVariable UUID applicationId,
            @Valid
            @RequestBody
            UpdateApplicationStatusRequest request
    ) {

        return applicationService.updateStatus(
                applicationId,
                request
        );
    }
}