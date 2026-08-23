package com.smartskale.sourcing.resume.dto;

public record ResumeDownload(

        String filename,

        String contentType,

        byte[] content

) {
}