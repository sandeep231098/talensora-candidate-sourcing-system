package com.smartskale.sourcing.requisition.service;

import com.smartskale.sourcing.requisition.domain.RequisitionStatus;
import com.smartskale.sourcing.requisition.dto.RequisitionRequest;
import com.smartskale.sourcing.requisition.dto.RequisitionResponse;
import com.smartskale.sourcing.requisition.entity.Requisition;
import com.smartskale.sourcing.requisition.exception.RequisitionNotFoundException;
import com.smartskale.sourcing.requisition.repository.RequisitionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RequisitionService {

    private final RequisitionRepository repository;

    public RequisitionService(
            RequisitionRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public RequisitionResponse create(
            RequisitionRequest request
    ) {

        Long sequence =
                repository.nextRequisitionNumber();

        String requisitionId =
                "REQ-%d-%05d".formatted(
                        Year.now().getValue(),
                        sequence
                );

        Requisition requisition =
                Requisition.create(
                        requisitionId,
                        request.jobTitle(),
                        request.department(),
                        request.location(),
                        request.employmentType(),
                        request.experienceRange(),
                        request.numberOfOpenings(),
                        request.hiringManager(),
                        request.jobDescription(),
                        request.maximumSalaryBudget(),
                        request.hiringCompletedBy()
                );

        return toResponse(
                repository.save(requisition)
        );
    }

    @Transactional
    public RequisitionResponse update(
            UUID id,
            RequisitionRequest request
    ) {

        Requisition requisition =
                getRequired(id);

        requisition.updateDetails(
                request.jobTitle(),
                request.department(),
                request.location(),
                request.employmentType(),
                request.experienceRange(),
                request.numberOfOpenings(),
                request.hiringManager(),
                request.jobDescription(),
                request.maximumSalaryBudget(),
                request.hiringCompletedBy()
        );

        return toResponse(requisition);
    }

    @Transactional
    public RequisitionResponse publish(
            UUID id
    ) {

        Requisition requisition =
                getRequired(id);

        requisition.publish();

        return toResponse(requisition);
    }

    @Transactional
    public RequisitionResponse close(
            UUID id
    ) {

        Requisition requisition =
                getRequired(id);

        requisition.close();

        return toResponse(requisition);
    }

    public RequisitionResponse findAdmin(
            UUID id
    ) {

        return toResponse(
                getRequired(id)
        );
    }

    public List<RequisitionResponse> listAdmin() {

        return repository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RequisitionResponse> listPublished() {

        return repository
                .findByStatusOrderByPostedAtDesc(
                        RequisitionStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RequisitionResponse findPublished(
            String requisitionId
    ) {

        Requisition requisition =
                repository
                        .findByRequisitionIdAndStatus(
                                requisitionId,
                                RequisitionStatus.PUBLISHED
                        )
                        .orElseThrow(() ->
                                new RequisitionNotFoundException(
                                        "Published requisition not found: "
                                                + requisitionId
                                )
                        );

        return toResponse(requisition);
    }

    private Requisition getRequired(
            UUID id
    ) {

        return repository
                .findById(id)
                .orElseThrow(() ->
                        new RequisitionNotFoundException(
                                "Requisition not found: " + id
                        )
                );
    }

    private RequisitionResponse toResponse(
            Requisition requisition
    ) {

        return new RequisitionResponse(
                requisition.getId(),
                requisition.getRequisitionId(),
                requisition.getJobTitle(),
                requisition.getDepartment(),
                requisition.getLocation(),
                requisition.getEmploymentType(),
                requisition.getExperienceRange(),
                requisition.getNumberOfOpenings(),
                requisition.getHiringManager(),
                requisition.getJobDescription(),
                requisition.getMaximumSalaryBudget(),
                requisition.getHiringCompletedBy(),
                requisition.getStatus(),
                requisition.getPostedAt(),
                requisition.getCreatedAt(),
                requisition.getUpdatedAt(),
                requisition.getVersion()
        );
    }
}