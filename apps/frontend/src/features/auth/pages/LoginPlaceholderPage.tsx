import LoginIcon from '@mui/icons-material/Login'

import {
  Alert,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material'

import {
  Navigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../../../auth/useAuth'
import { LoadingState } from '../../../components/common/LoadingState'

const normalizeReturnTo = (
  value: string | null,
): string => {
  if (
    value &&
    value.startsWith('/') &&
    !value.startsWith('//')
  ) {
    return value
  }

  return '/candidate'
}

export function LoginPlaceholderPage() {
  const auth = useAuth()

  const [searchParams] =
    useSearchParams()

  const returnTo =
    normalizeReturnTo(
      searchParams.get('returnTo')
    )

  if (!auth.initialized) {
    return (
      <LoadingState message="Preparing secure sign in..." />
    )
  }

  if (auth.authenticated) {
    return (
      <Navigate
        to={returnTo}
        replace
      />
    )
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ py: 8 }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4 }}
      >
        <Typography variant="h4">
          Sign in to Talensora
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Your account is securely
          authenticated through
          Talensora Identity.
        </Typography>

        <Alert
          severity="info"
          sx={{ mt: 3 }}
        >
          You will be redirected to
          Keycloak to complete sign in.
        </Alert>

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={() =>
            void auth.login(returnTo)
          }
          sx={{ mt: 3 }}
        >
          Continue to sign in
        </Button>
      </Paper>
    </Container>
  )
}