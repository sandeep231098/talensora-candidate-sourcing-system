package com.talensora.sourcing.notification.service;

import com.talensora.sourcing.notification.delivery.EmailSender;
import com.talensora.sourcing.notification.domain.NotificationType;
import com.talensora.sourcing.notification.entity.Notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NotificationService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    NotificationService.class
            );

    private final NotificationPersistenceService persistenceService;
    private final EmailSender emailSender;

    public NotificationService(
            NotificationPersistenceService persistenceService,
            EmailSender emailSender
    ) {
        this.persistenceService = persistenceService;
        this.emailSender = emailSender;
    }

    public Notification sendEmail(
            NotificationType type,
            String deliveryKey,
            String correlationId,
            String recipient,
            String subject,
            String body
    ) {
        Optional<Notification> existing =
                persistenceService.findByDeliveryKey(
                        deliveryKey
                );

        if (existing.isPresent()) {
            logDuplicate(existing.get());
            return existing.get();
        }

        Notification pending;

        try {
            pending = persistenceService.createPending(
                    type,
                    deliveryKey,
                    correlationId,
                    recipient,
                    subject,
                    body
            );
        } catch (DataIntegrityViolationException exception) {
            Notification duplicate =
                    persistenceService
                            .findByDeliveryKey(deliveryKey)
                            .orElseThrow(() -> exception);

            logDuplicate(duplicate);
            return duplicate;
        }

        try {
            emailSender.send(
                    recipient,
                    subject,
                    body
            );
        } catch (RuntimeException exception) {
            Notification failed =
                    persistenceService.markFailed(
                            pending.getId(),
                            safeErrorMessage(exception)
                    );

            LOGGER.error(
                    "Notification delivery failed. notificationId={}, correlationId={}, type={}, status={}, attempt={}, errorType={}",
                    failed.getId(),
                    failed.getCorrelationId(),
                    failed.getType(),
                    failed.getStatus(),
                    failed.getAttemptCount(),
                    exception.getClass().getSimpleName()
            );

            return failed;
        }

        Notification sent =
                persistenceService.markSent(
                        pending.getId()
                );

        logDelivery(sent);
        return sent;
    }

    private void logDuplicate(Notification notification) {
        LOGGER.info(
                "Notification delivery skipped as duplicate. notificationId={}, correlationId={}, type={}, status={}, attempt={}",
                notification.getId(),
                notification.getCorrelationId(),
                notification.getType(),
                notification.getStatus(),
                notification.getAttemptCount()
        );
    }

    private void logDelivery(Notification notification) {
        LOGGER.info(
                "Notification delivery completed. notificationId={}, correlationId={}, type={}, status={}, attempt={}",
                notification.getId(),
                notification.getCorrelationId(),
                notification.getType(),
                notification.getStatus(),
                notification.getAttemptCount()
        );
    }

    private String safeErrorMessage(RuntimeException exception) {
        return "Email delivery failed: "
                + exception.getClass().getSimpleName();
    }
}
