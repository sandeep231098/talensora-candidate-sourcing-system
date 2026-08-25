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

    return () => {
      active = false
    }
  }, [
    applicationId,
    auth.getValidToken,
    state?.application,
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
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          Your application was submitted
          successfully.
        </Alert>

        <Typography
          variant="h4"
          sx={{ fontWeight: 800 }}
        >
          Application Confirmed
        </Typography>

        {error && (
          <Alert
            severity="warning"
            sx={{ mt: 3 }}
          >
            {error}
          </Alert>
        )}

        <Stack
          sx={{
            gap: 1.5,
            mt: 4,
          }}
        >
          <Typography>
            <strong>
              Application ID:
            </strong>{' '}
            {reference ??
              applicationId}
          </Typography>

          <Typography>
            <strong>
              Job:
            </strong>{' '}
            {jobTitle ??
              'Submitted application'}
          </Typography>

          <Typography>
            <strong>
              Status:
            </strong>{' '}
            {status ?? 'NEW'}
          </Typography>

          {submittedAt && (
            <Typography>
              <strong>
                Submitted:
              </strong>{' '}
              {new Date(
                submittedAt
              ).toLocaleString()}
            </Typography>
          )}
        </Stack>

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