import {
  Alert,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  Link as RouterLink,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  LoadingState,
} from '../../../components/common/LoadingState'
import { ApplicationStatusChip } from '../../../components/common/ApplicationStatusChip'

import {
  fetchMyApplications,
} from '../api/candidateApi'

import type {
  CandidateApplicationSummary,
} from '../types/candidate'

export function MyApplicationsPage() {
  const auth = useAuth()

  const [
    applications,
    setApplications,
  ] = useState<
    CandidateApplicationSummary[]
  >([])

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

  const [retryCount, setRetryCount] = useState(0)

  const loadApplications =
    useCallback(
      () =>
        fetchMyApplications(
          auth.getValidToken
        ),
      [auth.getValidToken]
    )

  useEffect(() => {
    let active = true

    loadApplications()
      .then((data) => {
        if (active) {
          setApplications(data)
          setError(null)
        }
      })
      .catch(
        (loadError: unknown) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Unable to load applications.'
            )
          }
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
  }, [loadApplications, retryCount])

  if (loading) {
    return (
      <LoadingState message="Loading your applications..." />
    )
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 5 }}
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
        <div>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            My Applications
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Track every job application
            submitted with this account.
          </Typography>
        </div>

        <Button
          component={RouterLink}
          to="/jobs"
          variant="contained"
        >
          Find Jobs
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => {
              setLoading(true)
              setRetryCount((count) => count + 1)
            }}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error &&
        applications.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6">
              No applications yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Browse available jobs and
              submit your first application.
            </Typography>
          </Paper>
        )}

      <Stack sx={{ gap: 2 }}>
        {applications.map(
          (application) => (
            <Paper
              key={
                application.applicationId
              }
              variant="outlined"
              sx={{ p: 3 }}
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
                }}
              >
                <div>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {application.jobTitle}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      application.department
                    }
                    {' · '}
                    {
                      application.location
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    {
                      application
                        .applicationReference
                    }
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Submitted{' '}
                    {new Date(
                      application.submittedAt
                    ).toLocaleString()}
                  </Typography>
                </div>

                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    alignItems:
                      'flex-start',
                  }}
                >
                  <ApplicationStatusChip status={application.status} />

                  <Chip
                    variant="outlined"
                    label={
                      `Resume V${application.resumeVersion}`
                    }
                  />
                </Stack>
              </Stack>
            </Paper>
          )
        )}
      </Stack>
    </Container>
  )
}
