package com.talensora.sourcing.resume.storage;

import com.talensora.sourcing.resume.exception.InvalidResumeException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalResumeStorageTest {

    @TempDir
    private Path directory;

    @Test
    void localModeStoresLoadsChecksAndDeletesWithoutAwsConfiguration() {
        ResumeStorageProperties properties = new ResumeStorageProperties();
        properties.setLocalDirectory(directory.toString());
        LocalResumeStorage storage = new LocalResumeStorage(properties);

        storage.store("candidates/test/resumes/resume.pdf", new byte[]{1, 2, 3});

        assertThat(storage.exists("candidates/test/resumes/resume.pdf")).isTrue();
        assertThat(storage.load("candidates/test/resumes/resume.pdf"))
                .containsExactly(1, 2, 3);

        storage.delete("candidates/test/resumes/resume.pdf");
        assertThat(storage.exists("candidates/test/resumes/resume.pdf")).isFalse();
    }

    @Test
    void localModeRejectsTraversalOutsideItsRoot() {
        ResumeStorageProperties properties = new ResumeStorageProperties();
        properties.setLocalDirectory(directory.toString());
        LocalResumeStorage storage = new LocalResumeStorage(properties);

        assertThatThrownBy(() -> storage.load("../outside.pdf"))
                .isInstanceOf(InvalidResumeException.class);
    }
}
