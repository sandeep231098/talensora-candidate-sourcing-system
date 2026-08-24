package com.smartskale.sourcing.application.controller;

import com.smartskale.sourcing.application.dto.AdminApplicationDetailResponse;
import com.smartskale.sourcing.application.dto.AdminApplicationResponse;
import com.smartskale.sourcing.application.dto.UpdateApplicationStatusRequest;
import com.smartskale.sourcing.application.service.ApplicationService;
import com.smartskale.sourcing.resume.dto.ResumeDownload;

import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

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
    public AdminApplicationDetailResponse find(
            @PathVariable UUID applicationId
    ) {

        return applicationService.findAdminDetail(
                applicationId
        );
    }

    @GetMapping("/applications/{applicationId}/resume")
    public ResponseEntity<byte[]> downloadResume(
            @PathVariable UUID applicationId
    ) {

        ResumeDownload download =
                applicationService.downloadAdminResume(
                        applicationId
                );

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                download.filename(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                download.contentType()
                        )
                )
                .contentLength(
                        download.content().length
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .cacheControl(
                        CacheControl.noStore()
                )
                .body(
                        download.content()
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