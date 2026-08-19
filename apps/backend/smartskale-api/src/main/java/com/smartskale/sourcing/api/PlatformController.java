package com.smartskale.sourcing.api;

import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class PlatformController {

    @GetMapping("/public/ping")
    public Map<String, String> publicPing() {

        return Map.of(
                "application",
                "SmartSkale Candidate Sourcing System",

                "status",
                "UP"
        );
    }


    @GetMapping("/me")
    public Map<String, Object> currentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {

        return Map.of(
                "subject",
                jwt.getSubject(),

                "username",
                String.valueOf(
                        jwt.getClaim("preferred_username")
                ),

                "email",
                String.valueOf(
                        jwt.getClaim("email")
                )
        );
    }
}