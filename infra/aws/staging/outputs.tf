output "ec2_instance_id" { value = aws_instance.staging.id }
output "ec2_public_ip" { value = aws_eip.staging.public_ip }
output "rds_endpoint" { value = aws_db_instance.postgres.address }
output "resume_bucket" { value = aws_s3_bucket.resumes.id }
output "backend_repository_url" { value = aws_ecr_repository.backend.repository_url }
output "frontend_repository_url" { value = aws_ecr_repository.frontend.repository_url }
output "github_deployment_role_arn" { value = aws_iam_role.github_deploy.arn }
output "secret_parameter_path" { value = local.parameter_path }
