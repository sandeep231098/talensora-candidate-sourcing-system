package com.talensora.sourcing.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@SpringBootTest(classes = SecurityConfigTest.TestApplication.class)
@AutoConfigureMockMvc
@Import({
        SecurityConfig.class,
        RequestCorrelationFilter.class,
        SecurityConfigTest.TestController.class
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void anonymousProtectedRequestReturnsJsonUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/candidate/test"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.correlationId").isNotEmpty())
                .andExpect(header().exists(RequestCorrelationFilter.HEADER_NAME));
    }

    @Test
    void candidateAccessRejectsWrongAndDualRoles() throws Exception {
        mockMvc.perform(get("/api/v1/candidate/test")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/v1/candidate/test")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_CANDIDATE"),
                                new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void candidateAndAdminRoutesAllowIntendedRoles() throws Exception {
        mockMvc.perform(get("/api/v1/candidate/test")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/test")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/test")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    void unsupportedInternalRoleCannotAccessAdminRoute() throws Exception {
        mockMvc.perform(get("/api/v1/admin/test")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_AUDITOR"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void meEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/me").with(jwt()))
                .andExpect(status().isOk());
    }

    @Test
    void unmatchedApiRouteFailsClosed() throws Exception {
        mockMvc.perform(get("/api/v1/unmatched").with(jwt()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/v1/public/unknown"))
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidCorrelationIdIsReplaced() throws Exception {
        mockMvc.perform(get("/api/v1/public/test")
                        .header(RequestCorrelationFilter.HEADER_NAME, "unsafe value!"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        RequestCorrelationFilter.HEADER_NAME,
                        org.hamcrest.Matchers.matchesPattern("[0-9a-f-]{36}")
                ));

        mockMvc.perform(get("/api/v1/public/test")
                        .header(RequestCorrelationFilter.HEADER_NAME, "a".repeat(65)))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        RequestCorrelationFilter.HEADER_NAME,
                        org.hamcrest.Matchers.matchesPattern("[0-9a-f-]{36}")
                ));
    }

    @Test
    void validCorrelationIdIsPropagated() throws Exception {
        mockMvc.perform(get("/api/v1/public/test")
                        .header(RequestCorrelationFilter.HEADER_NAME, "web-123_test.value"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        RequestCorrelationFilter.HEADER_NAME,
                        "web-123_test.value"
                ));
    }

    @Test
    void correlationFilterCleansMdcAfterRequest() throws Exception {
        RequestCorrelationFilter filter = new RequestCorrelationFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(RequestCorrelationFilter.HEADER_NAME, "mdc-test");

        filter.doFilterInternal(request, new MockHttpServletResponse(),
                new MockFilterChain() {
                    @Override
                    public void doFilter(
                            jakarta.servlet.ServletRequest servletRequest,
                            jakarta.servlet.ServletResponse servletResponse
                    ) {
                        org.assertj.core.api.Assertions.assertThat(MDC.get("correlationId"))
                                .isEqualTo("mdc-test");
                    }
                });

        org.assertj.core.api.Assertions.assertThat(MDC.get("correlationId")).isNull();
    }

    @Test
    void actuatorExposureIsLimitedAndHealthBodyHasNoDetails() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"status\":\"UP\"}"))
                .andExpect(jsonPath("$.components").doesNotExist());

        mockMvc.perform(get("/actuator/env").with(jwt()))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtConverterKeepsOnlySupportedRealmRoles() {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "none"),
                Map.of(
                        "sub", "test-user",
                        "realm_access", Map.of(
                                "roles", List.of("CANDIDATE", "offline_access", "UNKNOWN")
                        )
                )
        );

        Set<String> authorities = new SecurityConfig()
                .jwtAuthenticationConverter()
                .convert(jwt)
                .getAuthorities()
                .stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());

        org.assertj.core.api.Assertions.assertThat(authorities)
                .contains("ROLE_CANDIDATE")
                .doesNotContain("ROLE_offline_access", "ROLE_UNKNOWN");
    }

    @SpringBootApplication
    static class TestApplication {
    }

    @RestController
    static class TestController {
        @GetMapping({
                "/api/v1/candidate/test",
                "/api/v1/admin/test",
                "/api/v1/public/test",
                "/api/v1/me"
        })
        String ok() {
            return "ok";
        }

        @GetMapping("/actuator/health")
        Map<String, String> health() {
            return Map.of("status", "UP");
        }

        @GetMapping("/actuator/env")
        Map<String, String> environment() {
            return Map.of("secret", "must-not-be-exposed");
        }
    }
}
