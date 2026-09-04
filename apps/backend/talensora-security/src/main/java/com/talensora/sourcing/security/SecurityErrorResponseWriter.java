package com.talensora.sourcing.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Instant;

final class SecurityErrorResponseWriter {

    private SecurityErrorResponseWriter() {
    }

    static void writeUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            Exception exception
    ) throws IOException {
        write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized", "Authentication is required to access this resource.");
    }

    static void writeForbidden(
            HttpServletRequest request,
            HttpServletResponse response,
            Exception exception
    ) throws IOException {
        write(request, response, HttpServletResponse.SC_FORBIDDEN,
                "Forbidden", "You do not have permission to access this resource.");
    }

    private static void write(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String error,
            String message
    ) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"timestamp\":\"" + Instant.now()
                + "\",\"status\":" + status
                + ",\"error\":\"" + error
                + "\",\"message\":\"" + message
                + "\",\"path\":\"" + escapeJson(request.getRequestURI())
                + "\",\"fieldErrors\":{},\"correlationId\":\""
                + escapeJson(RequestCorrelationFilter.getCorrelationId(request)) + "\"}");
    }

    private static String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
