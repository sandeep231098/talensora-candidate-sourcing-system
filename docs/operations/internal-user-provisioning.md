# Internal User Provisioning

Talensora internal access is assigned only by an authorized Keycloak operator. Public registration and Google login create candidate identities; neither grants internal privileges.

## Prerequisites

- The Talensora Keycloak service is already running.
- The target user already exists in the `talensora` realm.
- Run from a PowerShell session with Docker Compose access.
- Provide `TALENSORA_KEYCLOAK_ADMIN_USERNAME` and `TALENSORA_KEYCLOAK_ADMIN_PASSWORD`, or enter them when securely prompted. Never save credentials in the repository.

## Supported roles

| Script role | Keycloak group | Effective roles |
|---|---|---|
| `recruiter` | `/internal/recruiters` | `RECRUITER` |
| `admin` | `/internal/admins` | `ADMIN` |
| `hr` | `/internal/hr` | `HR`, `RECRUITER` |
| `hiring-manager` | `/internal/hiring-managers` | `HIRING_MANAGER` |
| `auditor` | `/internal/auditors` | `AUDITOR` |
| `accounts` | `/internal/accounts` | `ACCOUNTS` |

## Provision an existing user

```powershell
.\scripts\keycloak\provision-internal-user.ps1 `
  -Identifier 'internal.user@example.invalid' `
  -InternalRole recruiter
```

The script requires one exact username or email match. It removes `/external/candidates` and any other `/internal/*` membership before assigning the approved group. Removing the candidate group prevents a privileged identity from retaining public candidate access. The script never creates users, changes passwords, or assigns realm roles directly.

After success, review the reported group and effective roles. The user must sign out and re-authenticate so Keycloak issues a token with current roles. Running the same command again is safe.

## Roll back to candidate-only access

In the Keycloak Admin Console, select the exact user in the `talensora` realm. Remove every `/internal/*` membership, add `/external/candidates`, and verify that `CANDIDATE` is the only Talensora application role. Require the user to sign out and re-authenticate.

Never configure an internal group as a realm default or Google identity-provider mapper. Public and social-login users must not be able to select an internal group.
