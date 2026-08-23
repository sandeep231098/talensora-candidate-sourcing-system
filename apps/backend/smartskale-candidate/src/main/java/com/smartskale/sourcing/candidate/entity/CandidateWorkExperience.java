package com.smartskale.sourcing.candidate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "candidate_work_experience")
public class CandidateWorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "candidate_id",
            nullable = false
    )
    private CandidateProfile candidate;

    @Column(
            name = "employer_name",
            nullable = false,
            length = 200
    )
    private String employerName;

    @Column(
            name = "job_title",
            nullable = false,
            length = 150
    )
    private String jobTitle;

    @Column(
            name = "start_date",
            nullable = false
    )
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(
            name = "currently_working_here",
            nullable = false
    )
    private boolean currentlyWorkingHere;

    @Column(
            name = "key_responsibilities",
            length = 1000
    )
    private String keyResponsibilities;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    protected CandidateWorkExperience() {
    }

    public static CandidateWorkExperience create(
            CandidateProfile candidate,
            String employerName,
            String jobTitle,
            LocalDate startDate,
            LocalDate endDate,
            boolean currentlyWorkingHere,
            String keyResponsibilities
    ) {

        CandidateWorkExperience experience =
                new CandidateWorkExperience();

        experience.candidate = candidate;

        experience.update(
                employerName,
                jobTitle,
                startDate,
                endDate,
                currentlyWorkingHere,
                keyResponsibilities
        );

        return experience;
    }

    public void update(
            String employerName,
            String jobTitle,
            LocalDate startDate,
            LocalDate endDate,
            boolean currentlyWorkingHere,
            String keyResponsibilities
    ) {

        if (startDate == null) {
            throw new IllegalArgumentException(
                    "Start date is required."
            );
        }

        if (currentlyWorkingHere) {
            endDate = null;
        }
        else if (endDate == null) {
            throw new IllegalArgumentException(
                    "End date is required when the candidate is not currently working here."
            );
        }

        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date."
            );
        }

        this.employerName = employerName;
        this.jobTitle = jobTitle;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currentlyWorkingHere = currentlyWorkingHere;
        this.keyResponsibilities = keyResponsibilities;
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

    public String getEmployerName() {
        return employerName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public boolean isCurrentlyWorkingHere() {
        return currentlyWorkingHere;
    }

    public String getKeyResponsibilities() {
        return keyResponsibilities;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}