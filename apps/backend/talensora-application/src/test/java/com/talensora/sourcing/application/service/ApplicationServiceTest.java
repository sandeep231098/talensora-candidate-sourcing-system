package com.talensora.sourcing.application.service;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class ApplicationServiceTest {

    @Test
    void recognizesOnlyTheDuplicateApplicationConstraint() {
        assertThat(ApplicationService.isDuplicateApplicationConstraint(
                violation("uk_application_candidate_requisition")))
                .isTrue();
        assertThat(ApplicationService.isDuplicateApplicationConstraint(
                violation("uk_application_reference")))
                .isFalse();
    }

    private DataIntegrityViolationException violation(String constraintName) {
        return new DataIntegrityViolationException(
                "Database constraint violation",
                new ConstraintViolationException(
                        "Constraint violation",
                        new SQLException(),
                        constraintName
                )
        );
    }
}
