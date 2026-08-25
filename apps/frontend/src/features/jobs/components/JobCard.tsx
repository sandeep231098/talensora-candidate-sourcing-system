import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined'

import { Link as RouterLink } from 'react-router-dom'

import type { Job } from '../types/job'

import {
  formatDate,
  formatEnumLabel,
} from '../../../utils/formatters'

interface JobCardProps {
  job: Job
}

export function JobCard({
  job,
}: JobCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition:
          'transform 160ms ease, box-shadow 160ms ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            '0 12px 32px rgba(25, 35, 60, 0.10)',
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              gutterBottom
            >
              {job.jobTitle}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {job.requisitionId}
            </Typography>
          </Box>

          <Chip
            label={formatEnumLabel(
              job.employmentType
            )}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack
          spacing={1.2}
          sx={{ mt: 3 }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <BusinessIcon
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              {job.department}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <LocationOnOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              {job.location}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <WorkHistoryOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              {job.experienceRange}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 3,
          }}
        >
          Posted {formatDate(job.postedAt)}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          component={RouterLink}
          to={`/jobs/${job.id}`}
          endIcon={<ArrowForwardIcon />}
        >
          View details
        </Button>
      </CardActions>
    </Card>
  )
}