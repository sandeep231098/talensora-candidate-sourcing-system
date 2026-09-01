package com.talensora.sourcing.api.error;

import com.talensora.sourcing.resume.exception.InvalidResumeException;
import com.talensora.sourcing.resume.exception.ResumeNotFoundException;
import com.talensora.sourcing.resume.exception.ResumeStorageException;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class ResumeExceptionHandler {

    @ExceptionHandler(InvalidResumeException.class)
    public ResponseEntity<ApiErrorResponse> invalidResume(
            InvalidResumeException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ResumeNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> resumeNotFound(
            ResumeNotFoundException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> uploadTooLarge(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Resume exceeds the maximum allowed upload size.",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ResumeStorageException.class)
    public ResponseEntity<ApiErrorResponse> storageFailure(
            ResumeStorageException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Resume storage operation failed.",
                request.getRequestURI()
        );
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String message,
            String path
    ) {

        ApiErrorResponse response =
                new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        path,
                        Map.of()
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}