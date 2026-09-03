package com.talensora.sourcing.notification.listener;

import com.talensora.sourcing.application.domain.ApplicationStatus;
import com.talensora.sourcing.application.event.ApplicationStatusChangedEvent;
import com.talensora.sourcing.application.event.ApplicationSubmittedEvent;
import com.talensora.sourcing.notification.domain.NotificationType;
import com.talensora.sourcing.notification.service.NotificationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ApplicationNotificationListenerTest {

    private static final UUID APPLICATION_ID =
            UUID.fromString(
                    "00000000-0000-0000-0000-000000000101"
            );
    private static final String APPLICATION_REFERENCE =
            "APP-2026-TEST";
    private static final String CANDIDATE_EMAIL =
            "candidate@example.com";
    private static final String ADMIN_EMAIL =
            "admin@example.com";

    private NotificationService notificationService;
    private ApplicationNotificationListener listener;

    @BeforeEach
    void setUp() {
        notificationService = mock(NotificationService.class);
        listener = new ApplicationNotificationListener(
                notificationService,
                ADMIN_EMAIL
        );
    }

    @Test
    void shouldSendCandidateAndAdminSubmissionNotifications() {
        listener.handleApplicationSubmitted(submittedEvent());

        verify(notificationService).sendEmail(
                eq(NotificationType.CANDIDATE_APPLICATION_SUBMITTED),
                eq("application-submitted:candidate:" + APPLICATION_ID),
                eq(APPLICATION_REFERENCE),
                eq(CANDIDATE_EMAIL),
                anyString(),
                anyString()
        );
        verify(notificationService).sendEmail(
                eq(NotificationType.ADMIN_APPLICATION_SUBMITTED),
                eq("application-submitted:admin:" + APPLICATION_ID),
                eq(APPLICATION_REFERENCE),
                eq(ADMIN_EMAIL),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldNotSuppressAdminNotificationWhenCandidateDeliveryFails() {
        doThrow(new IllegalStateException("Persistence unavailable"))
                .when(notificationService)
                .sendEmail(
                        eq(NotificationType.CANDIDATE_APPLICATION_SUBMITTED),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString()
                );

        listener.handleApplicationSubmitted(submittedEvent());

        verify(notificationService).sendEmail(
                eq(NotificationType.ADMIN_APPLICATION_SUBMITTED),
                eq("application-submitted:admin:" + APPLICATION_ID),
                eq(APPLICATION_REFERENCE),
                eq(ADMIN_EMAIL),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldSendCandidateStatusChangeNotification() {
        listener.handleApplicationStatusChanged(
                statusChangedEvent()
        );

        verify(notificationService).sendEmail(
                eq(NotificationType.CANDIDATE_APPLICATION_STATUS_CHANGED),
                eq("application-status:shortlisted:candidate:"
                        + APPLICATION_ID),
                eq(APPLICATION_REFERENCE),
                eq(CANDIDATE_EMAIL),
                anyString(),
                anyString()
        );
    }

    private ApplicationSubmittedEvent submittedEvent() {
        return new ApplicationSubmittedEvent(
                APPLICATION_ID,
                APPLICATION_REFERENCE,
                UUID.fromString(
                        "00000000-0000-0000-0000-000000000201"
                ),
                "REQ-TEST",
                "Software Engineer",
                UUID.fromString(
                        "00000000-0000-0000-0000-000000000301"
                ),
                "Candidate Name",
                CANDIDATE_EMAIL,
                Instant.parse("2026-09-03T00:00:00Z"),
                ApplicationStatus.NEW
        );
    }

    private ApplicationStatusChangedEvent statusChangedEvent() {
        return new ApplicationStatusChangedEvent(
                APPLICATION_ID,
                APPLICATION_REFERENCE,
                UUID.fromString(
                        "00000000-0000-0000-0000-000000000201"
                ),
                "REQ-TEST",
                "Software Engineer",
                UUID.fromString(
                        "00000000-0000-0000-0000-000000000301"
                ),
                "Candidate Name",
                CANDIDATE_EMAIL,
                ApplicationStatus.NEW,
                ApplicationStatus.SHORTLISTED,
                Instant.parse("2026-09-03T01:00:00Z")
        );
    }
}
