package com.smartskale.sourcing.requisition.entity;

import com.smartskale.sourcing.requisition.domain.EmploymentType;
import com.smartskale.sourcing.requisition.domain.RequisitionStatus;
import com.smartskale.sourcing.requisition.exception.InvalidRequisitionStateException;

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
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "requisitions")
public class Requisition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "requisition_id",
            nullable = false,
            unique = true,
            length = 30
    )
    private String requisitionId;

    @Column(
            name = "job_title",
            nullable = false,
            length = 100
    )
    private String jobTitle;

    @Column(
            nullable = false,
            length = 100
    )
    private String department;

    @Column(
            nullable = false,
            length = 150
    )
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "employment_type",
            nullable = false,
            length = 30
    )
    private EmploymentType employmentType;

    @Column(
            name = "experience_range",
            nullable = false,
            length = 50
    )
    private String experienceRange;

    @Column(
            name = "number_of_openings",
            nullable = false
    )
    private Integer numberOfOpenings;

    @Column(
            name = "hiring_manager",
            nullable = false,
            length = 150
    )
    private String hiringManager;

    @Column(
            name = "job_description",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String jobDescription;

    @Column(
            name = "maximum_salary_budget",
            precision = 15,
            scale = 2
    )
    private BigDecimal maximumSalaryBudget;

    @Column(
            name = "hiring_completed_by"
    )
    private LocalDate hiringCompletedBy;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private RequisitionStatus status;

    @Column(
            name = "posted_at"
    )
    private Instant postedAt;

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

    protected Requisition() {
    }

    public static Requisition create(
            String requisitionId,
            String jobTitle,
            String department,
            String location,
            EmploymentType employmentType,
            String experienceRange,
            Integer numberOfOpenings,
            String hiringManager,
            String jobDescription,
            BigDecimal maximumSalaryBudget,
            LocalDate hiringCompletedBy
    ) {

        Requisition requisition = new Requisition();

        requisition.requisitionId = requisitionId;
        requisition.jobTitle = jobTitle;
        requisition.department = department;
        requisition.location = location;
        requisition.employmentType = employmentType;
        requisition.experienceRange = experienceRange;
        requisition.numberOfOpenings = numberOfOpenings;
        requisition.hiringManager = hiringManager;
        requisition.jobDescription = jobDescription;
        requisition.maximumSalaryBudget = maximumSalaryBudget;
        requisition.hiringCompletedBy = hiringCompletedBy;
        requisition.status = RequisitionStatus.DRAFT;

        return requisition;
    }

    public void updateDetails(
            String jobTitle,
            String department,
            String location,
            EmploymentType employmentType,
            String experienceRange,
            Integer numberOfOpenings,
            String hiringManager,
            String jobDescription,
            BigDecimal maximumSalaryBudget,
            LocalDate hiringCompletedBy
    ) {

        if (status == RequisitionStatus.CLOSED) {

            throw new InvalidRequisitionStateException(
                    "Closed requisitions cannot be edited."
            );
        }

        this.jobTitle = jobTitle;
        this.department = department;
        this.location = location;
        this.employmentType = employmentType;
        this.experienceRange = experienceRange;
        this.numberOfOpenings = numberOfOpenings;
        this.hiringManager = hiringManager;
        this.jobDescription = jobDescription;
        this.maximumSalaryBudget = maximumSalaryBudget;
        this.hiringCompletedBy = hiringCompletedBy;
    }

    public void publish() {

        if (status == RequisitionStatus.CLOSED) {

            throw new InvalidRequisitionStateException(
                    "Closed requisitions cannot be published."
            );
        }

        if (status == RequisitionStatus.PUBLISHED) {
            return;
        }

        status = RequisitionStatus.PUBLISHED;
        postedAt = Instant.now();
    }

    public void close() {

        if (status == RequisitionStatus.CLOSED) {
            return;
        }

        status = RequisitionStatus.CLOSED;
    }

    @PrePersist
    void prePersist() {

        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = RequisitionStatus.DRAFT;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getRequisitionId() {
        return requisitionId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getDepartment() {
        return department;
    }

    public String getLocation() {
        return location;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public String getExperienceRange() {
        return experienceRange;
    }

    public Integer getNumberOfOpenings() {
        return numberOfOpenings;
    }

    public String getHiringManager() {
        return hiringManager;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public BigDecimal getMaximumSalaryBudget() {
        return maximumSalaryBudget;
    }

    public LocalDate getHiringCompletedBy() {
        return hiringCompletedBy;
    }

    public RequisitionStatus getStatus() {
        return status;
    }

    public Instant getPostedAt() {
        return postedAt;
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