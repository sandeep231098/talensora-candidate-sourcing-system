CREATE TABLE candidate_profiles
(
    id UUID PRIMARY KEY,

    keycloak_subject VARCHAR(100) NOT NULL,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50) NOT NULL,

    gender VARCHAR(30),

    email VARCHAR(254) NOT NULL,

    mobile_number VARCHAR(30) NOT NULL,

    date_of_birth DATE,

    current_location VARCHAR(150) NOT NULL,

    current_company VARCHAR(150),

    notice_period VARCHAR(30),

    current_address TEXT,

    profile_photo_key VARCHAR(500),

    fresher BOOLEAN NOT NULL DEFAULT FALSE,

    total_experience_months INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uk_candidate_profiles_subject
        UNIQUE (keycloak_subject),

    CONSTRAINT uk_candidate_profiles_email
        UNIQUE (email),

    CONSTRAINT ck_candidate_gender
        CHECK (
            gender IS NULL OR
            gender IN (
                'MALE',
                'FEMALE',
                'OTHER',
                'PREFER_NOT_TO_SAY'
            )
        ),

    CONSTRAINT ck_candidate_notice_period
        CHECK (
            notice_period IS NULL OR
            notice_period IN (
                'IMMEDIATE',
                'DAYS_15',
                'DAYS_30',
                'DAYS_60',
                'DAYS_90_PLUS'
            )
        ),

    CONSTRAINT ck_candidate_experience_months
        CHECK (
            total_experience_months >= 0
        )
);


CREATE TABLE candidate_education
(
    id UUID PRIMARY KEY,

    candidate_id UUID NOT NULL,

    degree_qualification VARCHAR(150) NOT NULL,

    specialization VARCHAR(150),

    institution_university VARCHAR(200) NOT NULL,

    year_of_passing INTEGER NOT NULL,

    grade_score VARCHAR(50),

    education_level VARCHAR(30) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_candidate_education_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidate_profiles (id)
        ON DELETE CASCADE,

    CONSTRAINT ck_candidate_education_level
        CHECK (
            education_level IN (
                'HIGH_SCHOOL',
                'DIPLOMA',
                'BACHELORS',
                'MASTERS',
                'DOCTORATE'
            )
        )
);


CREATE TABLE candidate_work_experience
(
    id UUID PRIMARY KEY,

    candidate_id UUID NOT NULL,

    employer_name VARCHAR(200) NOT NULL,

    job_title VARCHAR(150) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE,

    currently_working_here BOOLEAN NOT NULL DEFAULT FALSE,

    key_responsibilities VARCHAR(1000),

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_candidate_experience_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidate_profiles (id)
        ON DELETE CASCADE,

    CONSTRAINT ck_candidate_experience_dates
        CHECK (
            (
                currently_working_here = TRUE
                AND end_date IS NULL
            )
            OR
            (
                currently_working_here = FALSE
                AND end_date IS NOT NULL
                AND end_date >= start_date
            )
        )
);


CREATE INDEX idx_candidate_education_candidate
    ON candidate_education (candidate_id);


CREATE INDEX idx_candidate_experience_candidate
    ON candidate_work_experience (candidate_id);


CREATE INDEX idx_candidate_experience_dates
    ON candidate_work_experience (
        start_date,
        end_date
    );