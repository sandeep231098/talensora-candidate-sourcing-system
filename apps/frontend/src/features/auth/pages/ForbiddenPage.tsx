import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

import {
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import {
  Link as RouterLink,
} from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <Container
      maxWidth="sm"
      sx={{ py: 8 }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4 }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <LockOutlinedIcon
            color="warning"
            sx={{ fontSize: 52 }}
          />

          <Typography variant="h4">
            Access denied
          </Typography>

          <Typography color="text.secondary">
            Your account is authenticated,
            but it does not have permission
            to access this area.
          </Typography>

          <Button
            component={RouterLink}
            to="/jobs"
            variant="contained"
          >
            Back to jobs
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}