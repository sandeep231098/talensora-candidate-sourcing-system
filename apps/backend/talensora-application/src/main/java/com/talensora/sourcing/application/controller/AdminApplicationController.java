package com.talensora.sourcing.application.controller;

import com.talensora.sourcing.application.domain.ApplicationStatus;
import com.talensora.sourcing.application.dto.AdminApplicationCsvExport;
import com.talensora.sourcing.application.dto.AdminApplicationDetailResponse;
import com.talensora.sourcing.application.dto.AdminApplicationResponse;
import com.talensora.sourcing.application.dto.UpdateApplicationStatusRequest;
import com.talensora.sourcing.application.service.ApplicationService;
import com.talensora.sourcing.resume.dto.ResumeDownload;

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
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<AdminApplicationResponse> listAll(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            ApplicationStatus status,

            @RequestParam(required = false)
            UUID requisitionId
    ) {

        return applicationService.searchAdmin(
                search,
                status,
                requisitionId
        );
    }

    @GetMapping("/requisitions/{requisitionId}/applications")
    public List<AdminApplicationResponse> listByRequisition(
            @PathVariable UUID requisitionId
    ) {

        return applicationService.listByRequisition(
                requisitionId
        );
    }

    @GetMapping("/requisitions/{requisitionId}/applications/export")
    public ResponseEntity<byte[]> exportApplications(
            @PathVariable
            UUID requisitionId,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            ApplicationStatus status
    ) {

        AdminApplicationCsvExport export =
                applicationService
                        .exportApplicationsCsv(
                                requisitionId,
                                search,
                                status
                        );

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                export.filename(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                "text/csv;charset=UTF-8"
                        )
                )
                .contentLength(
                        export.content().length
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .cacheControl(
                        CacheControl.noStore()
                )
                .body(
                        export.content()
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