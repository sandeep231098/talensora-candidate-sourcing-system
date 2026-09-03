package com.talensora.sourcing.notification.entity;

import com.talensora.sourcing.notification.domain.NotificationChannel;
import com.talensora.sourcing.notification.domain.NotificationStatus;
import com.talensora.sourcing.notification.domain.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "notifications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_notification_delivery_key",
                        columnNames = "delivery_key"
                )
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;

    @Column(
            name = "delivery_key",
            nullable = false,
            length = 255
    )
    private String deliveryKey;

    @Column(
            name = "correlation_id",
            nullable = false,
            length = 100
    )
    private String correlationId;

    @Column(nullable = false, length = 320)
    private String recipientAddress;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationStatus status;

    @Column(nullable = false)
    private Integer attemptCount;

    @Column(length = 1000)
    private String lastError;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant sentAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    protected Notification() {
    }

    private Notification(
            NotificationType type,
            NotificationChannel channel,
            String deliveryKey,
            String correlationId,
            String recipientAddress,
            String subject,
            String body
    ) {
        this.type = requireType(type);
        this.channel = requireChannel(channel);
        this.deliveryKey = requireText(
                deliveryKey,
                "Notification delivery key is required."
        );
        this.correlationId = requireText(
                correlationId,
                "Notification correlation ID is required."
        );
        this.recipientAddress = requireText(
                recipientAddress,
                "Recipient address is required."
        );
        this.subject = requireText(
                subject,
                "Notification subject is required."
        );
        this.body = requireText(
                body,
                "Notification body is required."
        );

        this.status = NotificationStatus.PENDING;
        this.attemptCount = 0;
    }

    public static Notification createEmail(
            NotificationType type,
            String deliveryKey,
            String correlationId,
            String recipientAddress,
            String subject,
            String body
    ) {
        return new Notification(
                type,
                NotificationChannel.EMAIL,
                deliveryKey,
                correlationId,
                recipientAddress,
                subject,
                body
        );
    }

    public void markSent() {
        this.status = NotificationStatus.SENT;
        this.attemptCount++;
        this.sentAt = Instant.now();
        this.lastError = null;
    }

    public void markFailed(String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.attemptCount++;
        this.lastError = truncate(errorMessage, 1000);
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = NotificationStatus.PENDING;
        }

        if (this.attemptCount == null) {
            this.attemptCount = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    private static NotificationType requireType(
            NotificationType type
    ) {
        if (type == null) {
            throw new IllegalArgumentException(
                    "Notification type is required."
            );
        }

        return type;
    }

    private static NotificationChannel requireChannel(
            NotificationChannel channel
    ) {
        if (channel == null) {
            throw new IllegalArgumentException(
                    "Notification channel is required."
            );
        }

        return channel;
    }

    private static String requireText(
            String value,
            String message
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private static String truncate(
            String value,
            int maximumLength
    ) {
        if (value == null) {
            return null;
        }

        if (value.length() <= maximumLength) {
            return value;
        }

        return value.substring(0, maximumLength);
    }

    public UUID getId() {
        return id;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public String getDeliveryKey() {
        return deliveryKey;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public String getRecipientAddress() {
        return recipientAddress;
    }

    public String getSubject() {
        return subject;
    }

    public String getBody() {
        return body;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public Integer getAttemptCount() {
        return attemptCount;
    }

    public String getLastError() {
        return lastError;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
