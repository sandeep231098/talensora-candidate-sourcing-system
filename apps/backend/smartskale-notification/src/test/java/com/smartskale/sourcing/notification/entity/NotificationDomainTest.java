package com.smartskale.sourcing.notification.entity;

import com.smartskale.sourcing.notification.domain.NotificationChannel;
import com.smartskale.sourcing.notification.domain.NotificationStatus;
import com.smartskale.sourcing.notification.domain.NotificationType;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class NotificationDomainTest {

    @Test
    void shouldCreatePendingEmailNotification() {

        Notification notification =
                Notification.createEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        "candidate@example.com",
                        "Application submitted",
                        "Your application has been submitted."
                );

        assertEquals(
                NotificationChannel.EMAIL,
                notification.getChannel()
        );

        assertEquals(
                NotificationStatus.PENDING,
                notification.getStatus()
        );

        assertEquals(
                0,
                notification.getAttemptCount()
        );
    }

    @Test
    void shouldMarkNotificationAsSent() {

        Notification notification =
                Notification.createEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        "candidate@example.com",
                        "Application submitted",
                        "Your application has been submitted."
                );

        notification.markSent();

        assertEquals(
                NotificationStatus.SENT,
                notification.getStatus()
        );

        assertEquals(
                1,
                notification.getAttemptCount()
        );

        assertNull(notification.getLastError());
    }

    @Test
    void shouldMarkNotificationAsFailed() {

        Notification notification =
                Notification.createEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        "candidate@example.com",
                        "Application submitted",
                        "Your application has been submitted."
                );

        notification.markFailed(
                "SMTP connection failed."
        );

        assertEquals(
                NotificationStatus.FAILED,
                notification.getStatus()
        );

        assertEquals(
                1,
                notification.getAttemptCount()
        );

        assertEquals(
                "SMTP connection failed.",
                notification.getLastError()
        );
    }

    @Test
    void shouldRejectBlankRecipientAddress() {

        assertThrows(
                IllegalArgumentException.class,
                () -> Notification.createEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        " ",
                        "Application submitted",
                        "Body"
                )
        );
    }
}