package com.talensora.sourcing.notification.domain;

public enum NotificationType {

    CANDIDATE_APPLICATION_SUBMITTED,
    ADMIN_APPLICATION_SUBMITTED,
    CANDIDATE_APPLICATION_STATUS_CHANGED,

    // Retained so notification rows created before SSCS-028 remain readable.
    APPLICATION_SUBMITTED,
    APPLICATION_STATUS_CHANGED

}
