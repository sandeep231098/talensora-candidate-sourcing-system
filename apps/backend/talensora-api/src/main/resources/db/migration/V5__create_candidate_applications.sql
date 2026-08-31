CREATE TABLE candidate_applications
(
    id UUID PRIMARY KEY,

    application_reference VARCHAR(40) NOT NULL,

    candidate_id UUID NOT NULL,

    requisition_id UUID NOT NULL,

    resume_id UUID NOT NULL,

    resume_version INTEGER NOT NULL,

    cover_note VARCHAR(2000),

    data_accuracy_consent BOOLEAN NOT NULL,

    privacy_consent BOOLEAN NOT NULL,

    status VARCHAR(30) NOT NULL,

    submitted_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_application_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidate_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_application_requisition
        FOREIGN KEY (requisition_id)
        REFERENCES requisitions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_application_resume
        FOREIGN KEY (resume_id)
        REFERENCES candidate_resumes(id)
        ON DELETE RESTRICT,

    CONSTRAINT uk_application_reference
        UNIQUE (application_reference),

    CONSTRAINT uk_application_candidate_requisition
        UNIQUE (
            candidate_id,
            requisition_id
        ),

    CONSTRAINT ck_application_resume_version
        CHECK (resume_version > 0),

    CONSTRAINT ck_application_data_accuracy_consent
        CHECK (data_accuracy_consent = TRUE),

    CONSTRAINT ck_application_privacy_consent
        CHECK (privacy_consent = TRUE),

    CONSTRAINT ck_application_status
        CHECK (
            status IN (
                'NEW',
                'REVIEWED',
                'SHORTLISTED',
                'REJECTED'
            )
        )
);


CREATE INDEX idx_application_candidate
    ON candidate_applications(
        candidate_id,
        submitted_at DESC
    );


CREATE INDEX idx_application_requisition
    ON candidate_applications(
        requisition_id,
        submitted_at DESC
    );


CREATE INDEX idx_application_status
    ON candidate_applications(status);