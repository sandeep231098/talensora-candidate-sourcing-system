import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BusinessIcon from '@mui/icons-material/Business'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkHistoryOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined'

import {
  useEffect,
  useState,
} from 'react'

import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { ErrorState } from '../../../components/common/ErrorState'
import { LoadingState } from '../../../components/common/LoadingState'

import {
  useAuth,
} from '../../../auth/useAuth'
import { fetchPublicJob } from '../api/jobsApi'

import type { Job } from '../types/job'

import {
  formatDate,
  formatEnumLabel,
} from '../../../utils/formatters'

export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()

  const [job, setJob] =
    useState<Job | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [shareMessage, setShareMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    fetchPublicJob(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJob(null)
          setError(
            'This job could not be found or is no longer publicly available.'
          )
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleShare = async () => {
    if (!job) {
      return
    }

    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: job.jobTitle,
          text: `${job.jobTitle} at Talensora`,
          url,
        })

        setShareMessage(
          'Job shared successfully.'
        )

        return
      }

      await navigator.clipboard.writeText(
        url
      )

      setShareMessage(
        'Job link copied to clipboard.'
      )
    } catch {
      setShareMessage(
        'Unable to share this job.'
      )
    }
  }

  const handleApply = () => {
    if (!job) {
      return
    }

    if (auth.authenticated) {
      if (auth.hasRole('CANDIDATE')) {
        navigate(
          `/jobs/${job.id}/apply`
        )
      }

      return
    }

    const returnTo =
      encodeURIComponent(
        `/jobs/${job.id}/apply`
      )

    navigate(
      `/login?returnTo=${returnTo}`
    )
  }

  const canApply =
    !auth.authenticated ||
    auth.hasRole('CANDIDATE')

  const isAuthenticatedNonCandidate =
    auth.authenticated &&
    !auth.hasRole('CANDIDATE')

  if (!id) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 6 }}
      >
        <ErrorState message="Job ID is missing." />
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <LoadingState message="Loading job details..." />
      </Container>
    )
  }

  if (error || !job) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 6 }}
      >
        <ErrorState
          message={
            error ??
            'Unable to load this job.'
          }
        />
      </Container>
    )
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 5 }}
    >
      <Button
        component={RouterLink}
        to="/jobs"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to jobs
      </Button>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 2fr) 340px',
          },
          gap: 4,
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: { xs: 3, md: 4 } }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                color="primary"
              >
                {job.requisitionId}
              </Typography>

              <Typography
                variant="h3"
                sx={{ mt: 1 }}
              >
                {job.jobTitle}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Posted {formatDate(job.postedAt)}
              </Typography>
            </Box>

            <Chip
              label={formatEnumLabel(
                job.employmentType
              )}
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          </Stack>

          <Stack
            direction="row"
            useFlexGap
            sx={{
              mt: 4,
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            <Stack
              direction="row"
              sx={{
                gap: 1,
                alignItems: 'center',
              }}
            >
              <BusinessIcon color="action" />
              <Typography>
                {job.department}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                gap: 1,
                alignItems: 'center',
              }}
            >
              <LocationOnOutlinedIcon color="action" />
              <Typography>
                {job.location}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                gap: 1,
                alignItems: 'center',
              }}
            >
              <WorkHistoryOutlinedIcon color="action" />
              <Typography>
                {job.experienceRange}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                gap: 1,
                alignItems: 'center',
              }}
            >
              <WorkOutlineIcon color="action" />
              <Typography>
                {job.numberOfOpenings}{' '}
                {job.numberOfOpenings === 1
                  ? 'opening'
                  : 'openings'}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5">
            About the role
          </Typography>

          <Typography
            component="div"
            sx={{
              mt: 2,
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              color: 'text.secondary',
            }}
          >
            {job.jobDescription}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            position: {
              md: 'sticky',
            },
            top: {
              md: 96,
            },
          }}
        >
          <Typography variant="h6">
            Interested in this role?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Sign in or create your
            candidate account to continue
            with the application.
          </Typography>
          {canApply && (
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={
                <SendOutlinedIcon />
              }
              onClick={handleApply}
            >
              Apply now
            </Button>
          )}

          {isAuthenticatedNonCandidate && (
            <Button
              fullWidth
              size="large"
              variant="contained"
              component={RouterLink}
              to="/portal"
            >
              Back to your portal
            </Button>
          )}

          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={
              typeof navigator.share === 'function' ? (
                <ShareOutlinedIcon />
              ) : (
                <ContentCopyIcon />
              )
            }
            onClick={handleShare}
            sx={{ mt: 1.5 }}
          >
            Share job
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Hiring target
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 0.5 }}
          >
            {formatDate(
              job.hiringCompletedBy
            )}
          </Typography>
        </Paper>
      </Box>

      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={3000}
        onClose={() =>
          setShareMessage(null)
        }
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setShareMessage(null)
          }
        >
          {shareMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}