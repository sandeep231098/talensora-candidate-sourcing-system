package com.smartskale.sourcing.notification.listener;

import com.smartskale.sourcing.application.event.ApplicationSubmittedEvent;
import com.smartskale.sourcing.notification.domain.NotificationType;
import com.smartskale.sourcing.notification.service.NotificationService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ApplicationNotificationListener {

    private final NotificationService notificationService;
    private final String adminEmail;

    public ApplicationNotificationListener(
            NotificationService notificationService,
            @Value("${smartskale.notification.admin-email:admin@smartskale.local}")
            String adminEmail
    ) {
        this.notificationService = notificationService;
        this.adminEmail = adminEmail;
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleApplicationSubmitted(
            ApplicationSubmittedEvent event
    ) {
        sendCandidateConfirmation(event);
        sendAdminNotification(event);
    }

    private void sendCandidateConfirmation(
            ApplicationSubmittedEvent event
    ) {
        String subject =
                "Application submitted - "
                        + event.jobTitle();

        String body = """
                Hello %s,

                Your application has been submitted successfully.

                Application ID: %s
                Requisition: %s
                Job Title: %s
                Submitted At: %s
                Status: %s

                Regards,
                SmartSkale Recruitment Team
                """.formatted(
                event.candidateName(),
                event.applicationReference(),
                event.requisitionNumber(),
                event.jobTitle(),
                event.submittedAt(),
                event.status()
        );

        notificationService.sendEmail(
                NotificationType.APPLICATION_SUBMITTED,
                event.candidateEmail(),
                subject,
                body
        );
    }

    private void sendAdminNotification(
            ApplicationSubmittedEvent event
    ) {
        String subject =
                "New application received - "
                        + event.requisitionNumber();

        String body = """
                A new candidate application has been submitted.

                Candidate: %s
                Candidate Email: %s
                Application ID: %s
                Requisition: %s
                Job Title: %s
                Submitted At: %s
                Status: %s
                """.formatted(
                event.candidateName(),
                event.candidateEmail(),
                event.applicationReference(),
                event.requisitionNumber(),
                event.jobTitle(),
                event.submittedAt(),
                event.status()
        );

        notificationService.sendEmail(
                NotificationType.APPLICATION_SUBMITTED,
                adminEmail,
                subject,
                body
        );
    }
}