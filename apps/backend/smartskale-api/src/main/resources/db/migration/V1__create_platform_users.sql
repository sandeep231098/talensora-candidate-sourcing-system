CREATE TABLE platform_users
(
    id UUID PRIMARY KEY,

    keycloak_subject VARCHAR(100) NOT NULL,

    email VARCHAR(254) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uk_platform_users_keycloak_subject
        UNIQUE (keycloak_subject),

    CONSTRAINT uk_platform_users_email
        UNIQUE (email)
);

CREATE INDEX idx_platform_users_keycloak_subject
    ON platform_users (keycloak_subject);

CREATE INDEX idx_platform_users_email
    ON platform_users (email);