package com.smartskale.sourcing.notification.repository;

import com.smartskale.sourcing.notification.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {
}