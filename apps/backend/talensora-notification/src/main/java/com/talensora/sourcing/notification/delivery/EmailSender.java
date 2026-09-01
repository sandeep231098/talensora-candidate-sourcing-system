package com.talensora.sourcing.notification.delivery;

public interface EmailSender {

    void send(
            String recipient,
            String subject,
            String body
    );
}