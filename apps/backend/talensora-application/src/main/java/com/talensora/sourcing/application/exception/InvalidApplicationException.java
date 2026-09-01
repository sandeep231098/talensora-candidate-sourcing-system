package com.talensora.sourcing.application.exception;

public class InvalidApplicationException
        extends RuntimeException {

    public InvalidApplicationException(
            String message
    ) {
        super(message);
    }
}