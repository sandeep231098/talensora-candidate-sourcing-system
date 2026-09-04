#!/usr/bin/env bash
set -euo pipefail

COMPOSE_VERSION=v2.39.2

if ! command -v docker >/dev/null 2>&1; then
  dnf install -y docker curl python3 || yum install -y docker curl python3
fi
if ! command -v aws >/dev/null 2>&1; then
  dnf install -y awscli2 || dnf install -y awscli || yum install -y awscli
fi
if ! docker compose version >/dev/null 2>&1; then
  architecture=$(uname -m)
  case "$architecture" in
    x86_64) compose_arch=x86_64 ;;
    aarch64) compose_arch=aarch64 ;;
    *) echo "Unsupported architecture: $architecture" >&2; exit 1 ;;
  esac
  install -d -m 0755 /usr/local/lib/docker/cli-plugins
  curl --fail --silent --show-error --location \
    "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${compose_arch}" \
    --output /usr/local/lib/docker/cli-plugins/docker-compose
  chmod 0755 /usr/local/lib/docker/cli-plugins/docker-compose
fi

systemctl enable --now docker amazon-ssm-agent
docker compose version >/dev/null
install -d -m 0750 -o root -g root /opt/talensora/bin /opt/talensora/releases /etc/talensora /etc/talensora/tls
touch /var/log/talensora-deploy.log
chmod 0600 /var/log/talensora-deploy.log

# Deployment artifacts are installed through SSM after infrastructure creation.
# No source-control credentials or application secrets are used during bootstrap.
