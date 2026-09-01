package com.talensora.sourcing.application.service;

import com.talensora.sourcing.application.dto.AdminApplicationCsvExport;
import com.talensora.sourcing.application.dto.AdminApplicationDetailResponse;
import com.talensora.sourcing.application.dto.AdminApplicationResponse;
import com.talensora.sourcing.application.dto.ApplicationResponse;
import com.talensora.sourcing.application.dto.CandidateApplicationSummaryResponse;
import com.talensora.sourcing.application.dto.SubmitApplicationRequest;
import com.talensora.sourcing.application.dto.UpdateApplicationStatusRequest;
import com.talensora.sourcing.application.domain.ApplicationStatus;
import com.talensora.sourcing.application.entity.CandidateApplication;
import com.talensora.sourcing.application.event.ApplicationSubmittedEvent;
import com.talensora.sourcing.application.event.ApplicationStatusChangedEvent;
import com.talensora.sourcing.application.exception.ApplicationNotFoundException;
import com.talensora.sourcing.application.exception.DuplicateApplicationException;
import com.talensora.sourcing.application.exception.InvalidApplicationException;
import com.talensora.sourcing.application.repository.CandidateApplicationRepository;
import com.talensora.sourcing.candidate.entity.CandidateProfile;
import com.talensora.sourcing.candidate.repository.CandidateProfileRepository;
import com.talensora.sourcing.candidate.service.CandidateProfileService;
import com.talensora.sourcing.requisition.domain.RequisitionStatus;
import com.talensora.sourcing.requisition.entity.Requisition;
import com.talensora.sourcing.requisition.repository.RequisitionRepository;
import com.talensora.sourcing.resume.entity.CandidateResume;
import com.talensora.sourcing.resume.dto.ResumeDownload;
import com.talensora.sourcing.resume.repository.CandidateResumeRepository;
import com.talensora.sourcing.resume.service.ResumeService;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ApplicationService {

    private final CandidateApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateRepository;
    private final RequisitionRepository requisitionRepository;
    private final CandidateResumeRepository resumeRepository;
    private final CandidateProfileService candidateProfileService;
    private final ResumeService resumeService;
    private final ApplicationEventPublisher eventPublisher;

    public ApplicationService(
            CandidateApplicationRepository applicationRepository,
            CandidateProfileRepository candidateRepository,
            RequisitionRepository requisitionRepository,
            CandidateResumeRepository resumeRepository,
            CandidateProfileService candidateProfileService,
            ResumeService resumeService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.requisitionRepository = requisitionRepository;
        this.resumeRepository = resumeRepository;
        this.candidateProfileService = candidateProfileService;
        this.resumeService = resumeService;
        this.eventPublisher = eventPublisher;
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

        CandidateApplication saved =
                applicationRepository.saveAndFlush(application);

        publishApplicationSubmittedEvent(
                saved,
                candidate,
                requisition
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CandidateApplicationSummaryResponse> listMine(
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
                .map(this::toCandidateApplicationSummary)
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
    public List<AdminApplicationResponse> searchAdmin(
            String search,
            ApplicationStatus status,
            UUID requisitionId
    ) {

        String normalizedSearch =
                normalizeSearch(search);

        return applicationRepository
                .searchAdminApplications(
                        normalizedSearch,
                        status,
                        requisitionId
                )
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminApplicationCsvExport exportApplicationsCsv(
            UUID requisitionId,
            String search,
            ApplicationStatus status
    ) {

        Requisition requisition =
                requisitionRepository
                        .findById(requisitionId)
                        .orElseThrow(() ->
                                new InvalidApplicationException(
                                        "Requisition not found."
                                )
                        );

        List<AdminApplicationResponse> applications =
                searchAdmin(
                        search,
                        status,
                        requisitionId
                );

        StringBuilder csv =
                new StringBuilder();

        csv.append('\uFEFF');

        csv.append(
                "Application ID," +
                "Application Reference," +
                "Candidate Name," +
                "Candidate Email," +
                "Applied On," +
                "Experience Months," +
                "Location," +
                "Status," +
                "Requisition Number," +
                "Job Title," +
                "Resume Version," +
                "Resume Filename," +
                "Resume Download URL," +
                "Cover Note\r\n"
        );

        for (AdminApplicationResponse application : applications) {

            String candidateName =
                    (
                            application.candidateFirstName()
                                    + " "
                                    + application.candidateLastName()
                    ).trim();

            String resumeDownloadUrl =
                    "/api/v1/admin/applications/"
                            + application.id()
                            + "/resume";

            csv.append(escapeCsv(application.id()))
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.applicationReference()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(candidateName)
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.candidateEmail()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.submittedAt()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.totalExperienceMonths()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.candidateLocation()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.status()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.requisitionNumber()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.jobTitle()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.resumeVersion()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.resumeFilename()
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    resumeDownloadUrl
                            )
                    )
                    .append(",")

                    .append(
                            escapeCsv(
                                    application.coverNote()
                            )
                    )

                    .append("\r\n");
        }

        String filename =
                "applications-"
                        + requisition.getRequisitionId()
                        + ".csv";

        return new AdminApplicationCsvExport(
                filename,
                csv.toString()
                        .getBytes(
                                StandardCharsets.UTF_8
                        )
        );
    }

    @Transactional(readOnly = true)
    public AdminApplicationDetailResponse findAdminDetail(
            UUID applicationId
    ) {

        CandidateApplication application =
                getRequiredApplication(applicationId);

        CandidateProfile candidate =
                candidateRepository
                        .findById(application.getCandidateId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Candidate referenced by application does not exist."
                                )
                        );

        String keycloakSubject =
                candidate.getKeycloakSubject();

        return new AdminApplicationDetailResponse(
                toAdminResponse(application),

                candidateProfileService.getProfile(
                        keycloakSubject
                ),

                candidateProfileService.listEducation(
                        keycloakSubject
                ),

                candidateProfileService.listExperience(
                        keycloakSubject
                )
        );
    }

    @Transactional(readOnly = true)
    public ResumeDownload downloadAdminResume(
            UUID applicationId
    ) {

        CandidateApplication application =
                getRequiredApplication(applicationId);

        return resumeService.downloadById(
                application.getResumeId()
        );
    }

    public AdminApplicationResponse updateStatus(
            UUID applicationId,
            UpdateApplicationStatusRequest request
    ) {

        CandidateApplication application =
                getRequiredApplication(applicationId);

        ApplicationStatus previousStatus =
                application.getStatus();

        ApplicationStatus requestedStatus =
                request.status();

        if (previousStatus == requestedStatus) {

            return toAdminResponse(application);
        }

        application.changeStatus(
                requestedStatus
        );

        CandidateApplication saved =
                applicationRepository
                        .saveAndFlush(application);

        publishApplicationStatusChangedEvent(
                saved,
                previousStatus
        );

        return toAdminResponse(saved);
    }

    private CandidateApplicationSummaryResponse toCandidateApplicationSummary(
            CandidateApplication application
    ) {

        Requisition requisition =
                requisitionRepository
                        .findById(
                                application.getRequisitionId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Requisition referenced by application does not exist."
                                )
                        );

        return new CandidateApplicationSummaryResponse(
                application.getId(),
                application.getApplicationReference(),
                application.getStatus(),
                application.getSubmittedAt(),

                requisition.getId(),
                requisition.getRequisitionId(),
                requisition.getJobTitle(),
                requisition.getDepartment(),
                requisition.getLocation(),
                requisition.getEmploymentType(),
                requisition.getExperienceRange(),
                requisition.getStatus(),

                application.getResumeVersion()
        );
    }
    private void publishApplicationStatusChangedEvent(
            CandidateApplication application,
            ApplicationStatus previousStatus
    ) {

        CandidateProfile candidate =
                candidateRepository
                        .findById(
                                application.getCandidateId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Candidate referenced by application does not exist."
                                )
                        );

        Requisition requisition =
                requisitionRepository
                        .findById(
                                application.getRequisitionId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Requisition referenced by application does not exist."
                                )
                        );

        String candidateName =
                (
                        candidate.getFirstName()
                                + " "
                                + candidate.getLastName()
                ).trim();

        ApplicationStatusChangedEvent event =
                new ApplicationStatusChangedEvent(
                        application.getId(),
                        application.getApplicationReference(),

                        requisition.getId(),
                        requisition.getRequisitionId(),
                        requisition.getJobTitle(),

                        candidate.getId(),
                        candidateName,
                        candidate.getEmail(),

                        previousStatus,
                        application.getStatus(),

                        application.getUpdatedAt()
                );

        eventPublisher.publishEvent(event);
    }
    private void publishApplicationSubmittedEvent(
            CandidateApplication application,
            CandidateProfile candidate,
            Requisition requisition
    ) {

        String candidateName =
                (
                        candidate.getFirstName()
                                + " "
                                + candidate.getLastName()
                ).trim();

        ApplicationSubmittedEvent event =
                new ApplicationSubmittedEvent(
                        application.getId(),
                        application.getApplicationReference(),

                        requisition.getId(),
                        requisition.getRequisitionId(),
                        requisition.getJobTitle(),

                        candidate.getId(),
                        candidateName,
                        candidate.getEmail(),

                        application.getSubmittedAt(),
                        application.getStatus()
                );

        eventPublisher.publishEvent(event);
    }

    private String normalizeSearch(
            String search
    ) {

        if (search == null ||
                search.isBlank()) {

            return "";
        }

        return search.trim();
    }

    private String escapeCsv(
            Object value
    ) {

        if (value == null) {
            return "\"\"";
        }

        String text =
                value.toString()
                        .replace(
                                "\"",
                                "\"\""
                        );

        return "\""
                + text
                + "\"";
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