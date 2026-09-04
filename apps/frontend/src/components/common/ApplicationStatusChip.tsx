import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'

import {
  formatApplicationStatus,
} from '../../types/applicationStatus'
import type {
  ApplicationStatus,
} from '../../types/applicationStatus'

const colors: Record<ApplicationStatus, ChipProps['color']> = {
  NEW: 'info',
  REVIEWED: 'default',
  SHORTLISTED: 'success',
  REJECTED: 'error',
}

interface ApplicationStatusChipProps {
  status: ApplicationStatus
  size?: ChipProps['size']
}

export function ApplicationStatusChip({
  status,
  size = 'small',
}: ApplicationStatusChipProps) {
  return (
    <Chip
      size={size}
      color={colors[status]}
      label={formatApplicationStatus(status)}
    />
  )
}
