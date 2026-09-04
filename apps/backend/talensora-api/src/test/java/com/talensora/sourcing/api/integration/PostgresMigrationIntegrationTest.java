package com.talensora.sourcing.api.integration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.postgresql.util.PSQLException;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:17-alpine");

    @BeforeAll
    static void migrate() {
        Flyway.configure()
                .dataSource(
                        POSTGRES.getJdbcUrl(),
                        POSTGRES.getUsername(),
                        POSTGRES.getPassword()
                )
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    @Test
    void allFlywayMigrationsApplyToPostgresql() throws SQLException {
        try (Connection connection = connection();
             Statement statement = connection.createStatement();
             var result = statement.executeQuery(
                     "select count(*) from flyway_schema_history where success = true"
             )) {
            assertThat(result.next()).isTrue();
            assertThat(result.getInt(1)).isEqualTo(7);
        }
    }

    @Test
    void postgresqlEnforcesOneApplicationPerCandidateAndRequisition()
            throws SQLException {
        UUID candidateId = UUID.randomUUID();
        UUID requisitionId = UUID.randomUUID();
        UUID resumeId = UUID.randomUUID();

        try (Connection connection = connection();
             Statement statement = connection.createStatement()) {
            String now = Instant.now().toString();
            statement.executeUpdate("""
                    insert into candidate_profiles (
                      id, keycloak_subject, first_name, last_name, email,
                      mobile_number, current_location, fresher,
                      total_experience_months, created_at, updated_at, version
                    ) values (
                      '%s', 'candidate-subject', 'Test', 'Candidate',
                      'candidate@example.test', '+919876543210', 'Test City', true,
                      0, '%s', '%s', 0
                    )
                    """.formatted(candidateId, now, now));
            statement.executeUpdate("""
                    insert into requisitions (
                      id, requisition_id, job_title, department, location,
                      employment_type, experience_range, number_of_openings,
                      hiring_manager, job_description, status,
                      created_at, updated_at, version
                    ) values (
                      '%s', 'REQ-E2E-1', 'Engineer', 'Technology', 'Remote',
                      'FULL_TIME', '0-2 years', 1, 'Test Manager', 'Test role',
                      'PUBLISHED', '%s', '%s', 0
                    )
                    """.formatted(requisitionId, now, now));
            statement.executeUpdate("""
                    insert into candidate_resumes (
                      id, candidate_id, resume_version, original_filename,
                      file_type, content_type, size_bytes, sha256, storage_key,
                      active, created_at, updated_at, version
                    ) values (
                      '%s', '%s', 1, 'resume.pdf', 'PDF', 'application/pdf', 8,
                      '%s', 'candidates/%s/resumes/%s.pdf', true, '%s', '%s', 0
                    )
                    """.formatted(
                    resumeId, candidateId, "a".repeat(64), candidateId,
                    UUID.randomUUID(), now, now
            ));

            insertApplication(statement, UUID.randomUUID(), "APP-E2E-1",
                    candidateId, requisitionId, resumeId, now);

            assertThatThrownBy(() -> insertApplication(
                    statement, UUID.randomUUID(), "APP-E2E-2",
                    candidateId, requisitionId, resumeId, now
            ))
                    .isInstanceOf(PSQLException.class)
                    .hasMessageContaining("uk_application_candidate_requisition");
        }
    }

    private static void insertApplication(
            Statement statement,
            UUID applicationId,
            String reference,
            UUID candidateId,
            UUID requisitionId,
            UUID resumeId,
            String now
    ) throws SQLException {
        statement.executeUpdate("""
                insert into candidate_applications (
                  id, application_reference, candidate_id, requisition_id,
                  resume_id, resume_version, data_accuracy_consent,
                  privacy_consent, status, submitted_at, updated_at, version
                ) values (
                  '%s', '%s', '%s', '%s', '%s', 1, true, true,
                  'NEW', '%s', '%s', 0
                )
                """.formatted(
                applicationId, reference, candidateId, requisitionId,
                resumeId, now, now
        ));
    }

    private static Connection connection() throws SQLException {
        return DriverManager.getConnection(
                POSTGRES.getJdbcUrl(),
                POSTGRES.getUsername(),
                POSTGRES.getPassword()
        );
    }
}
