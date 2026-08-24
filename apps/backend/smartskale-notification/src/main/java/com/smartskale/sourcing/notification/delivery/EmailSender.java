package com.smartskale.sourcing.notification.delivery;

public interface EmailSender {

    void send(
            String recipient,
            String subject,
            String body
    );
}