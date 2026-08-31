package com.talensora.sourcing.requisition.entity;

import com.talensora.sourcing.requisition.domain.EmploymentType;
import com.talensora.sourcing.requisition.domain.RequisitionStatus;
import com.talensora.sourcing.requisition.exception.InvalidRequisitionStateException;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RequisitionLifecycleTest {

    @Test
    void shouldMoveFromDraftToPublishedToClosed() {

        Requisition requisition =
                Requisition.create(
                        "REQ-2026-00001",
                        "Java Backend Developer",
                        "Engineering",
                        "Bengaluru",
                        EmploymentType.FULL_TIME,
                        "4-6 years",
                        2,
                        "Engineering Manager",
                        "Build secure backend services.",
                        new BigDecimal("1500000"),
                        LocalDate.of(2026, 12, 31)
                );

        assertEquals(
                RequisitionStatus.DRAFT,
                requisition.getStatus()
        );

        requisition.publish();

        assertEquals(
                RequisitionStatus.PUBLISHED,
                requisition.getStatus()
        );

        assertNotNull(
                requisition.getPostedAt()
        );

        requisition.close();

        assertEquals(
                RequisitionStatus.CLOSED,
                requisition.getStatus()
        );

        assertThrows(
                InvalidRequisitionStateException.class,
                requisition::publish
        );
    }
}