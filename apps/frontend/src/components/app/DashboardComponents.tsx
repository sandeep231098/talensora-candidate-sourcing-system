import type { ReactNode } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'

interface PageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ justifyContent: 'space-between', gap: 2, mb: 4 }}
    >
      <Box>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {description}
        </Typography>
      </Box>
      {actions && (
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}

interface MetricCardProps {
  label: string
  value: number | string
  helper?: string
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>{value}</Typography>
        {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
      </CardContent>
    </Card>
  )
}

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          '&:last-child': { pb: { xs: 2.5, md: 3 } },
        }}
      >
        <Typography component="h2" variant="h6" sx={{ fontWeight: 750 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ mt: description ? 0 : 2 }}>{children}</Box>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  label?: string
}

export function EmptyState({
  title,
  description,
  label = 'Not yet available',
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2.5,
      }}
    >
      <Chip label={label} size="small" sx={{ mb: 1.5 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, maxWidth: 520, mx: 'auto' }}
      >
        {description}
      </Typography>
    </Box>
  )
}

export function DashboardSkeleton() {
  return (
    <Stack sx={{ gap: 2 }} aria-label="Loading dashboard">
      <Skeleton variant="rounded" height={90} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} variant="rounded" height={130} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={280} />
    </Stack>
  )
}
