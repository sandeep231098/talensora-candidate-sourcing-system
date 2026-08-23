package com.smartskale.sourcing.requisition.repository;

import com.smartskale.sourcing.requisition.domain.RequisitionStatus;
import com.smartskale.sourcing.requisition.entity.Requisition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RequisitionRepository
        extends JpaRepository<Requisition, UUID> {

    @Query(
            value = "SELECT nextval('requisition_number_seq')",
            nativeQuery = true
    )
    Long nextRequisitionNumber();

    Optional<Requisition> findByRequisitionId(
            String requisitionId
    );

    Optional<Requisition> findByRequisitionIdAndStatus(
            String requisitionId,
            RequisitionStatus status
    );

    List<Requisition> findAllByOrderByCreatedAtDesc();

    List<Requisition> findByStatusOrderByPostedAtDesc(
            RequisitionStatus status
    );
}