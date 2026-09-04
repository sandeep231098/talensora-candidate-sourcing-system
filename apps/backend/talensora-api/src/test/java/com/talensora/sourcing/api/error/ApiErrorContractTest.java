package com.talensora.sourcing.api.error;

import com.talensora.sourcing.application.controller.AdminApplicationController;
import com.talensora.sourcing.application.exception.DuplicateApplicationException;
import com.talensora.sourcing.application.service.ApplicationService;
import com.talensora.sourcing.requisition.controller.PublicJobController;
import com.talensora.sourcing.requisition.service.PublicJobDiscoveryService;
import com.talensora.sourcing.security.RequestCorrelationFilter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
class ApiErrorContractTest {

    private MockMvc mockMvc;
    private ApplicationService applicationService;
    private PublicJobDiscoveryService publicJobService;

    @BeforeEach
    void setUp() {
        applicationService = mock(ApplicationService.class);
        publicJobService = mock(PublicJobDiscoveryService.class);

        mockMvc = MockMvcBuilders.standaloneSetup(
                        new AdminApplicationController(applicationService),
                        new PublicJobController(publicJobService),
                        new ExistingMultipartBindingController()
                )
                .setControllerAdvice(
                        new ApplicationExceptionHandler(),
                        new ResumeExceptionHandler(),
                        new GlobalExceptionHandler()
                )
                .addFilters(new RequestCorrelationFilter())
                .build();
    }

    @Test
    void malformedUuidAndEnumReturnStructuredBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/public/jobs/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.correlationId").isNotEmpty());

        mockMvc.perform(get("/api/v1/public/jobs")
                        .queryParam("employmentType", "UNSUPPORTED"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void missingMultipartFileReturnsStructuredBadRequest() throws Exception {
        mockMvc.perform(multipart("/api/v1/candidate/resume"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("file")
                ));
    }

    @Test
    void beanValidationReturnsFieldErrors() throws Exception {
        mockMvc.perform(patch(
                        "/api/v1/admin/applications/{applicationId}/status",
                        UUID.randomUUID()
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.status")
                        .value("Application status is required."));
    }

    @Test
    void duplicateApplicationExceptionReturnsConflict() throws Exception {
        when(applicationService.updateStatus(any(), any()))
                .thenThrow(new DuplicateApplicationException(
                        "You have already applied to this requisition."
                ));

        mockMvc.perform(patch(
                        "/api/v1/admin/applications/{applicationId}/status",
                        UUID.randomUUID()
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"NEW\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("You have already applied to this requisition."));
    }

    @Test
    void unexpectedFailureReturnsSanitizedResponse() throws Exception {
        when(publicJobService.searchPublished(
                any(), any(), any(), any(), any()
        )).thenThrow(new IllegalStateException(
                "SQL select failed for internal.secret_table"
        ));

        mockMvc.perform(get("/api/v1/public/jobs"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message")
                        .value("An unexpected server error occurred."))
                .andExpect(jsonPath("$.trace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist())
                .andExpect(content().string(
                        org.hamcrest.Matchers.not(
                                org.hamcrest.Matchers.containsString("secret_table")
                        )
                ))
                .andExpect(content().string(
                        org.hamcrest.Matchers.not(
                                org.hamcrest.Matchers.containsString("IllegalStateException")
                        )
                ))
                .andExpect(header().exists(RequestCorrelationFilter.HEADER_NAME));
    }

    @RestController
    @RequestMapping("/api/v1/candidate/resume")
    private static final class ExistingMultipartBindingController {

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        void upload(@RequestParam("file") MultipartFile file) {
            // The missing-part request is rejected by Spring before this method runs.
        }
    }
}
