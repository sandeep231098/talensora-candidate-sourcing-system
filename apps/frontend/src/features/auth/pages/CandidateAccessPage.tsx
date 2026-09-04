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
  useState,
} from 'react'

import { useAuth } from '../../../auth/useAuth'
import { ensureApiSuccess } from '../../../api/apiError'

import {
  authenticatedFetch,
} from '../api/authenticatedFetch'

export function CandidateAccessPage() {
  const auth = useAuth()

  const [apiResult, setApiResult] =
    useState<string | null>(null)

  const [apiError, setApiError] =
    useState<string | null>(null)

  const verifyProtectedApi =
    async () => {
      setApiResult(null)
      setApiError(null)

      try {
        const response =
          await authenticatedFetch(
            '/api/v1/candidate/applications',
            auth.getValidToken
          )

        await ensureApiSuccess(response)

        const applications =
          await response.json()

        const count =
          Array.isArray(applications)
            ? applications.length
            : 0

        setApiResult(
          `Protected API access successful. Applications found: ${count}`
        )
      } catch (error) {
        setApiError(
          error instanceof Error
            ? error.message
            : 'Protected API test failed.'
        )
      }
    }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4 }}
      >
        <Typography variant="h4">
          Candidate access
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Authentication and role
          authorization are working.
        </Typography>

        <Stack
          sx={{
            mt: 4,
            gap: 1,
          }}
        >
          <Typography>
            <strong>User:</strong>{' '}
            {auth.user?.name ??
              auth.user?.username ??
              'Authenticated user'}
          </Typography>

          <Typography>
            <strong>Email:</strong>{' '}
            {auth.user?.email ?? 'Not provided'}
          </Typography>

          <Typography>
            <strong>Roles:</strong>
          </Typography>

          <Stack
            direction="row"
            sx={{
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {auth.roles.map(
              (role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                />
              )
            )}
          </Stack>
        </Stack>

        <Button
          variant="contained"
          onClick={() =>
            void verifyProtectedApi()
          }
          sx={{ mt: 4 }}
        >
          Verify protected backend API
        </Button>

        {apiResult && (
          <Alert
            severity="success"
            sx={{ mt: 3 }}
          >
            {apiResult}
          </Alert>
        )}

        {apiError && (
          <Alert
            severity="error"
            sx={{ mt: 3 }}
          >
            {apiError}
          </Alert>
        )}
      </Paper>
    </Container>
  )
}
