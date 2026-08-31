CREATE TABLE notifications (
    id UUID PRIMARY KEY,

    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,

    recipient_address VARCHAR(320) NOT NULL,

    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    status VARCHAR(20) NOT NULL,

    attempt_count INTEGER NOT NULL DEFAULT 0,

    last_error VARCHAR(1000),

    created_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT,

    CONSTRAINT chk_notification_type
        CHECK (
            type IN (
                'APPLICATION_SUBMITTED',
                'APPLICATION_STATUS_CHANGED'
            )
        ),

    CONSTRAINT chk_notification_channel
        CHECK (
            channel IN (
                'EMAIL'
            )
        ),

    CONSTRAINT chk_notification_status
        CHECK (
            status IN (
                'PENDING',
                'SENT',
                'FAILED'
            )
        ),

    CONSTRAINT chk_notification_attempt_count
        CHECK (
            attempt_count >= 0
        )
);

CREATE INDEX idx_notifications_recipient_created_at
    ON notifications (
        recipient_address,
        created_at DESC
    );

CREATE INDEX idx_notifications_status_created_at
    ON notifications (
        status,
        created_at
    );