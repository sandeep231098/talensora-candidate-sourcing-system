import {
  Alert,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import {
  useAuth,
} from '../../../auth/useAuth'

interface RolePortalPageProps {
  title: string
  description: string
}

export function RolePortalPage({
  title,
  description,
}: RolePortalPageProps) {
  const auth = useAuth()

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4 }}
      >
        <Typography variant="h4">
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {description}
        </Typography>

        <Alert
          severity="success"
          sx={{ mt: 3 }}
        >
          Authentication and role-based
          route authorization are active.
        </Alert>

        <Stack
          sx={{
            mt: 4,
            gap: 2,
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
            {auth.user?.email ??
              'Not provided'}
          </Typography>

          <Typography>
            <strong>SmartSkale roles:</strong>
          </Typography>

          <Stack
            direction="row"
            sx={{
              gap: 1,
              flexWrap: 'wrap',
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
      </Paper>
    </Container>
  )
}