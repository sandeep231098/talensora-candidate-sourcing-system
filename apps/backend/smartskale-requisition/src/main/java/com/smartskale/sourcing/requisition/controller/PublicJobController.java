package com.smartskale.sourcing.requisition.controller;

import com.smartskale.sourcing.requisition.dto.RequisitionResponse;
import com.smartskale.sourcing.requisition.service.RequisitionService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/jobs")
public class PublicJobController {

    private final RequisitionService service;

    public PublicJobController(
            RequisitionService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<RequisitionResponse> list() {
        return service.listPublished();
    }

    @GetMapping("/{requisitionId}")
    public RequisitionResponse find(
            @PathVariable
            String requisitionId
    ) {
        return service.findPublished(
                requisitionId
        );
    }
}