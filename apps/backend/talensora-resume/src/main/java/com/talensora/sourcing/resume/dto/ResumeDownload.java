package com.talensora.sourcing.resume.dto;

public record ResumeDownload(

        String filename,

        String contentType,

        byte[] content

) {
}