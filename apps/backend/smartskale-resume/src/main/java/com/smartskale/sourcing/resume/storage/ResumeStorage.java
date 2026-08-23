package com.smartskale.sourcing.resume.storage;

public interface ResumeStorage {

    void store(
            String storageKey,
            byte[] content
    );

    byte[] load(
            String storageKey
    );

    boolean exists(
            String storageKey
    );

    void delete(
            String storageKey
    );
}