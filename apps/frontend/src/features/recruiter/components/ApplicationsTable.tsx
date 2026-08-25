import {
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import type {
  AdminApplication,
  ApplicationStatus,
} from '../types/recruiter'

interface ApplicationsTableProps {
  applications: AdminApplication[]

  updatingApplicationId:
    string | null

  downloadingApplicationId:
    string | null

  onStatusChange: (
    application: AdminApplication,
    status: ApplicationStatus,
  ) => Promise<void>

  onDownloadResume: (
    application: AdminApplication,
  ) => Promise<void>
}

const statusOptions:
  ApplicationStatus[] = [
    'NEW',
    'REVIEWED',
    'SHORTLISTED',
    'REJECTED',
  ]

const formatStatus = (
  status: ApplicationStatus,
): string =>
  status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )

const formatExperience = (
  months: number,
): string => {
  const years =
    Math.floor(months / 12)

  const remainingMonths =
    months % 12

  if (years === 0) {
    return `${remainingMonths} mo`
  }

  if (remainingMonths === 0) {
    return `${years} yr`
  }

  return `${years} yr ${remainingMonths} mo`
}

const formatSubmittedAt = (
  value: string,
): string =>
  new Intl.DateTimeFormat(
    'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(
    new Date(value)
  )

export function ApplicationsTable({
  applications,
  updatingApplicationId,
  downloadingApplicationId,
  onStatusChange,
  onDownloadResume,
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{
          py: 5,
          textAlign: 'center',
        }}
      >
        No applications match the
        selected filters.
      </Typography>
    )
  }

  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          minWidth: 1150,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>
              Candidate
            </TableCell>

            <TableCell>
              Job
            </TableCell>

            <TableCell>
              Experience
            </TableCell>

            <TableCell>
              Location
            </TableCell>

            <TableCell>
              Applied
            </TableCell>

            <TableCell>
              Resume
            </TableCell>

            <TableCell>
              Status
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {applications.map(
            (application) => {
              const updating =
                updatingApplicationId ===
                application.id

              const downloading =
                downloadingApplicationId ===
                application.id

              return (
                <TableRow
                  key={application.id}
                  hover
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {
                        application
                          .candidateFirstName
                      }{' '}
                      {
                        application
                          .candidateLastName
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        application
                          .candidateEmail
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                      }}
                    >
                      {
                        application
                          .applicationReference
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {
                        application.jobTitle
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        application
                          .requisitionNumber
                      }
                      {' · '}
                      {
                        application.department
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {formatExperience(
                      application
                        .totalExperienceMonths
                    )}
                  </TableCell>

                  <TableCell>
                    {
                      application
                        .candidateLocation
                    }
                  </TableCell>

                  <TableCell>
                    {formatSubmittedAt(
                      application
                        .submittedAt
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={downloading}
                      onClick={() =>
                        void onDownloadResume(
                          application
                        )
                      }
                    >
                      {downloading
                        ? 'Downloading...'
                        : 'Resume'}
                    </Button>
                  </TableCell>

                  <TableCell>
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: 145,
                      }}
                    >
                      <Select
                        value={
                          application.status
                        }
                        disabled={updating}
                        onChange={(event) =>
                          void onStatusChange(
                            application,
                            event.target
                              .value as ApplicationStatus
                          )
                        }
                      >
                        {statusOptions.map(
                          (status) => (
                            <MenuItem
                              key={status}
                              value={status}
                            >
                              {formatStatus(
                                status
                              )}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>

                    <Chip
                      size="small"
                      label={
                        formatStatus(
                          application.status
                        )
                      }
                      sx={{
                        ml: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}