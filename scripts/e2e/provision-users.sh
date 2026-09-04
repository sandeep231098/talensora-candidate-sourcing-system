#!/usr/bin/env bash
set -euo pipefail

: "${E2E_KEYCLOAK_ADMIN_PASSWORD:?required}"
: "${E2E_CANDIDATE_EMAIL:?required}"
: "${E2E_CANDIDATE_PASSWORD:?required}"
: "${E2E_RECRUITER_EMAIL:?required}"
: "${E2E_RECRUITER_PASSWORD:?required}"

compose=(docker compose -p talensora-e2e -f docker-compose.e2e.yml)
kcadm=/opt/keycloak/bin/kcadm.sh
config=/tmp/talensora-e2e-kcadm.config

run_kcadm() {
  "${compose[@]}" exec -T keycloak "$kcadm" "$@" --config "$config"
}

cleanup() {
  "${compose[@]}" exec -T keycloak rm -f "$config" >/dev/null 2>&1 || true
}
trap cleanup EXIT

run_kcadm config credentials --server http://localhost:8080 \
  --realm master --user e2e-admin \
  --password "$E2E_KEYCLOAK_ADMIN_PASSWORD" >/dev/null

create_user() {
  local email=$1
  local password=$2
  run_kcadm create users -r talensora \
    -s "username=$email" -s "email=$email" \
    -s firstName=E2E -s lastName=User \
    -s enabled=true -s emailVerified=true >/dev/null
  run_kcadm set-password -r talensora \
    --username "$email" --new-password "$password" >/dev/null
}

create_user "$E2E_CANDIDATE_EMAIL" "$E2E_CANDIDATE_PASSWORD"
create_user "$E2E_RECRUITER_EMAIL" "$E2E_RECRUITER_PASSWORD"

candidate_id=$(run_kcadm get users -r talensora \
  -q "username=$E2E_CANDIDATE_EMAIL" -q exact=true --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["id"])')
recruiter_id=$(run_kcadm get users -r talensora \
  -q "username=$E2E_RECRUITER_EMAIL" -q exact=true --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["id"])')
candidate_group_id=$(run_kcadm get group-by-path/external/candidates \
  -r talensora --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
recruiter_group_id=$(run_kcadm get group-by-path/internal/recruiters \
  -r talensora --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')

test -n "$candidate_id"
test -n "$recruiter_id"
test -n "$candidate_group_id"
test -n "$recruiter_group_id"

run_kcadm update "users/$candidate_id/groups/$candidate_group_id" \
  -r talensora -s realm=talensora -s "userId=$candidate_id" \
  -s "groupId=$candidate_group_id" -n >/dev/null

candidate_membership=$(run_kcadm get "users/$recruiter_id/groups" \
  -r talensora --fields id | \
  python3 -c 'import json,sys; groups=json.load(sys.stdin); print("true" if any(group.get("id") == sys.argv[1] for group in groups) else "false")' \
  "$candidate_group_id")
if [[ "$candidate_membership" == "true" ]]; then
  run_kcadm delete "users/$recruiter_id/groups/$candidate_group_id" \
    -r talensora >/dev/null
fi
run_kcadm update "users/$recruiter_id/groups/$recruiter_group_id" \
  -r talensora -s realm=talensora -s "userId=$recruiter_id" \
  -s "groupId=$recruiter_group_id" -n >/dev/null

client_id=$(run_kcadm get clients -r talensora \
  -q clientId=talensora-web --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["id"])')
test -n "$client_id"
run_kcadm update "clients/$client_id" -r talensora \
  -s 'redirectUris=["http://localhost:55173/*"]' \
  -s 'webOrigins=["http://localhost:55173"]' >/dev/null

echo "Isolated E2E identities and client redirect are ready."
