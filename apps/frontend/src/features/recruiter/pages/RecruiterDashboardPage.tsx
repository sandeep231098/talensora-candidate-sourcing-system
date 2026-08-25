import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link as RouterLink,
  useSearchParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  ErrorState,
} from '../../../components/common/ErrorState'

import {
  LoadingState,
} from '../../../components/common/LoadingState'

import {
  ApplicationsTable,
} from '../components/ApplicationsTable'

import {
  DashboardMetric,
} from '../components/DashboardMetric'

import {
  downloadApplicationResume,
  fetchAdminApplications,
  fetchAdminRequisitions,
  updateApplicationStatus,
} from '../api/recruiterApi'

import type {
  AdminApplication,
  AdminRequisition,
  ApplicationStatus,
} from '../types/recruiter'

type StatusFilter =
  | 'ALL'
  | ApplicationStatus

export function RecruiterDashboardPage() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()

  const initialSearch =
    searchParams.get('search') ?? ''

  const [
    applications,
    setApplications,
  ] = useState<AdminApplication[]>(
    []
  )

  const [
    requisitions,
    setRequisitions,
  ] = useState<AdminRequisition[]>(
    []
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    search,
    setSearch,
  ] = useState(initialSearch)

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    'ALL'
  )

  const [
    updatingApplicationId,
    setUpdatingApplicationId,
  ] = useState<string | null>(
    null
  )

  const [
    downloadingApplicationId,
    setDownloadingApplicationId,
  ] = useState<string | null>(
    null
  )

  const [
    actionMessage,
    setActionMessage,
  ] = useState<string | null>(
    null
  )

  const loadDashboard =
    useCallback(
      async () => {
        const [
          applicationData,
          requisitionData,
        ] = await Promise.all([
          fetchAdminApplications(
            auth.getValidToken
          ),
          fetchAdminRequisitions(
            auth.getValidToken
          ),
        ])

        return {
          applicationData,
          requisitionData,
        }
      },
      [auth.getValidToken]
    )

  useEffect(() => {
    let active = true

    loadDashboard()
      .then(
        ({
          applicationData,
          requisitionData,
        }) => {
          if (!active) {
            return
          }

          setApplications(
            applicationData
          )

          setRequisitions(
            requisitionData
          )

          setError(null)
        }
      )
      .catch(
        (loadError: unknown) => {
          if (!active) {
            return
          }

          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load recruiter dashboard.'
          )
        }
      )
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [loadDashboard])

  const refresh =
    async () => {
      setLoading(true)
      setError(null)
      setActionMessage(null)

      try {
        const {
          applicationData,
          requisitionData,
        } = await loadDashboard()

        setApplications(
          applicationData
        )

        setRequisitions(
          requisitionData
        )
      } catch (
        refreshError
      ) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'Unable to refresh dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

  const filteredApplications =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase()

      return applications.filter(
        (application) => {
          const matchesStatus =
            statusFilter === 'ALL' ||
            application.status ===
              statusFilter

          if (!matchesStatus) {
            return false
          }

          if (!normalized) {
            return true
          }

          const searchable = [
            application
              .candidateFirstName,
            application
              .candidateLastName,
            application
              .candidateEmail,
            application
              .applicationReference,
            application.jobTitle,
            application
              .requisitionNumber,
            application.department,
            application
              .candidateLocation,
          ]
            .join(' ')
            .toLowerCase()

          return searchable.includes(
            normalized
          )
        }
      )
    }, [
      applications,
      search,
      statusFilter,
    ])

  const countStatus = (
    status: ApplicationStatus,
  ): number =>
    applications.filter(
      (application) =>
        application.status === status
    ).length

  const publishedRequisitions =
    requisitions.filter(
      (requisition) =>
        requisition.status ===
        'PUBLISHED'
    ).length

  const draftRequisitions =
    requisitions.filter(
      (requisition) =>
        requisition.status === 'DRAFT'
    ).length

  const closedRequisitions =
    requisitions.filter(
      (requisition) =>
        requisition.status ===
        'CLOSED'
    ).length

  const handleStatusChange =
    async (
      application: AdminApplication,
      status: ApplicationStatus,
    ) => {
      if (
        status === application.status
      ) {
        return
      }

      setUpdatingApplicationId(
        application.id
      )

      setActionMessage(null)

      try {
        const updated =
          await updateApplicationStatus(
            application.id,
            status,
            auth.getValidToken
          )

        setApplications(
          (current) =>
            current.map(
              (item) =>
                item.id === updated.id
                  ? updated
                  : item
            )
        )

        setActionMessage(
          `${updated.applicationReference} updated to ${updated.status}.`
        )
      } catch (
        updateError
      ) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : 'Status update failed.'
        )
      } finally {
        setUpdatingApplicationId(
          null
        )
      }
    }

  const handleResumeDownload =
    async (
      application: AdminApplication,
    ) => {
      setDownloadingApplicationId(
        application.id
      )

      setActionMessage(null)

      try {
        await downloadApplicationResume(
          application,
          auth.getValidToken
        )

        setActionMessage(
          `Resume downloaded for ${application.candidateFirstName} ${application.candidateLastName}.`
        )
      } catch (
        downloadError
      ) {
        setError(
          downloadError instanceof Error
            ? downloadError.message
            : 'Resume download failed.'
        )
      } finally {
        setDownloadingApplicationId(
          null
        )
      }
    }

  if (loading) {
    return (
      <LoadingState message="Loading recruiter workspace..." />
    )
  }

  if (error && applications.length === 0) {
    return (
      <ErrorState
        message={error}
      />
    )
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 5,
      }}
    >
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          justifyContent:
            'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            Recruiter Dashboard
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Review requisitions and
            manage candidate
            applications.
          </Typography>
        </Box>

        <Stack
          direction="row"
          sx={{
            gap: 1.5,
          }}
        >
          <Button
            component={RouterLink}
            to="/recruiter/requisitions"
            variant="contained"
          >
            Manage Requisitions
          </Button>

          <Button
            variant="outlined"
            onClick={() =>
              void refresh()
            }
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      )}

      {actionMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setActionMessage(null)
          }
        >
          {actionMessage}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        <DashboardMetric
          label="Total Applications"
          value={
            applications.length
          }
        />

        <DashboardMetric
          label="New"
          value={
            countStatus('NEW')
          }
        />

        <DashboardMetric
          label="Reviewed"
          value={
            countStatus('REVIEWED')
          }
        />

        <DashboardMetric
          label="Shortlisted"
          value={
            countStatus(
              'SHORTLISTED'
            )
          }
        />

        <DashboardMetric
          label="Rejected"
          value={
            countStatus(
              'REJECTED'
            )
          }
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          Requisitions
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(4, 1fr)',
            },
            gap: 2,
            mt: 2,
          }}
        >
          <DashboardMetric
            label="Total"
            value={
              requisitions.length
            }
          />

          <DashboardMetric
            label="Published"
            value={
              publishedRequisitions
            }
          />

          <DashboardMetric
            label="Draft"
            value={
              draftRequisitions
            }
          />

          <DashboardMetric
            label="Closed"
            value={
              closedRequisitions
            }
          />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          sx={{
            justifyContent:
              'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Applications
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {
                filteredApplications
                  .length
              }{' '}
              of {
                applications.length
              } applications
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{
              gap: 2,
            }}
          >
            <TextField
              size="small"
              label="Search applications"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Name, email, job, ID..."
              sx={{
                minWidth: 280,
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
              >
                <MenuItem value="ALL">
                  All statuses
                </MenuItem>

                <MenuItem value="NEW">
                  New
                </MenuItem>

                <MenuItem value="REVIEWED">
                  Reviewed
                </MenuItem>

                <MenuItem value="SHORTLISTED">
                  Shortlisted
                </MenuItem>

                <MenuItem value="REJECTED">
                  Rejected
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <ApplicationsTable
          applications={
            filteredApplications
          }
          updatingApplicationId={
            updatingApplicationId
          }
          downloadingApplicationId={
            downloadingApplicationId
          }
          onStatusChange={
            handleStatusChange
          }
          onDownloadResume={
            handleResumeDownload
          }
        />
      </Paper>
    </Container>
  )
}