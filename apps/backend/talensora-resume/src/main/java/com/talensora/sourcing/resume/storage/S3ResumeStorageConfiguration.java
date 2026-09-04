package com.talensora.sourcing.resume.storage;

import com.talensora.sourcing.resume.exception.ResumeStorageException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

import java.net.URI;

@Configuration
@ConditionalOnProperty(
        name = "talensora.resume.storage.type",
        havingValue = "s3"
)
public class S3ResumeStorageConfiguration {

    @Bean
    S3Client resumeS3Client(
            ResumeStorageProperties properties
    ) {
        ResumeStorageProperties.S3 configuration = properties.getS3();

        if (isBlank(configuration.getBucket())
                || isBlank(configuration.getRegion())) {
            throw new ResumeStorageException(
                    "S3 resume storage requires a bucket and region."
            );
        }

        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(configuration.getRegion()));

        if (!isBlank(configuration.getEndpoint())) {
            builder.endpointOverride(URI.create(configuration.getEndpoint()))
                    .forcePathStyle(true);
        }

        return builder.build();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
