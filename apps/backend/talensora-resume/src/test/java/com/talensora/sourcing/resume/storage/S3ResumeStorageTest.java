package com.talensora.sourcing.resume.storage;

import com.talensora.sourcing.resume.exception.InvalidResumeException;
import com.talensora.sourcing.resume.exception.ResumeNotFoundException;
import com.talensora.sourcing.resume.exception.ResumeStorageException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class S3ResumeStorageTest {

    private static final String LOGICAL_KEY = "candidates/"
            + "4bbf1b12-112e-4ca4-9d70-0dbef38ab465/resumes/"
            + "18e82e5b-f6be-41fc-9e23-d661eaf58e01.pdf";

    private S3Client client;

    private S3ResumeStorage storage;

    @BeforeEach
    void setUp() {
        client = mock(S3Client.class);
        ResumeStorageProperties properties = new ResumeStorageProperties();
        properties.getS3().setBucket("private-resumes");
        properties.getS3().setPrefix("talensora/resumes/");
        storage = new S3ResumeStorage(client, properties);
    }

    @Test
    void uploadUsesPrivateConfiguredBucketAndPrefix() {
        byte[] content = {1, 2, 3};

        storage.store(LOGICAL_KEY, content);

        verify(client).putObject(
                org.mockito.ArgumentMatchers.<PutObjectRequest>argThat(request ->
                        request.bucket().equals("private-resumes")
                                && request.key().equals("talensora/resumes/" + LOGICAL_KEY)
                                && request.acl() == null),
                any(RequestBody.class)
        );
    }

    @Test
    void downloadReturnsOnlyObjectBytes() {
        when(client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenReturn(ResponseBytes.fromByteArray(
                        GetObjectResponse.builder().build(),
                        new byte[]{4, 5, 6}
                ));

        assertThat(storage.load(LOGICAL_KEY)).containsExactly(4, 5, 6);
    }

    @Test
    void deleteUsesConfiguredObjectKey() {
        storage.delete(LOGICAL_KEY);

        verify(client).deleteObject(
                org.mockito.ArgumentMatchers.<DeleteObjectRequest>argThat(request ->
                        request.bucket().equals("private-resumes")
                                && request.key().equals("talensora/resumes/" + LOGICAL_KEY))
        );
    }

    @Test
    void missingObjectIsTranslated() {
        when(client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());

        assertThatThrownBy(() -> storage.load(LOGICAL_KEY))
                .isInstanceOf(ResumeNotFoundException.class)
                .hasMessage("Stored resume file was not found.");
    }

    @Test
    void clientFailuresAreTranslatedWithoutAwsDetailsInMessage() {
        when(client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenThrow(SdkClientException.create("credential provider details"));

        assertThatThrownBy(() -> storage.load(LOGICAL_KEY))
                .isInstanceOf(ResumeStorageException.class)
                .hasMessage("Unable to read stored resume.")
                .message().doesNotContain("credential");
    }

    @Test
    void existenceUsesHeadObjectAndTreatsMissingAsFalse() {
        assertThat(storage.exists(LOGICAL_KEY)).isTrue();
        verify(client).headObject(any(HeadObjectRequest.class));

        when(client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());
        assertThat(storage.exists(LOGICAL_KEY)).isFalse();
    }

    @Test
    void invalidKeysAndPrefixesFailClosed() {
        for (String key : new String[]{
                "", "/candidates/file.pdf", "../file.pdf",
                "candidates\\id\\resumes\\file.pdf", "other/" + UUID.randomUUID() + ".pdf"
        }) {
            assertThatThrownBy(() -> storage.load(key))
                    .isInstanceOf(InvalidResumeException.class);
        }

        ResumeStorageProperties properties = new ResumeStorageProperties();
        properties.getS3().setBucket("private-resumes");
        properties.getS3().setPrefix("other/resumes");

        assertThatThrownBy(() -> new S3ResumeStorage(client, properties))
                .isInstanceOf(ResumeStorageException.class)
                .hasMessage("Invalid S3 resume storage prefix.");
    }
}
