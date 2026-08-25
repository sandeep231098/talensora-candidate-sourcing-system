import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material'

import {
  Link as RouterLink,
  useSearchParams,
} from 'react-router-dom'

export function LoginPlaceholderPage() {
  const [searchParams] =
    useSearchParams()

  const returnTo =
    searchParams.get('returnTo') ??
    '/jobs'

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
          Candidate sign in
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Authentication with Keycloak
          will be connected in the next
          frontend feature.
        </Typography>

        <Alert
          severity="info"
          sx={{ mt: 3 }}
        >
          The public careers experience
          remains available without login.
        </Alert>

        <Box sx={{ mt: 3 }}>
          <Button
            component={RouterLink}
            to={returnTo.startsWith('/jobs')
              ? '/jobs'
              : '/jobs'}
            variant="contained"
          >
            Back to jobs
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}