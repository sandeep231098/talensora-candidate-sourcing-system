package com.smartskale.sourcing.notification.service;

import com.smartskale.sourcing.notification.delivery.EmailSender;
import com.smartskale.sourcing.notification.domain.NotificationType;
import com.smartskale.sourcing.notification.entity.Notification;
import com.smartskale.sourcing.notification.repository.NotificationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    NotificationService.class
            );

    private final NotificationRepository notificationRepository;
    private final EmailSender emailSender;

    public NotificationService(
            NotificationRepository notificationRepository,
            EmailSender emailSender
    ) {
        this.notificationRepository = notificationRepository;
        this.emailSender = emailSender;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification sendEmail(
            NotificationType type,
            String recipient,
            String subject,
            String body
    ) {
        Notification notification =
                Notification.createEmail(
                        type,
                        recipient,
                        subject,
                        body
                );

        notificationRepository.save(notification);

        try {

            emailSender.send(
                    recipient,
                    subject,
                    body
            );

            notification.markSent();

        } catch (RuntimeException exception) {

            notification.markFailed(
                    exception.getMessage()
            );

            LOGGER.error(
                    "Email notification delivery failed. recipient={}, type={}",
                    recipient,
                    type,
                    exception
            );
        }

        return notificationRepository
                .saveAndFlush(notification);
    }
}