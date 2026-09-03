package com.talensora.sourcing.notification.repository;

import com.talensora.sourcing.notification.domain.NotificationType;
import com.talensora.sourcing.notification.entity.Notification;

import org.junit.jupiter.api.Test;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(NotificationRepositoryTest.TestConfiguration.class)
class NotificationRepositoryTest {

    private final NotificationRepository notificationRepository;

    @Autowired
    NotificationRepositoryTest(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    @Test
    void shouldEnforceUniqueDeliveryKey() {
        notificationRepository.saveAndFlush(
                notification("candidate@example.com")
        );

        assertThrows(
                DataIntegrityViolationException.class,
                () -> notificationRepository.saveAndFlush(
                        notification("admin@example.com")
                )
        );
    }

    private Notification notification(String recipient) {
        return Notification.createEmail(
                NotificationType.CANDIDATE_APPLICATION_SUBMITTED,
                "application-submitted:candidate:test",
                "APP-TEST",
                recipient,
                "Application submitted",
                "Your application was submitted."
        );
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration
    @EntityScan(
            basePackageClasses = Notification.class
    )
    @EnableJpaRepositories(
            basePackageClasses = NotificationRepository.class
    )
    static class TestConfiguration {
    }

    @SpringBootConfiguration
    static class TestApplication {
    }
}
