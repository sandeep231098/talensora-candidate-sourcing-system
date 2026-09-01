package com.talensora.sourcing.resume.validation;

import com.talensora.sourcing.resume.domain.ResumeFileType;
import com.talensora.sourcing.resume.exception.InvalidResumeException;

import org.junit.jupiter.api.Test;

import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ResumeFileValidatorTest {

    private final ResumeFileValidator validator =
            new ResumeFileValidator(
                    5 * 1024 * 1024
            );

    @Test
    void validPdfShouldBeAccepted() {

        byte[] content =
                "%PDF-1.7\nTest Resume"
                        .getBytes(
                                StandardCharsets.US_ASCII
                        );

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        content
                );

        var result =
                validator.validate(file);

        assertEquals(
                ResumeFileType.PDF,
                result.fileType()
        );

        assertEquals(
                "resume.pdf",
                result.originalFilename()
        );
    }

    @Test
    void fakePdfShouldBeRejected() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        "not a pdf".getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        assertThrows(
                InvalidResumeException.class,
                () -> validator.validate(file)
        );
    }

    @Test
    void unsupportedExtensionShouldBeRejected() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.exe",
                        "application/octet-stream",
                        "test".getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        assertThrows(
                InvalidResumeException.class,
                () -> validator.validate(file)
        );
    }

    @Test
    void oversizedResumeShouldBeRejected() {

        ResumeFileValidator tinyValidator =
                new ResumeFileValidator(5);

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        "%PDF-1.7".getBytes(
                                StandardCharsets.US_ASCII
                        )
                );

        assertThrows(
                InvalidResumeException.class,
                () -> tinyValidator.validate(file)
        );
    }
}