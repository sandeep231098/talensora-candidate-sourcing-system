import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  downloadApplicationResume,
  fetchAdminApplicationDetail,
  updateApplicationStatus,
} from '../api/recruiterApi'

import type {
  AdminApplicationDetail,
  ApplicationStatus,
} from '../types/recruiter'
import { ApplicationStatusChip } from '../../../components/common/ApplicationStatusChip'
import { APPLICATION_STATUSES, formatApplicationStatus } from '../../../types/applicationStatus'

const formatBytes = (
  bytes: number,
): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    bytes / (1024 * 1024)
  ).toFixed(1)} MB`
}

const formatExperience = (
  months: number,
): string => {
  const years =
    Math.floor(months / 12)

  const remainingMonths =
    months % 12

  if (years === 0) {
    return `${remainingMonths} months`
  }

  if (remainingMonths === 0) {
    return `${years} years`
  }

  return `${years} years ${remainingMonths} months`
}

export function RecruiterApplicationReviewPage() {
  const auth = useAuth()

  const {
    applicationId,
  } = useParams()

  const [
    detail,
    setDetail,
  ] =
    useState<AdminApplicationDetail | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    updating,
    setUpdating,
  ] = useState(false)

  const [
    downloading,
    setDownloading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  )

  useEffect(() => {
    let active = true

    if (!applicationId) {
      return () => {
        active = false
      }
    }

    fetchAdminApplicationDetail(
      applicationId,
      auth.getValidToken,
    )
      .then((response) => {
        if (active) {
          setDetail(response)
        }
      })
      .catch((caught: unknown) => {
        if (!active) {
          return
        }

        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load application.'
        )
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    applicationId,
    auth.getValidToken,
  ])

  const handleStatusChange =
    async (
      status: ApplicationStatus,
    ) => {
      if (
        !detail ||
        detail.application.status ===
          status
      ) {
        return
      }

      setUpdating(true)
      setError(null)
      setSuccess(null)

      try {
        const updated =
          await updateApplicationStatus(
            detail.application.id,
            status,
            auth.getValidToken,
          )

        setDetail({
          ...detail,
          application: updated,
        })

        setSuccess(
          `Application status changed to ${formatApplicationStatus(status)}.`
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to update status.'
        )
      } finally {
        setUpdating(false)
      }
    }

  const handleDownload =
    async () => {
      if (!detail) {
        return
      }

      setDownloading(true)
      setError(null)

      try {
        await downloadApplicationResume(
          detail.application,
          auth.getValidToken,
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to download resume.'
        )
      } finally {
        setDownloading(false)
      }
    }

  if (!applicationId) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 5,
        }}
      >
        <Alert severity="error">
          Application ID is missing.
        </Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
          }}
        >
          Loading application...
        </Typography>

        <LinearProgress />
      </Container>
    )
  }

  if (!detail) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 5,
        }}
      >
        <Alert severity="error">
          {error ??
            'Application could not be loaded.'}
        </Alert>

        <Button
          component={Link}
          to="/recruiter"
          sx={{
            mt: 2,
          }}
        >
          Back to Recruiter Dashboard
        </Button>
      </Container>
    )
  }

  const {
    application,
    candidateProfile,
    education,
    workExperience,
  } = detail

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Application Review
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            {
              application.applicationReference
            }
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            component={Link}
            to="/recruiter"
            variant="outlined"
          >
            Dashboard
          </Button>

          <Button
            component={Link}
            to="/recruiter/requisitions"
            variant="outlined"
          >
            Requisitions
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
          onClose={() =>
            setSuccess(null)
          }
        >
          {success}
        </Alert>
      )}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'space-between',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                {application.jobTitle}
              </Typography>

              <Typography
                color="text.secondary"
              >
                {
                  application.requisitionNumber
                }
                {' · '}
                {application.department}
                {' · '}
                {application.jobLocation}
              </Typography>
            </Box>

            <ApplicationStatusChip status={application.status} />
          </Box>

          <Divider
            sx={{
              my: 3,
            }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Application ID
              </Typography>

              <Typography>
                {
                  application.applicationReference
                }
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Submitted
              </Typography>

              <Typography>
                {new Date(
                  application.submittedAt
                ).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              maxWidth: 320,
            }}
          >
            <TextField
              id="application-review-status"
              name="applicationStatus"
              select
              fullWidth
              size="small"
              label="Application Status"
              value={application.status}
              disabled={updating}
              onChange={(event) =>
                void handleStatusChange(
                  event.target
                    .value as
                      ApplicationStatus
                )
              }
            >
              {APPLICATION_STATUSES.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {formatApplicationStatus(
                      status
                    )}
                  </MenuItem>
                )
              )}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Candidate Profile
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Name
              </Typography>

              <Typography>
                {candidateProfile.firstName}
                {' '}
                {candidateProfile.lastName}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Email
              </Typography>

              <Typography>
                {candidateProfile.email}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Mobile
              </Typography>

              <Typography>
                {
                  candidateProfile.mobileNumber
                }
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Current Location
              </Typography>

              <Typography>
                {
                  candidateProfile.currentLocation
                }
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Current Company
              </Typography>

              <Typography>
                {
                  candidateProfile.currentCompany ??
                  'Not provided'
                }
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Total Experience
              </Typography>

              <Typography>
                {candidateProfile.fresher
                  ? 'Fresher'
                  : formatExperience(
                      candidateProfile
                        .totalExperienceMonths
                    )}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Notice Period
              </Typography>

              <Typography>
                {
                  candidateProfile.noticePeriod ??
                  'Not provided'
                }
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Date of Birth
              </Typography>

              <Typography>
                {
                  candidateProfile.dateOfBirth ??
                  'Not provided'
                }
              </Typography>
            </Box>
          </Box>

          {candidateProfile.currentAddress && (
            <Box
              sx={{
                mt: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Address
              </Typography>

              <Typography>
                {
                  candidateProfile.currentAddress
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Education
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {education.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              No education information.
            </Typography>
          ) : (
            education.map(
              (item) => (
                <Box
                  key={item.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border:
                      '1px solid',
                    borderColor:
                      'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {
                      item.degreeQualification
                    }
                  </Typography>

                  <Typography>
                    {
                      item.institutionUniversity
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    {item.specialization ??
                      'General'}
                    {' · '}
                    {item.yearOfPassing}
                    {item.gradeScore
                      ? ` · ${item.gradeScore}`
                      : ''}
                  </Typography>
                </Box>
              )
            )
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Work Experience
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {workExperience.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              No work experience information.
            </Typography>
          ) : (
            workExperience.map(
              (item) => (
                <Box
                  key={item.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border:
                      '1px solid',
                    borderColor:
                      'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {item.jobTitle}
                  </Typography>

                  <Typography>
                    {item.employerName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.startDate}
                    {' - '}
                    {item.currentlyWorkingHere
                      ? 'Present'
                      : item.endDate}
                  </Typography>

                  {item.keyResponsibilities && (
                    <Typography
                      sx={{
                        mt: 1,
                        whiteSpace:
                          'pre-line',
                      }}
                    >
                      {
                        item.keyResponsibilities
                      }
                    </Typography>
                  )}
                </Box>
              )
            )
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Cover Note
          </Typography>

          <Typography
            sx={{
              whiteSpace: 'pre-line',
            }}
          >
            {application.coverNote ??
              'No cover note was provided.'}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Submitted Resume
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            This is the exact resume version
            pinned to this application.
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            {application.resumeFilename}
          </Typography>

          <Typography
            color="text.secondary"
          >
            Version
            {' '}
            {application.resumeVersion}
            {' · '}
            {application.resumeFileType}
            {' · '}
            {formatBytes(
              application.resumeSizeBytes
            )}
          </Typography>

          <Button
            variant="contained"
            disabled={downloading}
            onClick={() =>
              void handleDownload()
            }
            sx={{
              mt: 2,
            }}
          >
            {downloading
              ? 'Downloading...'
              : 'Download Submitted Resume'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
