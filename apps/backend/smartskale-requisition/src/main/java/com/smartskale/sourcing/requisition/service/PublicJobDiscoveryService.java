package com.smartskale.sourcing.requisition.service;

import com.smartskale.sourcing.requisition.domain.EmploymentType;
import com.smartskale.sourcing.requisition.domain.RequisitionStatus;
import com.smartskale.sourcing.requisition.dto.RequisitionResponse;
import com.smartskale.sourcing.requisition.entity.Requisition;
import com.smartskale.sourcing.requisition.exception.RequisitionNotFoundException;
import com.smartskale.sourcing.requisition.repository.RequisitionRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PublicJobDiscoveryService {

    private final EntityManager entityManager;
    private final RequisitionRepository repository;

    public PublicJobDiscoveryService(
            EntityManager entityManager,
            RequisitionRepository repository
    ) {
        this.entityManager = entityManager;
        this.repository = repository;
    }

    public List<RequisitionResponse> searchPublished(
            String search,
            String department,
            String location,
            EmploymentType employmentType,
            String experience
    ) {

        CriteriaBuilder builder =
                entityManager.getCriteriaBuilder();

        CriteriaQuery<Requisition> query =
                builder.createQuery(
                        Requisition.class
                );

        Root<Requisition> requisition =
                query.from(
                        Requisition.class
                );

        List<Predicate> predicates =
                new ArrayList<>();

        predicates.add(
                builder.equal(
                        requisition.get("status"),
                        RequisitionStatus.PUBLISHED
                )
        );

        if (hasText(search)) {

            String pattern =
                    containsPattern(search);

            predicates.add(
                    builder.or(
                            builder.like(
                                    builder.lower(
                                            requisition.<String>get(
                                                    "jobTitle"
                                            )
                                    ),
                                    pattern
                            ),
                            builder.like(
                                    builder.lower(
                                            requisition.<String>get(
                                                    "jobDescription"
                                            )
                                    ),
                                    pattern
                            ),
                            builder.like(
                                    builder.lower(
                                            requisition.<String>get(
                                                    "requisitionId"
                                            )
                                    ),
                                    pattern
                            )
                    )
            );
        }

        if (hasText(department)) {

            predicates.add(
                    builder.like(
                            builder.lower(
                                    requisition.<String>get(
                                            "department"
                                    )
                            ),
                            containsPattern(
                                    department
                            )
                    )
            );
        }

        if (hasText(location)) {

            predicates.add(
                    builder.like(
                            builder.lower(
                                    requisition.<String>get(
                                            "location"
                                    )
                            ),
                            containsPattern(
                                    location
                            )
                    )
            );
        }

        if (employmentType != null) {

            predicates.add(
                    builder.equal(
                            requisition.get(
                                    "employmentType"
                            ),
                            employmentType
                    )
            );
        }

        if (hasText(experience)) {

            predicates.add(
                    builder.like(
                            builder.lower(
                                    requisition.<String>get(
                                            "experienceRange"
                                    )
                            ),
                            containsPattern(
                                    experience
                            )
                    )
            );
        }

        query
                .where(
                        predicates.toArray(
                                Predicate[]::new
                        )
                )
                .orderBy(
                        builder.desc(
                                requisition.<Instant>get(
                                        "postedAt"
                                )
                        )
                );

        return entityManager
                .createQuery(query)
                .getResultList()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RequisitionResponse findPublished(
            UUID id
    ) {

        Requisition requisition =
                repository
                        .findById(id)
                        .filter(existing ->
                                existing.getStatus()
                                        == RequisitionStatus.PUBLISHED
                        )
                        .orElseThrow(() ->
                                new RequisitionNotFoundException(
                                        "Published requisition not found: "
                                                + id
                                )
                        );

        return toResponse(
                requisition
        );
    }

    private boolean hasText(
            String value
    ) {

        return value != null
                && !value.isBlank();
    }

    private String containsPattern(
            String value
    ) {

        return "%"
                + value
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        )
                + "%";
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