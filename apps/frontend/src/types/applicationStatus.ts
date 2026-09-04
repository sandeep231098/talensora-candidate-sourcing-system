export const APPLICATION_STATUSES = [
  'NEW',
  'REVIEWED',
  'SHORTLISTED',
  'REJECTED',
] as const

export type ApplicationStatus =
  (typeof APPLICATION_STATUSES)[number]

export const formatApplicationStatus = (
  status: ApplicationStatus,
): string =>
  status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
