import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import {
  useEffect,
  useState,
} from 'react'

import {
  Link as RouterLink,
  useLocation,
  useParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  LoadingState,
} from '../../../components/common/LoadingState'

import {
  fetchMyApplications,
} from '../api/candidateApi'

import type {
  ApplicationResponse,
  CandidateApplicationSummary,
  PublicJob,
} from '../types/candidate'

interface ConfirmationState {
  application?: ApplicationResponse
  job?: PublicJob
}

export function ApplicationConfirmationPage() {
  const auth = useAuth()

  const {
    applicationId,
  } = useParams()

  const location =
    useLocation()

  const state =
    location.state as
      | ConfirmationState
      | null

  const [
    summary,
    setSummary,
  ] = useState<
    CandidateApplicationSummary | null
  >(null)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    restoring,
    setRestoring,
  ] = useState(
    !state?.application &&
      Boolean(applicationId)
  )

  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (
      state?.application ||
      !applicationId
    ) {
      return
    }

    let active = true

    fetchMyApplications(
      auth.getValidToken
    )
      .then(
        (applications) => {
          if (!active) {
            return
          }

          const match =
            applications.find(
              (application) =>
                application
                  .applicationId ===
                applicationId
            )

          setSummary(
            match ?? null
          )

          if (!match) {
            setError(
              'This application confirmation is unavailable. Open My Applications to view your submitted applications.'
            )
          }
        }
      )
      .catch(
        (loadError: unknown) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Unable to load confirmation.'
            )
          }
        }
      )
      .finally(() => {
        if (active) {
          setRestoring(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    applicationId,
    auth.getValidToken,
    state?.application,
    retryCount,
  ])

  const reference =
    state?.application
      ?.applicationReference ??
    summary?.applicationReference

  const status =
    state?.application?.status ??
    summary?.status

  const submittedAt =
    state?.application
      ?.submittedAt ??
    summary?.submittedAt

  const jobTitle =
    state?.job?.jobTitle ??
    summary?.jobTitle

  const confirmationAvailable =
    Boolean(
      reference &&
      status &&
      submittedAt &&
      jobTitle
    )

  if (restoring) {
    return (
      <LoadingState message="Restoring application confirmation..." />
    )
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 7 }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {confirmationAvailable && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Your application was submitted
            successfully.
          </Alert>
        )}

        <Typography
          variant="h4"
          sx={{ fontWeight: 800 }}
        >
          Application Confirmed
        </Typography>

        {!confirmationAvailable && (
          <Alert
            severity="error"
            sx={{ mt: 3 }}
            action={applicationId ? (
              <Button color="inherit" size="small" onClick={() => {
                setError(null)
                setRestoring(true)
                setRetryCount((count) => count + 1)
              }}>
                Retry
              </Button>
            ) : undefined}
          >
            {error ??
              'This application confirmation is unavailable. Open My Applications to view your submitted applications.'}
          </Alert>
        )}

        {confirmationAvailable && (
          <Stack
            sx={{
              gap: 1.5,
              mt: 4,
            }}
          >
            <Typography>
              <strong>
                Application reference:
              </strong>{' '}
              {reference}
            </Typography>

            <Typography>
              <strong>
                Job:
              </strong>{' '}
              {jobTitle}
            </Typography>

            <Typography>
              <strong>
                Status:
              </strong>{' '}
              {status}
            </Typography>

            <Typography>
              <strong>
                Submitted:
              </strong>{' '}
              {new Date(
                submittedAt ?? ''
              ).toLocaleString()}
            </Typography>
          </Stack>
        )}

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          sx={{
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            component={RouterLink}
            to="/candidate/applications"
            variant="contained"
          >
            My Applications
          </Button>

          <Button
            component={RouterLink}
            to="/jobs"
            variant="outlined"
          >
            Browse More Jobs
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
