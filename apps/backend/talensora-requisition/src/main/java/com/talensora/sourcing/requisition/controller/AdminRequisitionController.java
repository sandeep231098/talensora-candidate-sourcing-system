package com.talensora.sourcing.requisition.controller;

import com.talensora.sourcing.requisition.dto.RequisitionRequest;
import com.talensora.sourcing.requisition.dto.RequisitionResponse;
import com.talensora.sourcing.requisition.service.RequisitionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/requisitions")
public class AdminRequisitionController {

    private final RequisitionService service;

    public AdminRequisitionController(
            RequisitionService service
    ) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequisitionResponse create(
            @Valid
            @RequestBody
            RequisitionRequest request
    ) {
        return service.create(request);
    }

    @GetMapping
    public List<RequisitionResponse> list() {
        return service.listAdmin();
    }

    @GetMapping("/{id}")
    public RequisitionResponse find(
            @PathVariable UUID id
    ) {
        return service.findAdmin(id);
    }

    @PutMapping("/{id}")
    public RequisitionResponse update(
            @PathVariable UUID id,
            @Valid
            @RequestBody
            RequisitionRequest request
    ) {
        return service.update(
                id,
                request
        );
    }

    @PostMapping("/{id}/publish")
    public RequisitionResponse publish(
            @PathVariable UUID id
    ) {
        return service.publish(id);
    }

    @PostMapping("/{id}/close")
    public RequisitionResponse close(
            @PathVariable UUID id
    ) {
        return service.close(id);
    }
}