import GoogleIcon from '@mui/icons-material/Google'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

import {
  Alert,
  Button,
  Container,
  Divider,
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
          Sign in securely using your
          Talensora account or Google.
        </Typography>

        <Alert
          severity="info"
          sx={{ mt: 3 }}
        >
          Authentication is securely
          managed through Talensora
          Identity.
        </Alert>

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() =>
            void auth.loginWithGoogle(
              returnTo
            )
          }
          sx={{ mt: 3 }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 3 }}>
          OR
        </Divider>

        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<LoginIcon />}
          onClick={() =>
            void auth.login(returnTo)
          }
        >
          Continue to sign in
        </Button>

        <Divider sx={{ my: 3 }}>
          NEW TO TALENSORA?
        </Divider>

        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={() =>
            void auth.register(
              returnTo
            )
          }
        >
          Create candidate account
        </Button>
      </Paper>
    </Container>
  )
}
