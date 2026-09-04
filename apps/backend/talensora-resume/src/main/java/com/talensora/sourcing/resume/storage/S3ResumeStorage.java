package com.talensora.sourcing.resume.storage;

import com.talensora.sourcing.resume.exception.InvalidResumeException;
import com.talensora.sourcing.resume.exception.ResumeNotFoundException;
import com.talensora.sourcing.resume.exception.ResumeStorageException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Locale;
import java.util.regex.Pattern;

@Component
@ConditionalOnProperty(
        name = "talensora.resume.storage.type",
        havingValue = "s3"
)
public class S3ResumeStorage implements ResumeStorage {

    private static final Pattern STORAGE_KEY = Pattern.compile(
            "^candidates/[0-9a-fA-F-]{36}/resumes/[0-9a-fA-F-]{36}\\.(pdf|doc|docx)$"
    );

    private final S3Client client;

    private final String bucket;

    private final String prefix;

    public S3ResumeStorage(
            S3Client client,
            ResumeStorageProperties properties
    ) {
        this.client = client;
        this.bucket = requireValue(properties.getS3().getBucket(), "bucket");
        this.prefix = normalizePrefix(properties.getS3().getPrefix());
    }

    @Override
    public void store(String storageKey, byte[] content) {
        String objectKey = resolveObjectKey(storageKey);

        try {
            client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(objectKey)
                            .build(),
                    RequestBody.fromBytes(content)
            );
        } catch (RuntimeException exception) {
            throw new ResumeStorageException("Unable to store resume.", exception);
        }
    }

    @Override
    public byte[] load(String storageKey) {
        String objectKey = resolveObjectKey(storageKey);

        try {
            ResponseBytes<GetObjectResponse> response = client.getObjectAsBytes(
                    GetObjectRequest.builder().bucket(bucket).key(objectKey).build()
            );
            return response.asByteArray();
        } catch (NoSuchKeyException exception) {
            throw notFound(exception);
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                throw notFound(exception);
            }
            throw new ResumeStorageException("Unable to read stored resume.", exception);
        } catch (RuntimeException exception) {
            throw new ResumeStorageException("Unable to read stored resume.", exception);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        String objectKey = resolveObjectKey(storageKey);

        try {
            client.headObject(
                    HeadObjectRequest.builder().bucket(bucket).key(objectKey).build()
            );
            return true;
        } catch (NoSuchKeyException exception) {
            return false;
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return false;
            }
            throw new ResumeStorageException("Unable to inspect stored resume.", exception);
        } catch (RuntimeException exception) {
            throw new ResumeStorageException("Unable to inspect stored resume.", exception);
        }
    }

    @Override
    public void delete(String storageKey) {
        String objectKey = resolveObjectKey(storageKey);

        try {
            client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(objectKey)
                            .build()
            );
        } catch (RuntimeException exception) {
            throw new ResumeStorageException("Unable to delete stored resume.", exception);
        }
    }

    String resolveObjectKey(String storageKey) {
        if (storageKey == null
                || storageKey.isBlank()
                || storageKey.startsWith("/")
                || storageKey.startsWith("\\")
                || storageKey.contains("..")
                || storageKey.contains("\\")
                || !STORAGE_KEY.matcher(storageKey).matches()) {
            throw new InvalidResumeException("Invalid storage key.");
        }

        return prefix.isEmpty() ? storageKey : prefix + "/" + storageKey;
    }

    private String normalizePrefix(String configuredPrefix) {
        if (configuredPrefix == null || configuredPrefix.isBlank()) {
            return "";
        }

        String normalized = configuredPrefix.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        if (normalized.startsWith("/")
                || normalized.contains("..")
                || normalized.contains("\\")
                || !normalized.toLowerCase(Locale.ROOT)
                        .startsWith("talensora/")) {
            throw new ResumeStorageException("Invalid S3 resume storage prefix.");
        }

        return normalized;
    }

    private String requireValue(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new ResumeStorageException(
                    "S3 resume storage requires a " + name + "."
            );
        }
        return value;
    }

    private ResumeNotFoundException notFound(RuntimeException cause) {
        ResumeNotFoundException exception = new ResumeNotFoundException(
                "Stored resume file was not found."
        );
        exception.initCause(cause);
        return exception;
    }
}
