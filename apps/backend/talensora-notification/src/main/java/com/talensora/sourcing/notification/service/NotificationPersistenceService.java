package com.talensora.sourcing.notification.service;

import com.talensora.sourcing.notification.domain.NotificationType;
import com.talensora.sourcing.notification.entity.Notification;
import com.talensora.sourcing.notification.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationPersistenceService {

    private final NotificationRepository notificationRepository;

    public NotificationPersistenceService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createPending(
            NotificationType type,
            String deliveryKey,
            String correlationId,
            String recipient,
            String subject,
            String body
    ) {
        Notification notification =
                Notification.createEmail(
                        type,
                        deliveryKey,
                        correlationId,
                        recipient,
                        subject,
                        body
                );

        return notificationRepository.saveAndFlush(notification);
    }

    @Transactional(
            propagation = Propagation.REQUIRES_NEW,
            readOnly = true
    )
    public Optional<Notification> findByDeliveryKey(
            String deliveryKey
    ) {
        return notificationRepository.findByDeliveryKey(deliveryKey);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification markSent(UUID notificationId) {
        Notification notification = getRequired(notificationId);
        notification.markSent();
        return notificationRepository.saveAndFlush(notification);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification markFailed(
            UUID notificationId,
            String errorMessage
    ) {
        Notification notification = getRequired(notificationId);
        notification.markFailed(errorMessage);
        return notificationRepository.saveAndFlush(notification);
    }

    private Notification getRequired(UUID notificationId) {
        return notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Notification not found: "
                                        + notificationId
                        )
                );
    }
}
