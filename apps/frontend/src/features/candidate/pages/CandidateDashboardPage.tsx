import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
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
import { formatDateTime } from '../../../utils/formatters'
import {
  fetchCandidateProfile,
  fetchCurrentResume,
  fetchEducation,
  fetchExperience,
  fetchMyApplications,
} from '../api/candidateApi'
import type {
  CandidateApplicationSummary,
  CandidateProfile,
  ResumeResponse,
} from '../types/candidate'

export function CandidateDashboardPage() {
  const auth = useAuth()
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [resume, setResume] = useState<ResumeResponse | null>(null)
  const [applications, setApplications] = useState<CandidateApplicationSummary[]>([])
  const [supportingSections, setSupportingSections] = useState(0)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.allSettled([
      fetchCandidateProfile(auth.getValidToken),
      fetchCurrentResume(auth.getValidToken),
      fetchMyApplications(auth.getValidToken),
      fetchEducation(auth.getValidToken),
      fetchExperience(auth.getValidToken),
    ]).then((results) => {
      if (!active) return

      const [profileResult, resumeResult, applicationsResult, educationResult, experienceResult] = results
      const failureCount = results.filter((result) => result.status === 'rejected').length

      if (profileResult.status === 'fulfilled') setProfile(profileResult.value)
      if (resumeResult.status === 'fulfilled') setResume(resumeResult.value)
      if (applicationsResult.status === 'fulfilled') setApplications(applicationsResult.value)

      const hasEducation = educationResult.status === 'fulfilled' && educationResult.value.length > 0
      const hasExperience = experienceResult.status === 'fulfilled' && experienceResult.value.length > 0
      const fresher = profileResult.status === 'fulfilled' && Boolean(profileResult.value?.fresher)
      setSupportingSections(Number(hasEducation) + Number(fresher || hasExperience))

      if (failureCount === results.length) {
        setWarning('Your dashboard is temporarily unavailable. Please refresh and try again.')
      } else if (failureCount > 0) {
        setWarning('Some dashboard details could not be refreshed. Available information is shown below.')
      }
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [auth.getValidToken])

  const completeness = useMemo(
    () => Math.round(((profile ? 1 : 0) + (resume ? 1 : 0) + supportingSections) / 4 * 100),
    [profile, resume, supportingSections],
  )

  const recentApplications = [...applications]
    .sort((left, right) => Date.parse(right.submittedAt) - Date.parse(left.submittedAt))
    .slice(0, 4)

  const statusCount = (status: CandidateApplicationSummary['status']) =>
    applications.filter((item) => item.status === status).length

  const firstName = profile?.firstName ?? auth.user?.name?.split(' ')[0] ?? 'there'

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Keep your profile ready and stay on top of every opportunity."
        actions={(
          <>
            <Button
              component={RouterLink}
              to="/candidate/profile"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
            >
              Edit profile
            </Button>
            <Button
              component={RouterLink}
              to="/jobs"
              variant="contained"
              startIcon={<SearchOutlinedIcon />}
            >
              Browse jobs
            </Button>
          </>
        )}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <Stack sx={{ gap: 3 }}>
          {warning && <Alert severity="warning">{warning}</Alert>}

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
            <MetricCard label="Applications" value={applications.length} helper="Total submitted" />
            <MetricCard label="New" value={statusCount('NEW')} />
            <MetricCard label="Reviewed" value={statusCount('REVIEWED')} />
            <MetricCard label="Shortlisted" value={statusCount('SHORTLISTED')} />
            <MetricCard label="Active resume" value={resume ? `Version ${resume.resumeVersion}` : 'Not uploaded'} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 2fr) minmax(280px, 1fr)',
              },
              gap: 3,
            }}
          >
            <SectionCard
              title="Recent applications"
              description="Your latest submitted applications, newest first."
            >
              {recentApplications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Browse published opportunities when you are ready to submit your first application."
                  label="Get started"
                />
              ) : (
                <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                  {recentApplications.map((application) => (
                    <Stack
                      key={application.applicationId}
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{ justifyContent: 'space-between', gap: 1.5, py: 1.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>
                          {application.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.applicationReference} · {formatDateTime(application.submittedAt)}
                        </Typography>
                      </Box>
                      <ApplicationStatusChip status={application.status} />
                    </Stack>
                  ))}
                </Stack>
              )}
              <Button component={RouterLink} to="/candidate/applications" sx={{ mt: 2 }}>
                View all applications
              </Button>
            </SectionCard>

            <SectionCard
              title="Profile readiness"
              description="Complete these essentials before applying."
            >
              <Stack sx={{ gap: 2 }}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2">Completeness</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{completeness}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={completeness}
                    aria-label={`Profile completeness ${completeness}%`}
                    sx={{ mt: 1, height: 8, borderRadius: 8 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {resume
                    ? `${resume.originalFilename} is your active resume.`
                    : 'Add a resume to become application-ready.'}
                </Typography>
                <Button component={RouterLink} to="/candidate/profile" variant="outlined">
                  Manage profile and resume
                </Button>
              </Stack>
            </SectionCard>
          </Box>
        </Stack>
      )}
    </Container>
  )
}
