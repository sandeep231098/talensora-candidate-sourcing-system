import { Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Typography color="primary" sx={{ fontWeight: 800 }}>404</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Page not found</Typography>
          <Typography color="text.secondary">
            The page may have moved, or the address may be incorrect.
          </Typography>
          <Button component={RouterLink} to="/jobs" variant="contained">
            Browse jobs
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
