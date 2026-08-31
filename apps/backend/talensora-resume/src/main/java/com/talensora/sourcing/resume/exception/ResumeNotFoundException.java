package com.talensora.sourcing.resume.exception;

public class ResumeNotFoundException
        extends RuntimeException {

    public ResumeNotFoundException(
            String message
    ) {
        super(message);
    }
}