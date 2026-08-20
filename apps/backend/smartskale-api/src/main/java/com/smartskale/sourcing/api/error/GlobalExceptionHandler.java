package com.smartskale.sourcing.api.error;

import com.smartskale.sourcing.requisition.exception.InvalidRequisitionStateException;
import com.smartskale.sourcing.requisition.exception.RequisitionNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.dao.OptimisticLockingFailureException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.http.converter.HttpMessageNotReadableException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RequisitionNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RequisitionNotFoundException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidRequisitionStateException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidState(
            InvalidRequisitionStateException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        Map<String, String> fieldErrors =
                new LinkedHashMap<>();

        exception
                .getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        fieldErrors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return build(
                HttpStatus.BAD_REQUEST,
                "Request validation failed.",
                request.getRequestURI(),
                fieldErrors
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.BAD_REQUEST,
                "Request body is invalid or contains unsupported values.",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiErrorResponse> handleOptimisticLock(
            OptimisticLockingFailureException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                "The resource was modified by another request. Refresh and try again.",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred.",
                request.getRequestURI(),
                Map.of()
        );
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {

        ApiErrorResponse response =
                new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        path,
                        fieldErrors
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}