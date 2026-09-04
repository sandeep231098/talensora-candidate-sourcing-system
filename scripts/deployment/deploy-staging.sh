#!/usr/bin/env bash
set -euo pipefail
umask 077

DEPLOY_ROOT=${DEPLOY_ROOT:-/opt/talensora}
PARAMETER_PATH=${PARAMETER_PATH:-/talensora/staging/}
AWS_REGION=${AWS_REGION:?AWS_REGION is required}
BACKEND_IMAGE=${BACKEND_IMAGE:?BACKEND_IMAGE is required}
FRONTEND_IMAGE=${FRONTEND_IMAGE:?FRONTEND_IMAGE is required}
COMPOSE_SOURCE=${COMPOSE_SOURCE:-$DEPLOY_ROOT/docker-compose.staging.yml}
ENV_FILE=/etc/talensora/staging.env
STATE_FILE=$DEPLOY_ROOT/current-images.env
PREVIOUS_FILE=$DEPLOY_ROOT/previous-images.env

case "$BACKEND_IMAGE $FRONTEND_IMAGE" in
  *:latest*) echo "Mutable latest tags are not permitted" >&2; exit 1 ;;
esac

install -d -m 0750 "$DEPLOY_ROOT" /etc/talensora
if [[ -f "$STATE_FILE" ]]; then cp "$STATE_FILE" "$PREVIOUS_FILE"; fi

registry=${BACKEND_IMAGE%%/*}
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$registry" >/dev/null

parameter_json=$(aws ssm get-parameters-by-path --region "$AWS_REGION" --path "$PARAMETER_PATH" --recursive --with-decryption --output json)
printf '%s' "$parameter_json" | python3 "$DEPLOY_ROOT/bin/render-env.py" "$PARAMETER_PATH" "$ENV_FILE"
chmod 0600 "$ENV_FILE"

printf 'BACKEND_IMAGE=%s\nFRONTEND_IMAGE=%s\n' "$BACKEND_IMAGE" "$FRONTEND_IMAGE" > "$STATE_FILE"
cat "$STATE_FILE" >> "$ENV_FILE"
cp "$COMPOSE_SOURCE" "$DEPLOY_ROOT/docker-compose.staging.yml"

docker compose --env-file "$ENV_FILE" -f "$DEPLOY_ROOT/docker-compose.staging.yml" config --quiet
docker compose --env-file "$ENV_FILE" -f "$DEPLOY_ROOT/docker-compose.staging.yml" pull
docker compose --env-file "$ENV_FILE" -f "$DEPLOY_ROOT/docker-compose.staging.yml" up -d --remove-orphans --wait

app_url=$(sed -n "s/^STAGING_APP_URL='\(.*\)'$/\1/p" "$ENV_FILE")
[[ "$app_url" == https://* ]] || { echo "Invalid staging application URL." >&2; exit 1; }
curl --fail --silent --show-error --retry 12 --retry-delay 5 "$app_url/actuator/health" >/dev/null
echo "Staging deployment completed and health check passed."
