#!/usr/bin/env bash
set -euo pipefail

: "${E2E_KEYCLOAK_ADMIN_PASSWORD:?required}"
: "${E2E_CANDIDATE_EMAIL:?required}"
: "${E2E_CANDIDATE_PASSWORD:?required}"
: "${E2E_RECRUITER_EMAIL:?required}"
: "${E2E_RECRUITER_PASSWORD:?required}"
: "${E2E_HR_EMAIL:?required}"
: "${E2E_HR_PASSWORD:?required}"
: "${E2E_ADMIN_EMAIL:?required}"
: "${E2E_ADMIN_PASSWORD:?required}"
: "${E2E_HIRING_MANAGER_EMAIL:?required}"
: "${E2E_HIRING_MANAGER_PASSWORD:?required}"
: "${E2E_AUDITOR_EMAIL:?required}"
: "${E2E_AUDITOR_PASSWORD:?required}"
: "${E2E_ACCOUNTS_EMAIL:?required}"
: "${E2E_ACCOUNTS_PASSWORD:?required}"

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
create_user "$E2E_HR_EMAIL" "$E2E_HR_PASSWORD"
create_user "$E2E_ADMIN_EMAIL" "$E2E_ADMIN_PASSWORD"
create_user "$E2E_HIRING_MANAGER_EMAIL" "$E2E_HIRING_MANAGER_PASSWORD"
create_user "$E2E_AUDITOR_EMAIL" "$E2E_AUDITOR_PASSWORD"
create_user "$E2E_ACCOUNTS_EMAIL" "$E2E_ACCOUNTS_PASSWORD"

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

assign_internal_group() {
  local email=$1
  local group_path=$2
  local expected_role=$3
  local user_id
  local group_id
  local candidate_membership

  user_id=$(run_kcadm get users -r talensora \
    -q "username=$email" -q exact=true --fields id | \
    python3 -c 'import json,sys; users=json.load(sys.stdin); assert len(users) == 1; print(users[0]["id"])')
  group_id=$(run_kcadm get "group-by-path/$group_path" \
    -r talensora --fields id | \
    python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')

  candidate_membership=$(run_kcadm get "users/$user_id/groups" \
    -r talensora --fields id | \
    python3 -c 'import json,sys; groups=json.load(sys.stdin); print("true" if any(group.get("id") == sys.argv[1] for group in groups) else "false")' \
    "$candidate_group_id")
  if [[ "$candidate_membership" == "true" ]]; then
    run_kcadm delete "users/$user_id/groups/$candidate_group_id" \
      -r talensora >/dev/null
  fi

  run_kcadm update "users/$user_id/groups/$group_id" \
    -r talensora -s realm=talensora -s "userId=$user_id" \
    -s "groupId=$group_id" -n >/dev/null

  run_kcadm get "users/$user_id/role-mappings/realm/composite" \
    -r talensora --fields name | \
    python3 -c 'import json,sys; roles={item["name"] for item in json.load(sys.stdin)}; assert sys.argv[1] in roles; assert "CANDIDATE" not in roles' \
    "$expected_role"
}

assign_internal_group "$E2E_HR_EMAIL" internal/hr HR
assign_internal_group "$E2E_ADMIN_EMAIL" internal/admins ADMIN
assign_internal_group "$E2E_HIRING_MANAGER_EMAIL" internal/hiring-managers HIRING_MANAGER
assign_internal_group "$E2E_AUDITOR_EMAIL" internal/auditors AUDITOR
assign_internal_group "$E2E_ACCOUNTS_EMAIL" internal/accounts ACCOUNTS

client_id=$(run_kcadm get clients -r talensora \
  -q clientId=talensora-web --fields id | \
  python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["id"])')
test -n "$client_id"
run_kcadm update "clients/$client_id" -r talensora \
  -s 'redirectUris=["http://localhost:55173/*"]' \
  -s 'webOrigins=["http://localhost:55173"]' >/dev/null

echo "Isolated E2E identities and client redirect are ready."
