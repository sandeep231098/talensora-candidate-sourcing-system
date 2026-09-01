package com.talensora.sourcing.notification.repository;

import com.talensora.sourcing.notification.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {
}