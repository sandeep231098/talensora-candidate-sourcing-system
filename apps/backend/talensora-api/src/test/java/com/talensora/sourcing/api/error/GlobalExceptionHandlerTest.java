package com.talensora.sourcing.api.error;

import com.talensora.sourcing.security.RequestCorrelationFilter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest("GET", "/api/v1/test");
        request.setAttribute(RequestCorrelationFilter.REQUEST_ATTRIBUTE, "test-correlation");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @Test
    void malformedParametersReturnBadRequest() {
        MethodArgumentTypeMismatchException mismatch =
                mock(MethodArgumentTypeMismatchException.class);
        when(mismatch.getName()).thenReturn("id");

        assertThat(handler.handleTypeMismatch(mismatch, request).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(handler.handleMissingParameter(
                new MissingServletRequestParameterException("status", "String"), request
        ).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void beanValidationPreservesFieldErrorsAndCorrelationId() throws Exception {
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult(new Object(), "request");
        binding.addError(new FieldError("request", "email", "Email is invalid."));
        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(null, binding);

        ApiErrorResponse body = handler.handleValidation(exception, request).getBody();

        assertThat(body).isNotNull();
        assertThat(body.fieldErrors()).containsEntry("email", "Email is invalid.");
        assertThat(body.correlationId()).isEqualTo("test-correlation");
    }

    @Test
    void unexpectedErrorsAreSanitized() {
        ApiErrorResponse body = handler.handleUnexpected(
                new IllegalStateException("database password leaked"), request
        ).getBody();

        assertThat(body).isNotNull();
        assertThat(body.status()).isEqualTo(500);
        assertThat(body.message()).isEqualTo("An unexpected server error occurred.");
        assertThat(body.message()).doesNotContain("password");
    }
}
