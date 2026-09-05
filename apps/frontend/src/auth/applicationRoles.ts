export const APPLICATION_ROLES = [
  'ADMIN',
  'HR',
  'RECRUITER',
  'HIRING_MANAGER',
  'AUDITOR',
  'ACCOUNTS',
  'CANDIDATE',
] as const

export type ApplicationRole =
  (typeof APPLICATION_ROLES)[number]

const applicationRoleSet =
  new Set<string>(APPLICATION_ROLES)

export const filterApplicationRoles = (
  roles: string[],
): ApplicationRole[] =>
  roles.filter(
    (role): role is ApplicationRole =>
      applicationRoleSet.has(role),
  )

export interface PortalDefinition {
  role: ApplicationRole
  path: string
  label: string
}

export const PORTALS:
  readonly PortalDefinition[] = [
    {
      role: 'ADMIN',
      path: '/admin',
      label: 'Admin Portal',
    },
    {
      role: 'HR',
      path: '/hr',
      label: 'HR Portal',
    },
    {
      role: 'RECRUITER',
      path: '/recruiter',
      label: 'Recruiter Portal',
    },
    {
      role: 'HIRING_MANAGER',
      path: '/hiring-manager',
      label: 'Hiring Manager',
    },
    {
      role: 'AUDITOR',
      path: '/auditor',
      label: 'Audit Portal',
    },
    {
      role: 'ACCOUNTS',
      path: '/accounts',
      label: 'Accounts Portal',
    },
    {
      role: 'CANDIDATE',
      path: '/candidate/dashboard',
      label: 'Candidate Portal',
    },
  ]

export const getPrimaryPortal = (
  roles: string[],
): PortalDefinition | null =>
  PORTALS.find(
    (portal) =>
      roles.includes(portal.role),
  ) ?? null
