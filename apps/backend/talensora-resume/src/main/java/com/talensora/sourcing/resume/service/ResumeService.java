package com.talensora.sourcing.resume.service;

import com.talensora.sourcing.candidate.entity.CandidateProfile;
import com.talensora.sourcing.candidate.exception.CandidateNotFoundException;
import com.talensora.sourcing.candidate.repository.CandidateProfileRepository;

import com.talensora.sourcing.resume.dto.ResumeDownload;
import com.talensora.sourcing.resume.dto.ResumeResponse;

import com.talensora.sourcing.resume.entity.CandidateResume;

import com.talensora.sourcing.resume.exception.InvalidResumeException;
import com.talensora.sourcing.resume.exception.ResumeNotFoundException;

import com.talensora.sourcing.resume.repository.CandidateResumeRepository;

import com.talensora.sourcing.resume.storage.ResumeStorage;

import com.talensora.sourcing.resume.validation.ResumeFileValidator;
import com.talensora.sourcing.resume.validation.ResumeFileValidator.ValidatedResume;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ResumeService {

    private final CandidateProfileRepository candidateRepository;

    private final CandidateResumeRepository resumeRepository;

    private final ResumeStorage storage;

    private final ResumeFileValidator validator;

    public ResumeService(
            CandidateProfileRepository candidateRepository,
            CandidateResumeRepository resumeRepository,
            ResumeStorage storage,
            ResumeFileValidator validator
    ) {

        this.candidateRepository = candidateRepository;
        this.resumeRepository = resumeRepository;
        this.storage = storage;
        this.validator = validator;
    }

    @Transactional
    public ResumeResponse upload(
            String keycloakSubject,
            MultipartFile file
    ) {

        CandidateProfile candidate =
                getCandidate(keycloakSubject);

        ValidatedResume validated =
                validator.validate(file);

        Optional<CandidateResume> current =
                resumeRepository
                        .findFirstByCandidateKeycloakSubjectAndActiveTrue(
                                keycloakSubject
                        );

        current
                .filter(resume ->
                        resume.getSha256()
                                .equals(validated.sha256())
                )
                .ifPresent(resume -> {
                    throw new InvalidResumeException(
                            "This resume is already the active resume."
                    );
                });

        int nextVersion =
                resumeRepository
                        .findMaximumVersion(
                                candidate.getId()
                        ) + 1;

        String storageKey =
                createStorageKey(
                        candidate.getId(),
                        validated
                );

        storage.store(
                storageKey,
                validated.content()
        );

        try {

            if (current.isPresent()) {

                CandidateResume previous =
                        current.get();

                previous.markInactive();

                resumeRepository.saveAndFlush(
                        previous
                );
            }

            CandidateResume resume =
                    CandidateResume.create(
                            candidate,
                            nextVersion,
                            validated.originalFilename(),
                            validated.fileType(),
                            validated.contentType(),
                            (long) validated.sizeBytes(),
                            validated.sha256(),
                            storageKey
                    );

            resume =
                    resumeRepository.saveAndFlush(
                            resume
                    );

            return toResponse(resume);

        } catch (RuntimeException exception) {

            try {

                storage.delete(storageKey);

            } catch (RuntimeException cleanupFailure) {

                exception.addSuppressed(
                        cleanupFailure
                );
            }

            throw exception;
        }
    }

    public ResumeResponse getCurrent(
            String keycloakSubject
    ) {

        return toResponse(
                getCurrentResume(
                        keycloakSubject
                )
        );
    }

    public List<ResumeResponse> getHistory(
            String keycloakSubject
    ) {

        getCandidate(keycloakSubject);

        return resumeRepository
                .findAllByCandidateKeycloakSubjectOrderByResumeVersionDesc(
                        keycloakSubject
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResumeDownload downloadCurrent(
            String keycloakSubject
    ) {

        CandidateResume resume =
                getCurrentResume(
                        keycloakSubject
                );

        byte[] content =
                storage.load(
                        resume.getStorageKey()
                );

        return new ResumeDownload(
                resume.getOriginalFilename(),
                resume.getContentType(),
                content
        );
    }

    public ResumeDownload downloadById(
            UUID resumeId
    ) {

        CandidateResume resume =
                resumeRepository
                        .findById(resumeId)
                        .orElseThrow(() ->
                                new ResumeNotFoundException(
                                        "Resume not found: " + resumeId
                                )
                        );

        byte[] content =
                storage.load(
                        resume.getStorageKey()
                );

        return new ResumeDownload(
                resume.getOriginalFilename(),
                resume.getContentType(),
                content
        );
    }

    @Transactional
    public void deleteCurrent(
            String keycloakSubject
    ) {

        CandidateResume resume =
                getCurrentResume(
                        keycloakSubject
                );

        resume.softDelete();

        resumeRepository.save(
                resume
        );
    }

    private CandidateProfile getCandidate(
            String keycloakSubject
    ) {

        return candidateRepository
                .findByKeycloakSubject(
                        keycloakSubject
                )
                .orElseThrow(() ->
                        new CandidateNotFoundException(
                                "Candidate profile has not been created yet."
                        )
                );
    }

    private CandidateResume getCurrentResume(
            String keycloakSubject
    ) {

        return resumeRepository
                .findFirstByCandidateKeycloakSubjectAndActiveTrue(
                        keycloakSubject
                )
                .orElseThrow(() ->
                        new ResumeNotFoundException(
                                "Candidate does not have an active resume."
                        )
                );
    }

    private String createStorageKey(
            UUID candidateId,
            ValidatedResume validated
    ) {

        return "candidates/"
                + candidateId
                + "/resumes/"
                + UUID.randomUUID()
                + "."
                + validated.fileType()
                        .getExtension();
    }

    private ResumeResponse toResponse(
            CandidateResume resume
    ) {

        return new ResumeResponse(
                resume.getId(),
                resume.getResumeVersion(),
                resume.getOriginalFilename(),
                resume.getFileType(),
                resume.getContentType(),
                resume.getSizeBytes(),
                resume.isActive(),
                resume.getCreatedAt()
        );
    }
}