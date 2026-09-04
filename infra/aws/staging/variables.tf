variable "aws_region" { type = string }
variable "domain_name" { type = string }
variable "github_repository" { type = string }
variable "ami_id" { type = string }
variable "environment" {
  type    = string
  default = "staging"
}
variable "vpc_cidr" {
  type    = string
  default = "10.33.0.0/16"
}
variable "public_subnet_cidr" {
  type    = string
  default = "10.33.0.0/24"
}
variable "private_db_subnet_cidrs" {
  type    = list(string)
  default = ["10.33.10.0/24", "10.33.11.0/24"]
}
variable "ec2_instance_type" {
  type    = string
  default = "t3.small"
}
variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}
variable "rds_master_password" {
  type        = string
  sensitive   = true
  ephemeral   = true
  description = "Injected at apply time from secure operator input; never store in tfvars."
}
variable "rds_master_password_version" {
  type        = number
  default     = 1
  description = "Increment when rotating the write-only RDS master password."
}
variable "rds_backup_retention_days" {
  type    = number
  default = 7
}
variable "rds_deletion_protection" {
  type    = bool
  default = true
}
variable "log_retention_days" {
  type    = number
  default = 14
}
variable "resume_prefix" {
  type    = string
  default = "talensora/resumes"
}
