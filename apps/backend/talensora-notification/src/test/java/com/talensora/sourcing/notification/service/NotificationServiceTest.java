package com.talensora.sourcing.notification.service;

import com.talensora.sourcing.notification.delivery.EmailSender;
import com.talensora.sourcing.notification.domain.NotificationStatus;
import com.talensora.sourcing.notification.domain.NotificationType;
import com.talensora.sourcing.notification.entity.Notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private static final String DELIVERY_KEY =
            "application-submitted:candidate:test";
    private static final String CORRELATION_ID =
            "APP-TEST";
    private static final String RECIPIENT =
            "candidate@example.com";
    private static final String SUBJECT =
            "Application submitted";
    private static final String BODY =
            "Your application was submitted.";

    private NotificationPersistenceService persistenceService;
    private EmailSender emailSender;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        persistenceService =
                mock(NotificationPersistenceService.class);
        emailSender = mock(EmailSender.class);
        notificationService =
                new NotificationService(
                        persistenceService,
                        emailSender
                );

        when(persistenceService.findByDeliveryKey(DELIVERY_KEY))
                .thenReturn(Optional.empty());
    }

    @Test
    void shouldMarkNotificationSentWhenDeliverySucceeds() {
        Notification pending = pendingNotification();

        when(persistenceService.createPending(
                any(), any(), any(), any(), any(), any()
        )).thenReturn(pending);

        when(persistenceService.markSent(isNull()))
                .thenAnswer(invocation -> {
                    pending.markSent();
                    return pending;
                });

        Notification notification = sendEmail();

        assertEquals(
                NotificationStatus.SENT,
                notification.getStatus()
        );
        assertEquals(1, notification.getAttemptCount());
        assertNull(notification.getLastError());

        verify(emailSender).send(
                RECIPIENT,
                SUBJECT,
                BODY
        );
    }

    @Test
    void shouldMarkNotificationFailedWhenDeliveryFails() {
        Notification pending = pendingNotification();

        when(persistenceService.createPending(
                any(), any(), any(), any(), any(), any()
        )).thenReturn(pending);

        doThrow(new IllegalStateException("SMTP unavailable"))
                .when(emailSender)
                .send(RECIPIENT, SUBJECT, BODY);

        when(persistenceService.markFailed(
                isNull(),
                any()
        )).thenAnswer(invocation -> {
            pending.markFailed(invocation.getArgument(1));
            return pending;
        });

        Notification notification = sendEmail();

        assertEquals(
                NotificationStatus.FAILED,
                notification.getStatus()
        );
        assertEquals(1, notification.getAttemptCount());
        assertEquals(
                "Email delivery failed: IllegalStateException",
                notification.getLastError()
        );
    }

    @Test
    void shouldNotResendDuplicateDeliveryKey() {
        Notification existing = pendingNotification();
        existing.markSent();

        when(persistenceService.findByDeliveryKey(DELIVERY_KEY))
                .thenReturn(Optional.of(existing));

        Notification notification = sendEmail();

        assertEquals(
                NotificationStatus.SENT,
                notification.getStatus()
        );
        verify(emailSender, never())
                .send(any(), any(), any());
        verify(persistenceService, never())
                .createPending(
                        any(), any(), any(), any(), any(), any()
                );
    }

    @Test
    void shouldTreatDeliveryKeyConstraintRaceAsDuplicate() {
        Notification existing = pendingNotification();
        existing.markSent();

        when(persistenceService.findByDeliveryKey(DELIVERY_KEY))
                .thenReturn(
                        Optional.empty(),
                        Optional.of(existing)
                );
        when(persistenceService.createPending(
                any(), any(), any(), any(), any(), any()
        )).thenThrow(
                new DataIntegrityViolationException(
                        "Duplicate delivery key"
                )
        );

        Notification notification = sendEmail();

        assertEquals(
                NotificationStatus.SENT,
                notification.getStatus()
        );
        verify(emailSender, never())
                .send(any(), any(), any());
    }

    private Notification sendEmail() {
        return notificationService.sendEmail(
                NotificationType.CANDIDATE_APPLICATION_SUBMITTED,
                DELIVERY_KEY,
                CORRELATION_ID,
                RECIPIENT,
                SUBJECT,
                BODY
        );
    }

    private Notification pendingNotification() {
        return Notification.createEmail(
                NotificationType.CANDIDATE_APPLICATION_SUBMITTED,
                DELIVERY_KEY,
                CORRELATION_ID,
                RECIPIENT,
                SUBJECT,
                BODY
        );
    }
}
