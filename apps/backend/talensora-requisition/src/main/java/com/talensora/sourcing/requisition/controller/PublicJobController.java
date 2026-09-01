package com.talensora.sourcing.requisition.controller;

import com.talensora.sourcing.requisition.domain.EmploymentType;
import com.talensora.sourcing.requisition.dto.RequisitionResponse;
import com.talensora.sourcing.requisition.service.PublicJobDiscoveryService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/jobs")
public class PublicJobController {

    private final PublicJobDiscoveryService service;

    public PublicJobController(
            PublicJobDiscoveryService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<RequisitionResponse> list(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            String department,

            @RequestParam(required = false)
            String location,

            @RequestParam(required = false)
            EmploymentType employmentType,

            @RequestParam(required = false)
            String experience
    ) {

        return service.searchPublished(
                search,
                department,
                location,
                employmentType,
                experience
        );
    }

    @GetMapping("/{id}")
    public RequisitionResponse find(
            @PathVariable UUID id
    ) {

        return service.findPublished(
                id
        );
    }
}