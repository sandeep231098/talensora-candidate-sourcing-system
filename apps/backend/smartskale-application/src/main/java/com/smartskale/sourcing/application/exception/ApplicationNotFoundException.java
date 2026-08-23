package com.smartskale.sourcing.application.exception;

public class ApplicationNotFoundException
        extends RuntimeException {

    public ApplicationNotFoundException(
            String message
    ) {
        super(message);
    }
}