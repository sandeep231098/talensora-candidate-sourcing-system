# AWS Staging Operations

SSCS-033 targets one public EC2 host running Nginx/frontend, the Spring Boot API,
and Keycloak with Docker Compose. PostgreSQL 17 runs in private Single-AZ RDS;
resumes use a private S3 bucket; SES supplies SMTP. There is no NAT Gateway, ALB,
public database, or public application-container port.

## One-time prerequisites

Provision `infra/aws/staging` only after reviewing the plan. Delegate staging
DNS names (for example `staging.example.com` and `id-staging.example.com`), issue
a certificate usable by Nginx, verify the SES sender, and configure the protected
GitHub `staging` environment. Enter values below `/talensora/staging/` in SSM
Parameter Store manually; never place values in Terraform variables or state.
Install the Compose file and `scripts/deployment` utilities under
`/opt/talensora` through SSM with root ownership.

Create the separate `keycloak` database and least-privilege application and
Keycloak database users through a controlled one-time RDS administration
session. Do not run either service as the RDS master user.

Keycloak must use `start`, `KC_HOSTNAME=https://id-staging.example.com`,
`KC_PROXY_HEADERS=xforwarded`, and internal HTTP only behind Nginx. Set the API
issuer and frontend Keycloak URL to that same HTTPS issuer host. Restrict the
`talensora-web` redirect URI and web origin to the staging application origin.
Google's authorized broker callback is:

```text
https://id-staging.example.com/realms/talensora/broker/google/endpoint
```

Create a clean staging realm; do not copy the local Keycloak database. Preserve
self-registration, verified email, `/external/candidates` as the sole default
group, and controlled internal provisioning. Configure both Keycloak and the API
for SES SMTP on port 587 with authentication and STARTTLS. SES sandbox accounts
can send only to verified recipients.

## Deployment and recovery

The deployment workflow builds immutable SHA-tagged images and invokes
`deploy-staging.sh` through SSM. The script retrieves parameters without printing
them, writes `/etc/talensora/staging.env` as root mode `0600`, validates Compose,
and waits for health. `rollback-staging.sh` restores only previous images; it
never reverses Flyway. Migrations must therefore remain backward compatible.

Use RDS automated backups and take a snapshot before risky migrations. Restore
both Talensora and Keycloak databases together when recovering identity state.
S3 versioning protects objects, but lifecycle expiration must not delete resumes
referenced by applications. EC2 itself is disposable and should be rebuilt from
Terraform/bootstrap. Store break-glass Keycloak credentials outside this repo.

## TLS, logs, and cost controls

Nginx owns ports 80/443 and redirects HTTP to HTTPS. Backend and Keycloak remain
on the private Compose network. Ship Docker/Nginx/Keycloak logs to the Terraform
CloudWatch groups and retain them for the configured finite period. Add modest
EC2 status/CPU/disk and RDS storage/connection alarms after baseline observation.

Avoid NAT Gateway and ALB charges. Monitor EC2, RDS, public IPv4, RDS backups,
EBS snapshots, ECR images, CloudWatch ingestion, S3 versions, SES, and Route 53.
Configure an AWS Budget alert. Off-hours shutdown reduces compute cost, but RDS
has stop-duration limitations and staging will be unavailable while stopped.
