import {
  Paper,
  Typography,
} from '@mui/material'

interface DashboardMetricProps {
  label: string
  value: number
}

export function DashboardMetric({
  label,
  value,
}: DashboardMetricProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 1,
          fontWeight: 800,
        }}
      >
        {value}
      </Typography>
    </Paper>
  )
}