# Talensora AWS staging foundation

This Terraform creates staging infrastructure but intentionally creates no
secret values, TLS certificate, DNS record, SES identity, or Terraform backend.
Review `docs/operations/aws-staging.md` before applying.

```sh
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -var-file=terraform.tfvars
```

Copy `terraform.tfvars.example` to an ignored `terraform.tfvars` and replace only
account-specific non-secret values. Configure a remote encrypted state backend
with locking before team use; its creation is deliberately outside this module.
Populate `/talensora/staging/` Standard/SecureString parameters separately.
Inject the initial RDS master password only through the ephemeral
`TF_VAR_rds_master_password` process environment at apply time; never add it to
a tfvars file. The write-only provider argument keeps it out of Terraform state.
Use an approved Amazon Linux 2023 AMI; the bootstrap script installs the pinned
Docker Compose plugin and assumes its `dnf`/systemd environment.
