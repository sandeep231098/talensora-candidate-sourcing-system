package com.smartskale.sourcing.application.dto;

public record AdminApplicationCsvExport(

        String filename,

        byte[] content

) {
}