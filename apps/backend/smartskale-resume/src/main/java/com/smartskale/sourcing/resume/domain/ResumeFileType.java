package com.smartskale.sourcing.resume.domain;

public enum ResumeFileType {

    PDF(
            "pdf",
            "application/pdf"
    ),

    DOC(
            "doc",
            "application/msword"
    ),

    DOCX(
            "docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final String extension;

    private final String contentType;

    ResumeFileType(
            String extension,
            String contentType
    ) {
        this.extension = extension;
        this.contentType = contentType;
    }

    public String getExtension() {
        return extension;
    }

    public String getContentType() {
        return contentType;
    }
}