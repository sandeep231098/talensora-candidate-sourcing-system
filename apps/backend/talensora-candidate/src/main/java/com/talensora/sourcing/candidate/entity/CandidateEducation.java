package com.talensora.sourcing.candidate.entity;

import com.talensora.sourcing.candidate.domain.EducationLevel;

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
@Table(name = "candidate_education")
public class CandidateEducation {

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
            name = "degree_qualification",
            nullable = false,
            length = 150
    )
    private String degreeQualification;

    @Column(length = 150)
    private String specialization;

    @Column(
            name = "institution_university",
            nullable = false,
            length = 200
    )
    private String institutionUniversity;

    @Column(
            name = "year_of_passing",
            nullable = false
    )
    private Integer yearOfPassing;

    @Column(
            name = "grade_score",
            length = 50
    )
    private String gradeScore;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "education_level",
            nullable = false,
            length = 30
    )
    private EducationLevel educationLevel;

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

    protected CandidateEducation() {
    }

    public static CandidateEducation create(
            CandidateProfile candidate,
            String degreeQualification,
            String specialization,
            String institutionUniversity,
            Integer yearOfPassing,
            String gradeScore,
            EducationLevel educationLevel
    ) {

        CandidateEducation education =
                new CandidateEducation();

        education.candidate = candidate;

        education.update(
                degreeQualification,
                specialization,
                institutionUniversity,
                yearOfPassing,
                gradeScore,
                educationLevel
        );

        return education;
    }

    public void update(
            String degreeQualification,
            String specialization,
            String institutionUniversity,
            Integer yearOfPassing,
            String gradeScore,
            EducationLevel educationLevel
    ) {

        this.degreeQualification = degreeQualification;
        this.specialization = specialization;
        this.institutionUniversity = institutionUniversity;
        this.yearOfPassing = yearOfPassing;
        this.gradeScore = gradeScore;
        this.educationLevel = educationLevel;
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

    public String getDegreeQualification() {
        return degreeQualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getInstitutionUniversity() {
        return institutionUniversity;
    }

    public Integer getYearOfPassing() {
        return yearOfPassing;
    }

    public String getGradeScore() {
        return gradeScore;
    }

    public EducationLevel getEducationLevel() {
        return educationLevel;
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