CREATE SEQUENCE requisition_number_seq
    START WITH 1
    INCREMENT BY 1;


CREATE TABLE requisitions
(
    id UUID PRIMARY KEY,

    requisition_id VARCHAR(30) NOT NULL,

    job_title VARCHAR(100) NOT NULL,

    department VARCHAR(100) NOT NULL,

    location VARCHAR(150) NOT NULL,

    employment_type VARCHAR(30) NOT NULL,

    experience_range VARCHAR(50) NOT NULL,

    number_of_openings INTEGER NOT NULL,

    hiring_manager VARCHAR(150) NOT NULL,

    job_description TEXT NOT NULL,

    maximum_salary_budget NUMERIC(15, 2),

    hiring_completed_by DATE,

    status VARCHAR(20) NOT NULL,

    posted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uk_requisitions_requisition_id
        UNIQUE (requisition_id),

    CONSTRAINT ck_requisitions_openings
        CHECK (number_of_openings > 0),

    CONSTRAINT ck_requisitions_status
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'CLOSED'
            )
        ),

    CONSTRAINT ck_requisitions_employment_type
        CHECK (
            employment_type IN (
                'FULL_TIME',
                'PART_TIME',
                'CONTRACT',
                'INTERNSHIP'
            )
        )
);


CREATE INDEX idx_requisitions_status
    ON requisitions (status);


CREATE INDEX idx_requisitions_department
    ON requisitions (department);


CREATE INDEX idx_requisitions_location
    ON requisitions (location);


CREATE INDEX idx_requisitions_posted_at
    ON requisitions (posted_at DESC);