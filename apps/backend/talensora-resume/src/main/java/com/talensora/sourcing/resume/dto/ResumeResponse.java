package com.talensora.sourcing.resume.dto;

import com.talensora.sourcing.resume.domain.ResumeFileType;

import java.time.Instant;
import java.util.UUID;

public record ResumeResponse(

        UUID id,

        Integer resumeVersion,

        String originalFilename,

        ResumeFileType fileType,

        String contentType,

        Long sizeBytes,

        boolean active,

        Instant uploadedAt

) {
}