package com.talensora.sourcing.application.exception;

public class ApplicationNotFoundException
        extends RuntimeException {

    public ApplicationNotFoundException(
            String message
    ) {
        super(message);
    }
}