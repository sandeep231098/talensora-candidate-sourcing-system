package com.talensora.sourcing.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class SecurityConfig {

    private static final Set<String> APPLICATION_ROLES = Set.of(
            "CANDIDATE",
            "RECRUITER",
            "ADMIN",
            "HR",
            "HIRING_MANAGER",
            "AUDITOR",
            "ACCOUNTS"
    );

    private static final Set<String> INTERNAL_ROLES = Set.of(
            "RECRUITER",
            "ADMIN",
            "HR",
            "HIRING_MANAGER",
            "AUDITOR",
            "ACCOUNTS"
    );

    @Bean
    FilterRegistrationBean<RequestCorrelationFilter> correlationFilterRegistration(
            RequestCorrelationFilter filter
    ) {
        FilterRegistrationBean<RequestCorrelationFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            RequestCorrelationFilter correlationFilter
    ) throws Exception {

        http

                .csrf(csrf ->
                        csrf.disable()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .requestCache(cache ->
                        cache.disable()
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/api/v1/public/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                "/api/v1/admin/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECRUITER"
                        )

                        .requestMatchers(
                                "/api/v1/candidate/**"
                        )
                        .access((authentication, context) -> {
                            Set<String> roles = authentication.get()
                                    .getAuthorities()
                                    .stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .filter(authority -> authority.startsWith("ROLE_"))
                                    .map(authority -> authority.substring(5))
                                    .collect(java.util.stream.Collectors.toSet());

                            return new AuthorizationDecision(
                                    roles.contains("CANDIDATE")
                                            && roles.stream().noneMatch(INTERNAL_ROLES::contains)
                            );
                        })

                        .requestMatchers(
                                "/api/v1/me"
                        )
                        .authenticated()

                        .requestMatchers(
                                "/api/v1/**"
                        )
                        .denyAll()

                        .anyRequest()
                        .denyAll()
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(SecurityErrorResponseWriter::writeUnauthorized)
                        .accessDeniedHandler(SecurityErrorResponseWriter::writeForbidden)
                )

                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(SecurityErrorResponseWriter::writeUnauthorized)
                        .accessDeniedHandler(SecurityErrorResponseWriter::writeForbidden)
                        .jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                )

                .addFilterBefore(
                        correlationFilter,
                        BearerTokenAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    Converter<Jwt, ? extends AbstractAuthenticationToken>
    jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                this::extractAuthorities
        );

        return converter;
    }

    private Collection<GrantedAuthority> extractAuthorities(
            Jwt jwt
    ) {

        List<GrantedAuthority> authorities =
                new ArrayList<>();

        Map<String, Object> realmAccess =
                jwt.getClaimAsMap(
                        "realm_access"
                );

        if (realmAccess == null) {
            return authorities;
        }

        Object rolesObject =
                realmAccess.get("roles");

        if (rolesObject instanceof Collection<?> roles) {

            for (Object role : roles) {

                if (!(role instanceof String roleName)
                        || !APPLICATION_ROLES.contains(roleName)) {
                    continue;
                }

                authorities.add(
                        new SimpleGrantedAuthority(
                                "ROLE_" + roleName
                        )
                );
            }
        }

        return authorities;
    }
}
