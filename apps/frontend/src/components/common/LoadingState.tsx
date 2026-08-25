import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />

      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}