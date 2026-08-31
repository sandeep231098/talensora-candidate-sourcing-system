package com.talensora.sourcing.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
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
                        .hasRole("CANDIDATE")

                        .requestMatchers(
                                "/api/v1/**"
                        )
                        .authenticated()

                        .anyRequest()
                        .denyAll()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
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

                authorities.add(
                        new SimpleGrantedAuthority(
                                "ROLE_" + role
                        )
                );
            }
        }

        return authorities;
    }
}