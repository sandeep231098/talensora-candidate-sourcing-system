CREATE TABLE candidate_resumes
(
    id UUID PRIMARY KEY,

    candidate_id UUID NOT NULL,

    resume_version INTEGER NOT NULL,

    original_filename VARCHAR(255) NOT NULL,

    file_type VARCHAR(10) NOT NULL,

    content_type VARCHAR(150) NOT NULL,

    size_bytes BIGINT NOT NULL,

    sha256 VARCHAR(64) NOT NULL,

    storage_key VARCHAR(500) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    deleted_at TIMESTAMPTZ,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_candidate_resumes_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidate_profiles (id)
        ON DELETE RESTRICT,

    CONSTRAINT uk_candidate_resume_version
        UNIQUE (
            candidate_id,
            resume_version
        ),

    CONSTRAINT uk_candidate_resume_storage_key
        UNIQUE (storage_key),

    CONSTRAINT ck_candidate_resume_version
        CHECK (resume_version > 0),

    CONSTRAINT ck_candidate_resume_size
        CHECK (size_bytes > 0),

    CONSTRAINT ck_candidate_resume_type
        CHECK (
            file_type IN (
                'PDF',
                'DOC',
                'DOCX'
            )
        ),

    CONSTRAINT ck_candidate_resume_deleted_state
        CHECK (
            NOT (
                active = TRUE
                AND deleted_at IS NOT NULL
            )
        )
);


CREATE UNIQUE INDEX uk_candidate_active_resume
    ON candidate_resumes(candidate_id)
    WHERE active = TRUE;


CREATE INDEX idx_candidate_resume_history
    ON candidate_resumes(
        candidate_id,
        resume_version DESC
    );