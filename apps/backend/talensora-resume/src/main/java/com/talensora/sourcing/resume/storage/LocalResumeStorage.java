package com.talensora.sourcing.resume.storage;

import com.talensora.sourcing.resume.exception.InvalidResumeException;
import com.talensora.sourcing.resume.exception.ResumeNotFoundException;
import com.talensora.sourcing.resume.exception.ResumeStorageException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@Component
@ConditionalOnProperty(
        name = "talensora.resume.storage.type",
        havingValue = "local",
        matchIfMissing = true
)
public class LocalResumeStorage implements ResumeStorage {

    private final Path rootDirectory;

    public LocalResumeStorage(
            ResumeStorageProperties properties
    ) {

        rootDirectory =
                Paths.get(properties.getLocalDirectory())
                        .toAbsolutePath()
                        .normalize();

        try {

            Files.createDirectories(
                    rootDirectory
            );

        } catch (IOException exception) {

            throw new ResumeStorageException(
                    "Unable to initialize resume storage.",
                    exception
            );
        }
    }

    @Override
    public void store(
            String storageKey,
            byte[] content
    ) {

        Path target = resolve(storageKey);

        try {

            Files.createDirectories(
                    target.getParent()
            );

            Files.write(
                    target,
                    content,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE
            );

        } catch (IOException exception) {

            throw new ResumeStorageException(
                    "Unable to store resume.",
                    exception
            );
        }
    }

    @Override
    public byte[] load(
            String storageKey
    ) {

        Path target = resolve(storageKey);

        if (!Files.exists(target)) {

            throw new ResumeNotFoundException(
                    "Stored resume file was not found."
            );
        }

        try {

            return Files.readAllBytes(
                    target
            );

        } catch (IOException exception) {

            throw new ResumeStorageException(
                    "Unable to read stored resume.",
                    exception
            );
        }
    }

    @Override
    public boolean exists(
            String storageKey
    ) {

        return Files.exists(
                resolve(storageKey)
        );
    }

    @Override
    public void delete(
            String storageKey
    ) {

        Path target = resolve(storageKey);

        try {

            Files.deleteIfExists(
                    target
            );

        } catch (IOException exception) {

            throw new ResumeStorageException(
                    "Unable to delete stored resume.",
                    exception
            );
        }
    }

    private Path resolve(
            String storageKey
    ) {

        Path target =
                rootDirectory
                        .resolve(storageKey)
                        .normalize();

        if (!target.startsWith(
                rootDirectory
        )) {

            throw new InvalidResumeException(
                    "Invalid storage key."
            );
        }

        return target;
    }
}
