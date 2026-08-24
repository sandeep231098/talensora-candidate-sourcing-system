package com.smartskale.sourcing.notification.service;

import com.smartskale.sourcing.notification.delivery.EmailSender;
import com.smartskale.sourcing.notification.domain.NotificationStatus;
import com.smartskale.sourcing.notification.domain.NotificationType;
import com.smartskale.sourcing.notification.entity.Notification;
import com.smartskale.sourcing.notification.repository.NotificationRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private EmailSender emailSender;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {

        notificationRepository =
                mock(NotificationRepository.class);

        emailSender =
                mock(EmailSender.class);

        notificationService =
                new NotificationService(
                        notificationRepository,
                        emailSender
                );

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        when(notificationRepository.saveAndFlush(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );
    }

    @Test
    void shouldMarkNotificationSentWhenDeliverySucceeds() {

        Notification notification =
                notificationService.sendEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        "candidate@example.com",
                        "Application submitted",
                        "Your application was submitted."
                );

        assertEquals(
                NotificationStatus.SENT,
                notification.getStatus()
        );

        assertEquals(
                1,
                notification.getAttemptCount()
        );

        assertNull(notification.getLastError());

        verify(emailSender).send(
                "candidate@example.com",
                "Application submitted",
                "Your application was submitted."
        );
    }

    @Test
    void shouldMarkNotificationFailedWhenDeliveryFails() {

        doThrow(
                new IllegalStateException(
                        "SMTP unavailable"
                )
        ).when(emailSender).send(
                "candidate@example.com",
                "Application submitted",
                "Your application was submitted."
        );

        Notification notification =
                notificationService.sendEmail(
                        NotificationType.APPLICATION_SUBMITTED,
                        "candidate@example.com",
                        "Application submitted",
                        "Your application was submitted."
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
                "SMTP unavailable",
                notification.getLastError()
        );

        ArgumentCaptor<Notification> captor =
                ArgumentCaptor.forClass(
                        Notification.class
                );

        verify(notificationRepository)
                .saveAndFlush(
                        captor.capture()
                );

        assertEquals(
                NotificationStatus.FAILED,
                captor.getValue().getStatus()
        );
    }
}