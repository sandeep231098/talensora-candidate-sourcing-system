package com.talensora.sourcing.resume.controller;

import com.talensora.sourcing.resume.dto.ResumeDownload;
import com.talensora.sourcing.resume.dto.ResumeResponse;

import com.talensora.sourcing.resume.service.ResumeService;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidate/resume")
public class ResumeController {

    private final ResumeService service;

    public ResumeController(
            ResumeService service
    ) {
        this.service = service;
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeResponse upload(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file")
            MultipartFile file
    ) {

        return service.upload(
                jwt.getSubject(),
                file
        );
    }

    @GetMapping
    public ResumeResponse getCurrent(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return service.getCurrent(
                jwt.getSubject()
        );
    }

    @GetMapping("/history")
    public List<ResumeResponse> history(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return service.getHistory(
                jwt.getSubject()
        );
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> download(
            @AuthenticationPrincipal Jwt jwt
    ) {

        ResumeDownload download =
                service.downloadCurrent(
                        jwt.getSubject()
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

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal Jwt jwt
    ) {

        service.deleteCurrent(
                jwt.getSubject()
        );
    }
}