# Repository Guidelines

## Project & Architecture

Talensora Candidate Sourcing Platform (`talensora-candidate-sourcing-system`) is a monorepo. The backend is a Java 21, Spring Boot 4.1.0 Maven multi-module modular monolith. The frontend uses React 19, TypeScript, Vite, and Material UI. PostgreSQL 17 is managed with Flyway; Keycloak 26.7.2 provides OAuth 2.0/OIDC authentication and JWTs.

Google login must always follow **Google -> Keycloak -> Talensora**. Spring Boot validates Keycloak-issued JWTs; never validate Google access tokens directly.

## Repository Structure

- `apps/frontend`: feature code in `src/features/<feature>`, shared UI in `src/components`, authentication in `src/auth`, and assets in `public` or `src/assets`.
- `apps/backend`: parent Maven reactor and modules `talensora-common`, `talensora-security`, `talensora-auth`, `talensora-requisition`, `talensora-candidate`, `talensora-resume`, `talensora-application`, `talensora-notification`, and executable `talensora-api`.
- `apps/backend/talensora-api/src/main/resources/db/migration`: Flyway migrations.
- `infrastructure/` and root `docker-compose.yml`: PostgreSQL and Keycloak setup.

Preserve module boundaries. Inspect existing controllers and services before changing behavior; do not invent duplicate APIs. Prefer small, targeted changes over rewrites.

## Local Services & Protected Ports

Talensora uses frontend `5173`, API `9093`, Keycloak `8180`, PostgreSQL `5433`, Mailpit SMTP `1025`, and Mailpit UI `8025`.

The separate Apex Bank AI environment owns ZooKeeper `2181`, pgAdmin `5050`, PostgreSQL `5432`, Redis `6379`, Keycloak `8080`, and Kafka `9092`. Never stop, kill, reconfigure, or reuse these ports or services.

## Development & Validation

- `docker compose up -d`: start Talensora infrastructure.
- `docker compose config --quiet`: validate Compose after any Compose change.
- `cd apps/backend && ./mvnw spring-boot:run -pl talensora-api -am`: run the API (`mvnw.cmd` on Windows).
- `cd apps/backend && ./mvnw clean verify`: build and test all backend modules.
- `cd apps/frontend && npm ci && npm run dev`: install locked dependencies and run Vite.
- `npm run lint` and `npm run build`: lint, type-check, and build frontend changes.

Java uses four spaces, `com.talensora.sourcing.<module>` packages, PascalCase types, camelCase members, and suffixes such as `Controller`, `Service`, `Repository`, `Request`, and `Response`. TypeScript uses two spaces, single quotes, PascalCase components, and camelCase hooks/utilities. ESLint is authoritative.

Backend tests use Spring Boot Test/JUnit under each module's `src/test/java`; mirror production packages and name classes `*Test`. Add or update tests for meaningful backend changes. No frontend test runner is configured, so document manual UI validation and always run lint/build.

Before committing, run `git diff --check`, review the complete diff for security issues, and inspect `git status`. Do not commit generated build directories, runtime data, backups, `.env`, or IDE secrets.

## Security & Identity Provisioning

Never commit or print passwords, Google client secrets, database passwords, tokens, JWTs, private keys, AWS credentials, or Keycloak administrator credentials. Use environment variables and safe placeholders. Google Client ID and Client Secret belong only in the local environment/Keycloak configuration—never React source.

Candidates may self-register or use social login; Google users may initially map to `/external/candidates`. Google login alone must never grant a privileged role. Privileged/internal roles require controlled provisioning. Current Keycloak mappings are:

- `/external/candidates` -> `CANDIDATE`
- `/internal/recruiters` -> `RECRUITER`
- `/internal/admins` -> `ADMIN`
- `/internal/hr` -> `HR` + `RECRUITER`
- `/internal/hiring-managers` -> `HIRING_MANAGER`
- `/internal/auditors` -> `AUDITOR`
- `/internal/accounts` -> `ACCOUNTS`

## Git & Release Workflow

Every feature follows: feature branch -> implementation -> tests/build/runtime validation -> diff/security review -> commit -> push -> PR into `develop` -> green CI -> merge -> PR `develop` into `main` -> green CI -> merge. Never push directly to `main`, merge a broken build, or leave a completed and validated feature unreleased from `main`. Use focused Conventional Commit subjects (for example, `feat: add Google SSO`) and ticketed branches.

## Current Handoff State

SSCS-020 (Talensora rebrand) is complete and released. Current work is **SSCS-021 Google SSO**; remain on `feature/SSCS-021-google-sso` until fully validated and released. Candidate Google SSO works end-to-end through Bio-Data, Education, Experience/resume, application, and confirmation. Mobile numbers currently require international form such as `+919876543210`. Recruiter Google testing is postponed until a second Gmail test identity is available.

After SSCS-021, planned work is SSCS-022 registration/identity provisioning, SSCS-023 password reset, SSCS-024 email verification/SMTP, validation and UX cleanup, recruiter/admin provisioning, notification/security/error hardening, UI improvements, S3 resume storage, automated E2E/API tests, and AWS staging deployment.
