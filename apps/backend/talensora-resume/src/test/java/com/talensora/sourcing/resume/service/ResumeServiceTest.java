package com.talensora.sourcing.resume.service;

import com.talensora.sourcing.candidate.entity.CandidateProfile;
import com.talensora.sourcing.candidate.repository.CandidateProfileRepository;
import com.talensora.sourcing.resume.entity.CandidateResume;
import com.talensora.sourcing.resume.repository.CandidateResumeRepository;
import com.talensora.sourcing.resume.storage.ResumeStorage;
import com.talensora.sourcing.resume.validation.ResumeFileValidator;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResumeServiceTest {

    @Test
    void uploadPreservesValidatedMetadataAndBytesAcrossStorageImplementations()
            throws Exception {
        CandidateProfileRepository candidateRepository =
                mock(CandidateProfileRepository.class);
        CandidateResumeRepository resumeRepository =
                mock(CandidateResumeRepository.class);
        ResumeStorage storage = mock(ResumeStorage.class);
        CandidateProfile candidate = mock(CandidateProfile.class);
        UUID candidateId = UUID.randomUUID();
        byte[] bytes = "%PDF-1.7\nResume".getBytes(StandardCharsets.US_ASCII);

        when(candidate.getId()).thenReturn(candidateId);
        when(candidateRepository.findByKeycloakSubject("candidate-subject"))
                .thenReturn(Optional.of(candidate));
        when(resumeRepository.findFirstByCandidateKeycloakSubjectAndActiveTrue(
                "candidate-subject"))
                .thenReturn(Optional.empty());
        when(resumeRepository.findMaximumVersion(candidateId)).thenReturn(0);
        when(resumeRepository.saveAndFlush(any(CandidateResume.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResumeService service = new ResumeService(
                candidateRepository,
                resumeRepository,
                storage,
                new ResumeFileValidator(5 * 1024 * 1024)
        );

        service.upload("candidate-subject", new MockMultipartFile(
                "file", "candidate-resume.pdf", "application/octet-stream", bytes
        ));

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<byte[]> storedBytes = ArgumentCaptor.forClass(byte[].class);
        verify(storage).store(key.capture(), storedBytes.capture());
        assertThat(storedBytes.getValue()).containsExactly(bytes);
        assertThat(key.getValue()).matches(
                "candidates/" + candidateId + "/resumes/[0-9a-f-]{36}\\.pdf"
        );

        ArgumentCaptor<CandidateResume> resume =
                ArgumentCaptor.forClass(CandidateResume.class);
        verify(resumeRepository).saveAndFlush(resume.capture());
        CandidateResume saved = resume.getValue();

        assertThat(saved.getOriginalFilename()).isEqualTo("candidate-resume.pdf");
        assertThat(saved.getContentType()).isEqualTo("application/pdf");
        assertThat(saved.getSizeBytes()).isEqualTo((long) bytes.length);
        assertThat(saved.getSha256()).isEqualTo(HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(bytes)
        ));
        assertThat(saved.getStorageKey()).isEqualTo(key.getValue());
    }
}
