import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import {
  Link as RouterLink,
  useParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  downloadApplicationResume,
  exportRequisitionApplications,
  fetchAdminRequisitions,
  fetchRequisitionApplications,
  updateApplicationStatus,
} from '../api/recruiterApi'

import {
  ApplicationsTable,
} from '../components/ApplicationsTable'

import type {
  AdminApplication,
  AdminRequisition,
  ApplicationStatus,
} from '../types/recruiter'
import { APPLICATION_STATUSES, formatApplicationStatus } from '../../../types/applicationStatus'

const formatStatus = (
  status: string,
): string =>
  status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )

export function RequisitionApplicationsPage() {
  const auth = useAuth()

  const {
    requisitionId,
  } = useParams()

  const [
    requisition,
    setRequisition,
  ] =
    useState<AdminRequisition | null>(
      null
    )

  const [
    applications,
    setApplications,
  ] =
    useState<AdminApplication[]>(
      []
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    status,
    setStatus,
  ] =
    useState<ApplicationStatus | ''>(
      ''
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    updatingApplicationId,
    setUpdatingApplicationId,
  ] =
    useState<string | null>(
      null
    )

  const [
    downloadingApplicationId,
    setDownloadingApplicationId,
  ] =
    useState<string | null>(
      null
    )

  const [
    exporting,
    setExporting,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    )

  useEffect(() => {
    if (!requisitionId) {
      return
    }

    let active = true

    Promise.all([
      fetchAdminRequisitions(
        auth.getValidToken,
      ),
      fetchRequisitionApplications(
        requisitionId,
        auth.getValidToken,
      ),
    ])
      .then(
        ([
          requisitions,
          loadedApplications,
        ]) => {
          if (!active) {
            return
          }

          const selected =
            requisitions.find(
              (item) =>
                item.id ===
                requisitionId
            ) ?? null

          setRequisition(
            selected
          )

          setApplications(
            loadedApplications
          )
        }
      )
      .catch(
        (caught: unknown) => {
          if (!active) {
            return
          }

          setError(
            caught instanceof Error
              ? caught.message
              : 'Unable to load requisition applications.'
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
  }, [
    requisitionId,
    auth.getValidToken,
  ])

  const filteredApplications =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase()

      return applications.filter(
        (application) => {
          const statusMatches =
            !status ||
            application.status ===
              status

          if (!statusMatches) {
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
            application
              .requisitionNumber,
            application.jobTitle,
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
      status,
    ])

  const counts =
    useMemo(
      () => ({
        total:
          applications.length,

        newCount:
          applications.filter(
            (item) =>
              item.status === 'NEW'
          ).length,

        reviewed:
          applications.filter(
            (item) =>
              item.status ===
              'REVIEWED'
          ).length,

        shortlisted:
          applications.filter(
            (item) =>
              item.status ===
              'SHORTLISTED'
          ).length,

        rejected:
          applications.filter(
            (item) =>
              item.status ===
              'REJECTED'
          ).length,
      }),
      [applications],
    )

  const handleStatusChange =
    async (
      application: AdminApplication,
      nextStatus: ApplicationStatus,
    ) => {
      if (
        application.status ===
        nextStatus
      ) {
        return
      }

      setUpdatingApplicationId(
        application.id
      )

      setError(null)
      setSuccess(null)

      try {
        const updated =
          await updateApplicationStatus(
            application.id,
            nextStatus,
            auth.getValidToken,
          )

        setApplications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        )

        setSuccess(
          `${updated.applicationReference} changed to ${formatApplicationStatus(updated.status)}.`
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to update application status.'
        )
      } finally {
        setUpdatingApplicationId(
          null
        )
      }
    }

  const handleDownloadResume =
    async (
      application: AdminApplication,
    ) => {
      setDownloadingApplicationId(
        application.id
      )

      setError(null)
      setSuccess(null)

      try {
        await downloadApplicationResume(
          application,
          auth.getValidToken,
        )

        setSuccess(
          `Resume downloaded for ${application.candidateFirstName} ${application.candidateLastName}.`
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to download resume.'
        )
      } finally {
        setDownloadingApplicationId(
          null
        )
      }
    }

  const handleExport =
    async () => {
      if (!requisitionId) {
        return
      }

      setExporting(true)
      setError(null)
      setSuccess(null)

      try {
        await exportRequisitionApplications(
          requisitionId,
          search,
          status,
          auth.getValidToken,
        )

        setSuccess(
          'Applications CSV exported successfully.'
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to export applications.'
        )
      } finally {
        setExporting(false)
      }
    }

  if (!requisitionId) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 5,
        }}
      >
        <Alert severity="error">
          Requisition ID is missing.
        </Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 6,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
          }}
        >
          Loading requisition applications...
        </Typography>

        <LinearProgress />
      </Container>
    )
  }

  const firstApplication =
    applications[0]

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Requisition Applications
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            {requisition
              ? requisition.requisitionId
              : requisitionId}
          </Typography>

          {firstApplication && (
            <Typography
              sx={{
                mt: 0.5,
              }}
            >
              {firstApplication.jobTitle}
              {' · '}
              {firstApplication.department}
              {' · '}
              {firstApplication.jobLocation}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            component={RouterLink}
            to="/recruiter"
            variant="outlined"
          >
            Dashboard
          </Button>

          <Button
            component={RouterLink}
            to="/recruiter/requisitions"
            variant="outlined"
          >
            Requisitions
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError(null)
          }
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess(null)
          }
          sx={{
            mb: 3,
          }}
        >
          {success}
        </Alert>
      )}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Requisition Summary
              </Typography>

              <Typography
                color="text.secondary"
              >
                Review and manage every
                application submitted
                against this requisition.
              </Typography>
            </Box>

            {requisition && (
              <Chip
                label={formatStatus(
                  requisition.status
                )}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs:
              'repeat(2, minmax(0, 1fr))',
            md:
              'repeat(5, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Total
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {counts.total}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              New
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {counts.newCount}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Reviewed
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {counts.reviewed}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Shortlisted
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {counts.shortlisted}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Rejected
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {counts.rejected}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <TextField
              id="requisition-application-search"
              name="applicationSearch"
              label="Search candidate"
              placeholder="Name, email or application ID"
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 320,
                },
              }}
            />

            <TextField
              id="requisition-application-status"
              name="applicationStatus"
              select
              label="Status"
              size="small"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as
                      ApplicationStatus |
                      ''
                )
              }
              sx={{
                minWidth: 180,
              }}
            >
              <MenuItem value="">
                All statuses
              </MenuItem>

              {APPLICATION_STATUSES.map(
                (option) => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {formatApplicationStatus(
                      option
                    )}
                  </MenuItem>
                )
              )}
            </TextField>

            <Button
              variant="outlined"
              onClick={() => {
                setSearch('')
                setStatus('')
              }}
            >
              Clear filters
            </Button>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <Button
              variant="contained"
              disabled={exporting}
              onClick={() =>
                void handleExport()
              }
            >
              {exporting
                ? 'Exporting...'
                : 'Export CSV'}
            </Button>
          </Box>

          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              mb: 2,
            }}
          >
            Showing
            {' '}
            {filteredApplications.length}
            {' '}
            of
            {' '}
            {applications.length}
            {' '}
            applications
          </Typography>

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
              handleDownloadResume
            }
          />
        </CardContent>
      </Card>
    </Container>
  )
}
