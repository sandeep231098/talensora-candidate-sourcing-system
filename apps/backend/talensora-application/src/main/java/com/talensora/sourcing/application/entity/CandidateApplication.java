package com.talensora.sourcing.application.entity;

import com.talensora.sourcing.application.domain.ApplicationStatus;

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
import java.time.Year;

import java.util.Locale;
import java.util.UUID;

@Entity
@Table(
        name = "candidate_applications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_application_candidate_requisition",
                        columnNames = {
                                "candidate_id",
                                "requisition_id"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_application_reference",
                        columnNames = {
                                "application_reference"
                        }
                )
        }
)
public class CandidateApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "application_reference",
            nullable = false,
            length = 40
    )
    private String applicationReference;

    @Column(
            name = "candidate_id",
            nullable = false
    )
    private UUID candidateId;

    @Column(
            name = "requisition_id",
            nullable = false
    )
    private UUID requisitionId;

    @Column(
            name = "resume_id",
            nullable = false
    )
    private UUID resumeId;

    @Column(
            name = "resume_version",
            nullable = false
    )
    private Integer resumeVersion;

    @Column(
            name = "cover_note",
            length = 2000
    )
    private String coverNote;

    @Column(
            name = "data_accuracy_consent",
            nullable = false
    )
    private boolean dataAccuracyConsent;

    @Column(
            name = "privacy_consent",
            nullable = false
    )
    private boolean privacyConsent;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ApplicationStatus status;

    @Column(
            name = "submitted_at",
            nullable = false,
            updatable = false
    )
    private Instant submittedAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    protected CandidateApplication() {
    }

    public static CandidateApplication create(
            UUID candidateId,
            UUID requisitionId,
            UUID resumeId,
            Integer resumeVersion,
            String coverNote,
            boolean dataAccuracyConsent,
            boolean privacyConsent
    ) {

        if (!dataAccuracyConsent) {
            throw new IllegalArgumentException(
                    "Data accuracy consent is required."
            );
        }

        if (!privacyConsent) {
            throw new IllegalArgumentException(
                    "Privacy consent is required."
            );
        }

        CandidateApplication application =
                new CandidateApplication();

        application.applicationReference =
                createReference();

        application.candidateId = candidateId;
        application.requisitionId = requisitionId;
        application.resumeId = resumeId;
        application.resumeVersion = resumeVersion;
        application.coverNote = normalizeCoverNote(coverNote);
        application.dataAccuracyConsent = true;
        application.privacyConsent = true;
        application.status = ApplicationStatus.NEW;

        return application;
    }

    public void changeStatus(
            ApplicationStatus status
    ) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Application status is required."
            );
        }

        this.status = status;
    }

    @PrePersist
    void prePersist() {

        Instant now = Instant.now();

        submittedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {

        updatedAt = Instant.now();
    }

    private static String createReference() {

        String random =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 10)
                        .toUpperCase(Locale.ROOT);

        return "APP-"
                + Year.now().getValue()
                + "-"
                + random;
    }

    private static String normalizeCoverNote(
            String coverNote
    ) {

        if (coverNote == null ||
                coverNote.isBlank()) {

            return null;
        }

        return coverNote.trim();
    }

    public UUID getId() {
        return id;
    }

    public String getApplicationReference() {
        return applicationReference;
    }

    public UUID getCandidateId() {
        return candidateId;
    }

    public UUID getRequisitionId() {
        return requisitionId;
    }

    public UUID getResumeId() {
        return resumeId;
    }

    public Integer getResumeVersion() {
        return resumeVersion;
    }

    public String getCoverNote() {
        return coverNote;
    }

    public boolean isDataAccuracyConsent() {
        return dataAccuracyConsent;
    }

    public boolean isPrivacyConsent() {
        return privacyConsent;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}