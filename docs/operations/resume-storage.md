# Resume Storage Operations

Talensora streams private resume downloads through its API so candidate and
recruiter authorization remains enforced. Local filesystem storage is the
default; S3 is enabled only with `RESUME_STORAGE_TYPE=s3`.

## Configuration

Safe, non-secret S3 settings:

```text
RESUME_STORAGE_TYPE=s3
RESUME_S3_BUCKET=talensora-private-resumes
RESUME_S3_PREFIX=talensora/resumes
AWS_REGION=ap-south-1
```

`RESUME_S3_ENDPOINT` is optional and intended only for an S3-compatible local
integration-test endpoint. The application uses the standard AWS SDK credential
provider chain. Local mode starts without AWS credentials. Deployed workloads
must use an IAM role rather than long-lived access keys.

## Bucket and IAM controls

Keep the bucket private, enable S3 Block Public Access and bucket-owner-enforced
object ownership, prohibit non-HTTPS requests, and enable default encryption.
Do not configure public ACLs or public object URLs. The workload role needs only:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::talensora-private-resumes/talensora/resumes/*"
}
```

`s3:ListBucket` is not required. Define retention and lifecycle rules according
to recruitment and legal requirements; application-linked historical resumes
must not be expired prematurely.

## Existing environments

Talensora uses one storage backend per environment. Before changing an existing
environment from local to S3, copy every object to S3 using its unchanged
database `storage_key`, beneath the configured prefix, and verify downloads.
This feature does not perform automatic object migration or create AWS resources.
