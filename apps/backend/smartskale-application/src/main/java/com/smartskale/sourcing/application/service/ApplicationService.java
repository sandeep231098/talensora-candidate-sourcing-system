package com.smartskale.sourcing.application.service;

import com.smartskale.sourcing.application.dto.AdminApplicationResponse;
import com.smartskale.sourcing.application.dto.ApplicationResponse;
import com.smartskale.sourcing.application.dto.SubmitApplicationRequest;
import com.smartskale.sourcing.application.dto.UpdateApplicationStatusRequest;
import com.smartskale.sourcing.application.entity.CandidateApplication;
import com.smartskale.sourcing.application.exception.ApplicationNotFoundException;
import com.smartskale.sourcing.application.exception.DuplicateApplicationException;
import com.smartskale.sourcing.application.exception.InvalidApplicationException;
import com.smartskale.sourcing.application.repository.CandidateApplicationRepository;
import com.smartskale.sourcing.candidate.entity.CandidateProfile;
import com.smartskale.sourcing.candidate.repository.CandidateProfileRepository;
import com.smartskale.sourcing.requisition.domain.RequisitionStatus;
import com.smartskale.sourcing.requisition.entity.Requisition;
import com.smartskale.sourcing.requisition.repository.RequisitionRepository;
import com.smartskale.sourcing.resume.entity.CandidateResume;
import com.smartskale.sourcing.resume.repository.CandidateResumeRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ApplicationService {

    private final CandidateApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateRepository;
    private final RequisitionRepository requisitionRepository;
    private final CandidateResumeRepository resumeRepository;

    public ApplicationService(
            CandidateApplicationRepository applicationRepository,
            CandidateProfileRepository candidateRepository,
            RequisitionRepository requisitionRepository,
            CandidateResumeRepository resumeRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.requisitionRepository = requisitionRepository;
        this.resumeRepository = resumeRepository;
    }

    public ApplicationResponse submit(
            String keycloakSubject,
            SubmitApplicationRequest request
    ) {

        CandidateProfile candidate =
                candidateRepository
                        .findByKeycloakSubject(keycloakSubject)
                        .orElseThrow(() ->
                                new InvalidApplicationException(
                                        "Candidate profile must be completed before applying."
                                )
                        );

        Requisition requisition =
                requisitionRepository
                        .findById(request.requisitionId())
                        .orElseThrow(() ->
                                new InvalidApplicationException(
                                        "Requisition not found."
                                )
                        );

        if (requisition.getStatus() != RequisitionStatus.PUBLISHED) {
            throw new InvalidApplicationException(
                    "Applications can only be submitted for published requisitions."
            );
        }

        CandidateResume resume =
                resumeRepository
                        .findFirstByCandidateKeycloakSubjectAndActiveTrue(
                                keycloakSubject
                        )
                        .orElseThrow(() ->
                                new InvalidApplicationException(
                                        "An active resume is required before submitting an application."
                                )
                        );

        if (applicationRepository
                .existsByCandidateIdAndRequisitionId(
                        candidate.getId(),
                        requisition.getId()
                )) {

            throw new DuplicateApplicationException(
                    "You have already applied to this requisition."
            );
        }

        CandidateApplication application =
                CandidateApplication.create(
                        candidate.getId(),
                        requisition.getId(),
                        resume.getId(),
                        resume.getResumeVersion(),
                        request.coverNote(),
                        request.dataAccuracyConsent(),
                        request.privacyConsent()
                );

        return toResponse(
                applicationRepository.save(application)
        );
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> listMine(
            String keycloakSubject
    ) {

        CandidateProfile candidate =
                candidateRepository
                        .findByKeycloakSubject(keycloakSubject)
                        .orElseThrow(() ->
                                new InvalidApplicationException(
                                        "Candidate profile not found."
                                )
                        );

        return applicationRepository
                .findAllByCandidateIdOrderBySubmittedAtDesc(
                        candidate.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> listAllAdmin() {

        return applicationRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.DESC,
                                "submittedAt"
                        )
                )
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> listByRequisition(
            UUID requisitionId
    ) {

        if (!requisitionRepository.existsById(requisitionId)) {
            throw new InvalidApplicationException(
                    "Requisition not found."
            );
        }

        return applicationRepository
                .findAllByRequisitionIdOrderBySubmittedAtDesc(
                        requisitionId
                )
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminApplicationResponse findAdmin(
            UUID applicationId
    ) {

        return toAdminResponse(
                getRequiredApplication(applicationId)
        );
    }

    public AdminApplicationResponse updateStatus(
            UUID applicationId,
            UpdateApplicationStatusRequest request
    ) {

        CandidateApplication application =
                getRequiredApplication(applicationId);

        application.changeStatus(
                request.status()
        );

        CandidateApplication saved =
                applicationRepository.saveAndFlush(application);

        return toAdminResponse(saved);
    }
    private CandidateApplication getRequiredApplication(
            UUID applicationId
    ) {

        return applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new ApplicationNotFoundException(
                                "Application not found: "
                                        + applicationId
                        )
                );
    }

    private ApplicationResponse toResponse(
            CandidateApplication application
    ) {

        return new ApplicationResponse(
                application.getId(),
                application.getApplicationReference(),
                application.getRequisitionId(),
                application.getResumeId(),
                application.getResumeVersion(),
                application.getStatus(),
                application.getCoverNote(),
                application.getSubmittedAt(),
                application.getUpdatedAt()
        );
    }

    private AdminApplicationResponse toAdminResponse(
            CandidateApplication application
    ) {

        CandidateProfile candidate =
                candidateRepository
                        .findById(application.getCandidateId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Candidate referenced by application does not exist."
                                )
                        );

        Requisition requisition =
                requisitionRepository
                        .findById(application.getRequisitionId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Requisition referenced by application does not exist."
                                )
                        );

        CandidateResume resume =
                resumeRepository
                        .findById(application.getResumeId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Resume referenced by application does not exist."
                                )
                        );

        return new AdminApplicationResponse(
                application.getId(),
                application.getApplicationReference(),
                application.getStatus(),
                application.getSubmittedAt(),

                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getEmail(),
                candidate.getCurrentLocation(),
                candidate.getTotalExperienceMonths(),

                requisition.getId(),
                requisition.getRequisitionId(),
                requisition.getJobTitle(),
                requisition.getDepartment(),
                requisition.getLocation(),

                resume.getId(),
                resume.getResumeVersion(),
                resume.getOriginalFilename(),
                resume.getFileType().name(),
                resume.getSizeBytes(),

                application.getCoverNote(),
                application.getUpdatedAt()
        );
    }
}