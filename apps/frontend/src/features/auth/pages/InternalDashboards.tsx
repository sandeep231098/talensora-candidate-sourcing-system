import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../../../auth/useAuth'
import {
  DashboardSkeleton,
  EmptyState,
  MetricCard,
  PageHeader,
  SectionCard,
} from '../../../components/app/DashboardComponents'
import { ApplicationStatusChip } from '../../../components/common/ApplicationStatusChip'
import {
  fetchAdminApplications,
  fetchAdminRequisitions,
} from '../../recruiter/api/recruiterApi'
import type {
  AdminApplication,
  AdminRequisition,
} from '../../recruiter/types/recruiter'

interface OperationalDashboardProps {
  title: string
  description: string
  admin?: boolean
}

function OperationalDashboard({
  title,
  description,
  admin = false,
}: OperationalDashboardProps) {
  const auth = useAuth()
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [requisitions, setRequisitions] = useState<AdminRequisition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      fetchAdminApplications(auth.getValidToken),
      fetchAdminRequisitions(auth.getValidToken),
    ])
      .then(([applicationData, requisitionData]) => {
        if (active) {
          setApplications(applicationData)
          setRequisitions(requisitionData)
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load operational data.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [auth.getValidToken])

  const count = (status: AdminApplication['status']) =>
    applications.filter((item) => item.status === status).length

  const recentApplications = [...applications]
    .sort((left, right) => Date.parse(right.submittedAt) - Date.parse(left.submittedAt))
    .slice(0, 5)

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        title={title}
        description={description}
        actions={(
          <Button
            component={RouterLink}
            to="/recruiter"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
          >
            Open recruiting workspace
          </Button>
        )}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Stack sx={{ gap: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
              gap: 2,
            }}
          >
            <MetricCard label="Applications" value={applications.length} />
            <MetricCard label="New" value={count('NEW')} />
            <MetricCard label="Reviewed" value={count('REVIEWED')} />
            <MetricCard label="Shortlisted" value={count('SHORTLISTED')} />
            <MetricCard
              label="Published requisitions"
              value={requisitions.filter((item) => item.status === 'PUBLISHED').length}
            />
          </Box>

          <SectionCard
            title="Recent candidate activity"
            description="Latest applications from the secured recruiting workspace."
          >
            {recentApplications.length === 0 ? (
              <EmptyState
                title="No application activity yet"
                description="Recent candidate submissions will appear here when applications are received."
                label="No activity"
              />
            ) : (
              <Stack sx={{ gap: 1.5 }}>
                {recentApplications.map((item) => (
                  <Stack
                    key={item.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{ justifyContent: 'space-between', gap: 1 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 700 }}>
                        {item.candidateFirstName} {item.candidateLastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.jobTitle} · {item.applicationReference}
                      </Typography>
                    </Box>
                    <ApplicationStatusChip status={item.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </SectionCard>

          {admin && (
            <SectionCard title="Platform operations">
              <EmptyState
                title="Operational telemetry is not connected"
                description="User totals, audit history, and uptime analytics require dedicated secured platform APIs."
              />
            </SectionCard>
          )}
        </Stack>
      )}
    </Container>
  )
}

interface ReadOnlyWorkspaceProps {
  title: string
  description: string
  scope: string
  unavailableTitle: string
}

const formatRole = (role: string) =>
  role
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

function ReadOnlyWorkspace({
  title,
  description,
  scope,
  unavailableTitle,
}: ReadOnlyWorkspaceProps) {
  const auth = useAuth()

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader title={title} description={description} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1fr) minmax(0, 2fr)',
          },
          gap: 3,
        }}
      >
        <SectionCard title="Access context">
          <Stack sx={{ gap: 1.5, minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} noWrap>
                {auth.user?.name ?? auth.user?.username ?? 'Authenticated user'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {auth.user?.email ?? 'Email not provided'}
              </Typography>
            </Box>
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {auth.roles.map((role) => (
                <Chip key={role} label={formatRole(role)} size="small" />
              ))}
            </Stack>
            <Typography variant="body2">{scope}</Typography>
          </Stack>
        </SectionCard>

        <SectionCard title="Workspace availability">
          <EmptyState
            title={unavailableTitle}
            description="No records are simulated. Additional access will appear only when a secured backend capability is available."
          />
        </SectionCard>
      </Box>
    </Container>
  )
}

export function HrDashboardPage() {
  return (
    <OperationalDashboard
      title="HR Dashboard"
      description="Monitor candidate pipeline activity and open hiring demand."
    />
  )
}

export function AdminDashboardPage() {
  return (
    <OperationalDashboard
      title="Admin Dashboard"
      description="Review current recruiting operations and platform capability status."
      admin
    />
  )
}

export function HiringManagerDashboardPage() {
  return (
    <ReadOnlyWorkspace
      title="Hiring Manager Workspace"
      description="A focused view of currently supported hiring responsibilities."
      scope="This role remains read-oriented until requisition assignment is modeled."
      unavailableTitle="Assigned requisition workflow is not yet available"
    />
  )
}

export function AuditorDashboardPage() {
  return (
    <ReadOnlyWorkspace
      title="Audit & Compliance Workspace"
      description="Review authenticated access scope and compliance capability status."
      scope="This workspace is read-only and exposes no candidate records or mutation controls."
      unavailableTitle="Audit event history requires a dedicated audit API"
    />
  )
}

export function AccountsDashboardPage() {
  return (
    <ReadOnlyWorkspace
      title="Accounts Workspace"
      description="A dedicated home for supported recruiting finance operations."
      scope="No finance endpoints are currently exposed to this role."
      unavailableTitle="Finance integration is not yet implemented"
    />
  )
}
