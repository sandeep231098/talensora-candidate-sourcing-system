#!/usr/bin/env bash
set -euo pipefail

docker compose -p talensora-e2e -f docker-compose.e2e.yml exec -T postgres \
  psql -U talensora -d talensora_candidate_db -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO requisitions (
  id, requisition_id, job_title, department, location, employment_type,
  experience_range, number_of_openings, hiring_manager, job_description,
  status, posted_at, created_at, updated_at, version
) VALUES (
  '11111111-1111-4111-8111-111111111111', 'REQ-E2E-001',
  'E2E Software Engineer', 'Engineering', 'Remote', 'FULL_TIME',
  '0-2 Years', 1, 'E2E Manager', 'Deterministic browser-test role.',
  'PUBLISHED', NOW(), NOW(), NOW(), 0
) ON CONFLICT (id) DO NOTHING;
SQL
