ALTER TABLE notifications
    ADD COLUMN delivery_key VARCHAR(255),
    ADD COLUMN correlation_id VARCHAR(100);

UPDATE notifications
SET delivery_key = 'legacy:' || id::text,
    correlation_id = 'legacy:' || id::text
WHERE delivery_key IS NULL
   OR correlation_id IS NULL;

ALTER TABLE notifications
    ALTER COLUMN delivery_key SET NOT NULL,
    ALTER COLUMN correlation_id SET NOT NULL;

ALTER TABLE notifications
    DROP CONSTRAINT chk_notification_type;

ALTER TABLE notifications
    ADD CONSTRAINT chk_notification_type
        CHECK (
            type IN (
                'CANDIDATE_APPLICATION_SUBMITTED',
                'ADMIN_APPLICATION_SUBMITTED',
                'CANDIDATE_APPLICATION_STATUS_CHANGED',
                'APPLICATION_SUBMITTED',
                'APPLICATION_STATUS_CHANGED'
            )
        );

ALTER TABLE notifications
    ADD CONSTRAINT uk_notification_delivery_key
        UNIQUE (delivery_key);

CREATE INDEX idx_notifications_correlation_id
    ON notifications (correlation_id);
