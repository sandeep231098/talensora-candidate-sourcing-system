package com.talensora.sourcing.candidate.service;

import com.talensora.sourcing.candidate.dto.CandidateEducationRequest;
import com.talensora.sourcing.candidate.dto.CandidateEducationResponse;
import com.talensora.sourcing.candidate.dto.CandidateProfileRequest;
import com.talensora.sourcing.candidate.dto.CandidateProfileResponse;
import com.talensora.sourcing.candidate.dto.CandidateWorkExperienceRequest;
import com.talensora.sourcing.candidate.dto.CandidateWorkExperienceResponse;
import com.talensora.sourcing.candidate.entity.CandidateEducation;
import com.talensora.sourcing.candidate.entity.CandidateProfile;
import com.talensora.sourcing.candidate.entity.CandidateWorkExperience;
import com.talensora.sourcing.candidate.exception.CandidateNotFoundException;
import com.talensora.sourcing.candidate.exception.InvalidCandidateDataException;
import com.talensora.sourcing.candidate.repository.CandidateEducationRepository;
import com.talensora.sourcing.candidate.repository.CandidateProfileRepository;
import com.talensora.sourcing.candidate.repository.CandidateWorkExperienceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateEducationRepository educationRepository;
    private final CandidateWorkExperienceRepository experienceRepository;

    public CandidateProfileService(
            CandidateProfileRepository profileRepository,
            CandidateEducationRepository educationRepository,
            CandidateWorkExperienceRepository experienceRepository
    ) {
        this.profileRepository = profileRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
    }

    @Transactional
    public CandidateProfileResponse saveProfile(
            String keycloakSubject,
            String authenticatedEmail,
            CandidateProfileRequest request
    ) {

        validateIdentity(
                keycloakSubject,
                authenticatedEmail
        );

        profileRepository
                .findByEmailIgnoreCase(authenticatedEmail)
                .filter(existing ->
                        !existing.getKeycloakSubject()
                                .equals(keycloakSubject)
                )
                .ifPresent(existing -> {
                    throw new InvalidCandidateDataException(
                            "Email is already linked to another candidate profile."
                    );
                });

        CandidateProfile profile =
                profileRepository
                        .findByKeycloakSubject(keycloakSubject)
                        .orElse(null);

        if (profile == null) {

            profile = CandidateProfile.create(
                    keycloakSubject,
                    request.firstName(),
                    request.lastName(),
                    request.gender(),
                    authenticatedEmail,
                    request.mobileNumber(),
                    request.dateOfBirth(),
                    request.currentLocation(),
                    request.currentCompany(),
                    request.noticePeriod(),
                    request.currentAddress(),
                    request.fresher()
            );

        } else {

            profile.updateBio(
                    request.firstName(),
                    request.lastName(),
                    request.gender(),
                    authenticatedEmail,
                    request.mobileNumber(),
                    request.dateOfBirth(),
                    request.currentLocation(),
                    request.currentCompany(),
                    request.noticePeriod(),
                    request.currentAddress(),
                    request.fresher()
            );
        }

        profile = profileRepository.save(profile);

        if (request.fresher()) {

            List<CandidateWorkExperience> existingExperience =
                    experienceRepository
                            .findAllByCandidateKeycloakSubjectOrderByStartDateDesc(
                                    keycloakSubject
                            );

            if (!existingExperience.isEmpty()) {

                experienceRepository.deleteAll(existingExperience);
                experienceRepository.flush();
            }

            profile.updateTotalExperienceMonths(0);

        } else {

            recalculateTotalExperience(profile);
        }

        return toProfileResponse(profile);
    }

    public CandidateProfileResponse getProfile(
            String keycloakSubject
    ) {

        return toProfileResponse(
                getRequiredProfile(keycloakSubject)
        );
    }

    @Transactional
    public CandidateEducationResponse addEducation(
            String keycloakSubject,
            CandidateEducationRequest request
    ) {

        CandidateProfile profile =
                getRequiredProfile(keycloakSubject);

        validateEducation(request);

        CandidateEducation education =
                CandidateEducation.create(
                        profile,
                        request.degreeQualification(),
                        request.specialization(),
                        request.institutionUniversity(),
                        request.yearOfPassing(),
                        request.gradeScore(),
                        request.educationLevel()
                );

        return toEducationResponse(
                educationRepository.save(education)
        );
    }

    public List<CandidateEducationResponse> listEducation(
            String keycloakSubject
    ) {

        getRequiredProfile(keycloakSubject);

        return educationRepository
                .findAllByCandidateKeycloakSubjectOrderByYearOfPassingDesc(
                        keycloakSubject
                )
                .stream()
                .map(this::toEducationResponse)
                .toList();
    }

    @Transactional
    public CandidateEducationResponse updateEducation(
            String keycloakSubject,
            UUID educationId,
            CandidateEducationRequest request
    ) {

        validateEducation(request);

        CandidateEducation education =
                educationRepository
                        .findByIdAndCandidateKeycloakSubject(
                                educationId,
                                keycloakSubject
                        )
                        .orElseThrow(() ->
                                new CandidateNotFoundException(
                                        "Education record not found: " + educationId
                                )
                        );

        education.update(
                request.degreeQualification(),
                request.specialization(),
                request.institutionUniversity(),
                request.yearOfPassing(),
                request.gradeScore(),
                request.educationLevel()
        );

        return toEducationResponse(education);
    }

    @Transactional
    public void deleteEducation(
            String keycloakSubject,
            UUID educationId
    ) {

        CandidateEducation education =
                educationRepository
                        .findByIdAndCandidateKeycloakSubject(
                                educationId,
                                keycloakSubject
                        )
                        .orElseThrow(() ->
                                new CandidateNotFoundException(
                                        "Education record not found: " + educationId
                                )
                        );

        educationRepository.delete(education);
    }

    @Transactional
    public CandidateWorkExperienceResponse addExperience(
            String keycloakSubject,
            CandidateWorkExperienceRequest request
    ) {

        CandidateProfile profile =
                getRequiredProfile(keycloakSubject);

        if (profile.isFresher()) {
            throw new InvalidCandidateDataException(
                    "Candidate is marked as fresher and cannot add work experience."
            );
        }

        validateExperience(request);

        CandidateWorkExperience experience =
                CandidateWorkExperience.create(
                        profile,
                        request.employerName(),
                        request.jobTitle(),
                        request.startDate(),
                        request.endDate(),
                        request.currentlyWorkingHere(),
                        request.keyResponsibilities()
                );

        experience =
                experienceRepository.saveAndFlush(
                        experience
                );

        recalculateTotalExperience(profile);

        return toExperienceResponse(experience);
    }

    public List<CandidateWorkExperienceResponse> listExperience(
            String keycloakSubject
    ) {

        getRequiredProfile(keycloakSubject);

        return experienceRepository
                .findAllByCandidateKeycloakSubjectOrderByStartDateDesc(
                        keycloakSubject
                )
                .stream()
                .map(this::toExperienceResponse)
                .toList();
    }

    @Transactional
    public CandidateWorkExperienceResponse updateExperience(
            String keycloakSubject,
            UUID experienceId,
            CandidateWorkExperienceRequest request
    ) {

        CandidateProfile profile =
                getRequiredProfile(keycloakSubject);

        if (profile.isFresher()) {
            throw new InvalidCandidateDataException(
                    "Candidate is marked as fresher and cannot maintain work experience."
            );
        }

        validateExperience(request);

        CandidateWorkExperience experience =
                experienceRepository
                        .findByIdAndCandidateKeycloakSubject(
                                experienceId,
                                keycloakSubject
                        )
                        .orElseThrow(() ->
                                new CandidateNotFoundException(
                                        "Work experience record not found: " + experienceId
                                )
                        );

        experience.update(
                request.employerName(),
                request.jobTitle(),
                request.startDate(),
                request.endDate(),
                request.currentlyWorkingHere(),
                request.keyResponsibilities()
        );

        experienceRepository.flush();

        recalculateTotalExperience(profile);

        return toExperienceResponse(experience);
    }

    @Transactional
    public void deleteExperience(
            String keycloakSubject,
            UUID experienceId
    ) {

        CandidateProfile profile =
                getRequiredProfile(keycloakSubject);

        CandidateWorkExperience experience =
                experienceRepository
                        .findByIdAndCandidateKeycloakSubject(
                                experienceId,
                                keycloakSubject
                        )
                        .orElseThrow(() ->
                                new CandidateNotFoundException(
                                        "Work experience record not found: " + experienceId
                                )
                        );

        experienceRepository.delete(experience);
        experienceRepository.flush();

        recalculateTotalExperience(profile);
    }

    private CandidateProfile getRequiredProfile(
            String keycloakSubject
    ) {

        return profileRepository
                .findByKeycloakSubject(keycloakSubject)
                .orElseThrow(() ->
                        new CandidateNotFoundException(
                                "Candidate profile has not been created yet."
                        )
                );
    }

    private void validateIdentity(
            String keycloakSubject,
            String authenticatedEmail
    ) {

        if (keycloakSubject == null ||
                keycloakSubject.isBlank()) {

            throw new InvalidCandidateDataException(
                    "Authenticated identity does not contain a subject."
            );
        }

        if (authenticatedEmail == null ||
                authenticatedEmail.isBlank()) {

            throw new InvalidCandidateDataException(
                    "Authenticated identity does not contain an email address."
            );
        }
    }

    private void validateEducation(
            CandidateEducationRequest request
    ) {

        if (request.yearOfPassing() >
                Year.now().getValue()) {

            throw new InvalidCandidateDataException(
                    "Year of passing cannot be in the future."
            );
        }
    }

    private void validateExperience(
            CandidateWorkExperienceRequest request
    ) {

        if (request.currentlyWorkingHere()) {

            if (request.endDate() != null) {

                throw new InvalidCandidateDataException(
                        "End date must be empty when currently working here is selected."
                );
            }

            return;
        }

        if (request.endDate() == null) {

            throw new InvalidCandidateDataException(
                    "End date is required."
            );
        }

        if (request.endDate()
                .isBefore(request.startDate())) {

            throw new InvalidCandidateDataException(
                    "End date cannot be before start date."
            );
        }
    }

    private void recalculateTotalExperience(
            CandidateProfile profile
    ) {

        List<CandidateWorkExperience> experience =
                experienceRepository
                        .findAllByCandidateKeycloakSubjectOrderByStartDateDesc(
                                profile.getKeycloakSubject()
                        );

        if (experience.isEmpty()) {

            profile.updateTotalExperienceMonths(0);
            return;
        }

        List<DateRange> ranges =
                experience.stream()
                        .map(item ->
                                new DateRange(
                                        item.getStartDate(),
                                        item.isCurrentlyWorkingHere()
                                                ? LocalDate.now()
                                                : item.getEndDate()
                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        DateRange::start
                                )
                        )
                        .toList();

        List<DateRange> merged =
                new ArrayList<>();

        for (DateRange range : ranges) {

            if (merged.isEmpty()) {
                merged.add(range);
                continue;
            }

            DateRange previous =
                    merged.get(
                            merged.size() - 1
                    );

            if (!range.start()
                    .isAfter(
                            previous.end()
                                    .plusDays(1)
                    )) {

                LocalDate mergedEnd =
                        range.end()
                                .isAfter(previous.end())
                                ? range.end()
                                : previous.end();

                merged.set(
                        merged.size() - 1,
                        new DateRange(
                                previous.start(),
                                mergedEnd
                        )
                );

            } else {

                merged.add(range);
            }
        }

        long totalMonths =
                merged.stream()
                        .mapToLong(this::calculateMonths)
                        .sum();

        profile.updateTotalExperienceMonths(
                Math.toIntExact(totalMonths)
        );
    }

    private long calculateMonths(
            DateRange range
    ) {

        YearMonth start =
                YearMonth.from(range.start());

        YearMonth end =
                YearMonth.from(range.end());

        return ChronoUnit.MONTHS
                .between(start, end) + 1;
    }

    private CandidateProfileResponse toProfileResponse(
            CandidateProfile profile
    ) {

        return new CandidateProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getGender(),
                profile.getEmail(),
                profile.getMobileNumber(),
                profile.getDateOfBirth(),
                profile.getCurrentLocation(),
                profile.getCurrentCompany(),
                profile.getNoticePeriod(),
                profile.getCurrentAddress(),
                profile.isFresher(),
                profile.getTotalExperienceMonths(),
                profile.getCreatedAt(),
                profile.getUpdatedAt(),
                profile.getVersion()
        );
    }

    private CandidateEducationResponse toEducationResponse(
            CandidateEducation education
    ) {

        return new CandidateEducationResponse(
                education.getId(),
                education.getDegreeQualification(),
                education.getSpecialization(),
                education.getInstitutionUniversity(),
                education.getYearOfPassing(),
                education.getGradeScore(),
                education.getEducationLevel(),
                education.getCreatedAt(),
                education.getUpdatedAt(),
                education.getVersion()
        );
    }

    private CandidateWorkExperienceResponse toExperienceResponse(
            CandidateWorkExperience experience
    ) {

        return new CandidateWorkExperienceResponse(
                experience.getId(),
                experience.getEmployerName(),
                experience.getJobTitle(),
                experience.getStartDate(),
                experience.getEndDate(),
                experience.isCurrentlyWorkingHere(),
                experience.getKeyResponsibilities(),
                experience.getCreatedAt(),
                experience.getUpdatedAt(),
                experience.getVersion()
        );
    }

    private record DateRange(
            LocalDate start,
            LocalDate end
    ) {
    }
}