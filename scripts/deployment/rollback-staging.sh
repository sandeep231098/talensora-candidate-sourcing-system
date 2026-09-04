#!/usr/bin/env bash
set -euo pipefail
umask 077

DEPLOY_ROOT=${DEPLOY_ROOT:-/opt/talensora}
ENV_FILE=/etc/talensora/staging.env
PREVIOUS_FILE=$DEPLOY_ROOT/previous-images.env

[[ -s "$PREVIOUS_FILE" ]] || { echo "No previous image set is available." >&2; exit 1; }
sed -i '/^BACKEND_IMAGE=/d;/^FRONTEND_IMAGE=/d' "$ENV_FILE"
cat "$PREVIOUS_FILE" >> "$ENV_FILE"
cp "$PREVIOUS_FILE" "$DEPLOY_ROOT/current-images.env"
docker compose --env-file "$ENV_FILE" -f "$DEPLOY_ROOT/docker-compose.staging.yml" config --quiet
docker compose --env-file "$ENV_FILE" -f "$DEPLOY_ROOT/docker-compose.staging.yml" up -d --remove-orphans --wait
app_url=$(sed -n "s/^STAGING_APP_URL='\(.*\)'$/\1/p" "$ENV_FILE")
[[ "$app_url" == https://* ]] || { echo "Invalid staging application URL." >&2; exit 1; }
curl --fail --silent --show-error --retry 12 --retry-delay 5 "$app_url/actuator/health" >/dev/null
echo "Application images rolled back successfully. Database migrations were not downgraded."
