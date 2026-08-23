package com.smartskale.sourcing.resume.entity;

import com.smartskale.sourcing.candidate.entity.CandidateProfile;
import com.smartskale.sourcing.resume.domain.ResumeFileType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "candidate_resumes")
public class CandidateResume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @Column(name = "resume_version", nullable = false)
    private Integer resumeVersion;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 10)
    private ResumeFileType fileType;

    @Column(name = "content_type", nullable = false, length = 150)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "sha256", nullable = false, length = 64)
    private String sha256;

    @Column(name = "storage_key", nullable = false, unique = true, length = 500)
    private String storageKey;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    protected CandidateResume() {
    }

    public static CandidateResume create(
            CandidateProfile candidate,
            Integer resumeVersion,
            String originalFilename,
            ResumeFileType fileType,
            String contentType,
            Long sizeBytes,
            String sha256,
            String storageKey
    ) {

        CandidateResume resume = new CandidateResume();

        resume.candidate = candidate;
        resume.resumeVersion = resumeVersion;
        resume.originalFilename = originalFilename;
        resume.fileType = fileType;
        resume.contentType = contentType;
        resume.sizeBytes = sizeBytes;
        resume.sha256 = sha256;
        resume.storageKey = storageKey;
        resume.active = true;

        return resume;
    }

    public void markInactive() {
        this.active = false;
    }

    public void softDelete() {
        this.active = false;
        this.deletedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public CandidateProfile getCandidate() {
        return candidate;
    }

    public Integer getResumeVersion() {
        return resumeVersion;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public ResumeFileType getFileType() {
        return fileType;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public String getSha256() {
        return sha256;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Long getVersion() {
        return version;
    }
}