package com.smartskale.sourcing.candidate.entity;

import com.smartskale.sourcing.candidate.domain.Gender;
import com.smartskale.sourcing.candidate.domain.NoticePeriod;

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

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles")
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "keycloak_subject",
            nullable = false,
            unique = true,
            length = 100
    )
    private String keycloakSubject;

    @Column(
            name = "first_name",
            nullable = false,
            length = 50
    )
    private String firstName;

    @Column(
            name = "last_name",
            nullable = false,
            length = 50
    )
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Gender gender;

    @Column(
            nullable = false,
            unique = true,
            length = 254
    )
    private String email;

    @Column(
            name = "mobile_number",
            nullable = false,
            length = 30
    )
    private String mobileNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(
            name = "current_location",
            nullable = false,
            length = 150
    )
    private String currentLocation;

    @Column(
            name = "current_company",
            length = 150
    )
    private String currentCompany;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "notice_period",
            length = 30
    )
    private NoticePeriod noticePeriod;

    @Column(
            name = "current_address",
            columnDefinition = "TEXT"
    )
    private String currentAddress;

    @Column(
            name = "profile_photo_key",
            length = 500
    )
    private String profilePhotoKey;

    @Column(nullable = false)
    private boolean fresher;

    @Column(
            name = "total_experience_months",
            nullable = false
    )
    private Integer totalExperienceMonths;

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

    protected CandidateProfile() {
    }

    public static CandidateProfile create(
            String keycloakSubject,
            String firstName,
            String lastName,
            Gender gender,
            String email,
            String mobileNumber,
            LocalDate dateOfBirth,
            String currentLocation,
            String currentCompany,
            NoticePeriod noticePeriod,
            String currentAddress,
            boolean fresher
    ) {

        CandidateProfile profile = new CandidateProfile();

        profile.keycloakSubject = keycloakSubject;
        profile.totalExperienceMonths = 0;

        profile.updateBio(
                firstName,
                lastName,
                gender,
                email,
                mobileNumber,
                dateOfBirth,
                currentLocation,
                currentCompany,
                noticePeriod,
                currentAddress,
                fresher
        );

        return profile;
    }

    public void updateBio(
            String firstName,
            String lastName,
            Gender gender,
            String email,
            String mobileNumber,
            LocalDate dateOfBirth,
            String currentLocation,
            String currentCompany,
            NoticePeriod noticePeriod,
            String currentAddress,
            boolean fresher
    ) {

        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.dateOfBirth = dateOfBirth;
        this.currentLocation = currentLocation;
        this.currentCompany = currentCompany;
        this.noticePeriod = noticePeriod;
        this.currentAddress = currentAddress;
        this.fresher = fresher;

        if (fresher) {
            this.totalExperienceMonths = 0;
        }
    }

    public void updateTotalExperienceMonths(int months) {
        this.totalExperienceMonths = Math.max(months, 0);
    }

    public void updateProfilePhotoKey(String profilePhotoKey) {
        this.profilePhotoKey = profilePhotoKey;
    }

    @PrePersist
    void prePersist() {

        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;

        if (totalExperienceMonths == null) {
            totalExperienceMonths = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getKeycloakSubject() {
        return keycloakSubject;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Gender getGender() {
        return gender;
    }

    public String getEmail() {
        return email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public String getCurrentCompany() {
        return currentCompany;
    }

    public NoticePeriod getNoticePeriod() {
        return noticePeriod;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public String getProfilePhotoKey() {
        return profilePhotoKey;
    }

    public boolean isFresher() {
        return fresher;
    }

    public Integer getTotalExperienceMonths() {
        return totalExperienceMonths;
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