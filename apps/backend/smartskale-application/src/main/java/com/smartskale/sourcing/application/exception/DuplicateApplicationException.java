package com.smartskale.sourcing.application.exception;

public class DuplicateApplicationException
        extends RuntimeException {

    public DuplicateApplicationException(
            String message
    ) {
        super(message);
    }
}