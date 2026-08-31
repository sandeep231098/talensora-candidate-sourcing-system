package com.talensora.sourcing.application.dto;

public record AdminApplicationCsvExport(

        String filename,

        byte[] content

) {
}