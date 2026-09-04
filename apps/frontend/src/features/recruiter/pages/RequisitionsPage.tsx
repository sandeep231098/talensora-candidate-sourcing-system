import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link as RouterLink,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  ErrorState,
} from '../../../components/common/ErrorState'

import {
  LoadingState,
} from '../../../components/common/LoadingState'

import {
  closeAdminRequisition,
  createAdminRequisition,
  fetchAdminRequisitions,
  publishAdminRequisition,
  updateAdminRequisition,
} from '../api/recruiterApi'

import {
  RequisitionFormDialog,
} from '../components/RequisitionFormDialog'

import type {
  AdminRequisition,
  RequisitionRequest,
  RequisitionStatus,
} from '../types/recruiter'

type StatusFilter =
  | 'ALL'
  | RequisitionStatus

const formatStatus = (
  status: RequisitionStatus,
): string =>
  status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )

const formatEmploymentType = (
  value: string,
): string =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )

export function RequisitionsPage() {
  const auth = useAuth()

  const [
    requisitions,
    setRequisitions,
  ] = useState<AdminRequisition[]>(
    []
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

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

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    'ALL'
  )

  const [
    formOpen,
    setFormOpen,
  ] = useState(false)

  const [
    editing,
    setEditing,
  ] = useState<AdminRequisition | null>(
    null
  )

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    actionId,
    setActionId,
  ] = useState<string | null>(
    null
  )

  const loadRequisitions =
    useCallback(
      async () =>
        fetchAdminRequisitions(
          auth.getValidToken
        ),
      [auth.getValidToken]
    )

  useEffect(() => {
    let active = true

    loadRequisitions()
      .then((data) => {
        if (!active) {
          return
        }

        setRequisitions(data)
        setError(null)
      })
      .catch(
        (loadError: unknown) => {
          if (!active) {
            return
          }

          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load requisitions.'
          )
        }
      )
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [loadRequisitions])

  const filteredRequisitions =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase()

      return requisitions.filter(
        (requisition) => {
          const statusMatches =
            statusFilter === 'ALL' ||
            requisition.status ===
              statusFilter

          if (!statusMatches) {
            return false
          }

          if (!normalized) {
            return true
          }

          const searchable = [
            requisition
              .requisitionId,
            requisition.jobTitle,
            requisition.department,
            requisition.location,
            requisition
              .hiringManager,
            requisition
              .experienceRange,
          ]
            .join(' ')
            .toLowerCase()

          return searchable.includes(
            normalized
          )
        }
      )
    }, [
      requisitions,
      search,
      statusFilter,
    ])

  const replaceRequisition = (
    updated: AdminRequisition,
  ) => {
    setRequisitions(
      (current) =>
        current.map(
          (item) =>
            item.id === updated.id
              ? updated
              : item
        )
    )
  }

  const handleCreate = () => {
    setEditing(null)
    setError(null)
    setSuccess(null)
    setFormOpen(true)
  }

  const handleEdit = (
    requisition: AdminRequisition,
  ) => {
    setEditing(requisition)
    setError(null)
    setSuccess(null)
    setFormOpen(true)
  }

  const handleSave =
    async (
      request: RequisitionRequest,
    ) => {
      setSaving(true)
      setError(null)
      setSuccess(null)

      try {
        if (editing) {
          const updated =
            await updateAdminRequisition(
              editing.id,
              request,
              auth.getValidToken
            )

          replaceRequisition(
            updated
          )

          setSuccess(
            `${updated.requisitionId} updated successfully.`
          )
        } else {
          const created =
            await createAdminRequisition(
              request,
              auth.getValidToken
            )

          setRequisitions(
            (current) => [
              created,
              ...current,
            ]
          )

          setSuccess(
            `${created.requisitionId} created as Draft.`
          )
        }

        setFormOpen(false)
        setEditing(null)
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save requisition.'
        )
      } finally {
        setSaving(false)
      }
    }

  const handlePublish =
    async (
      requisition: AdminRequisition,
    ) => {
      const confirmed =
        window.confirm(
          `Publish ${requisition.requisitionId} - ${requisition.jobTitle}?`
        )

      if (!confirmed) {
        return
      }

      setActionId(
        requisition.id
      )

      setError(null)
      setSuccess(null)

      try {
        const updated =
          await publishAdminRequisition(
            requisition.id,
            auth.getValidToken
          )

        replaceRequisition(
          updated
        )

        setSuccess(
          `${updated.requisitionId} is now published.`
        )
      } catch (
        publishError
      ) {
        setError(
          publishError instanceof Error
            ? publishError.message
            : 'Unable to publish requisition.'
        )
      } finally {
        setActionId(null)
      }
    }

  const handleClose =
    async (
      requisition: AdminRequisition,
    ) => {
      const confirmed =
        window.confirm(
          `Close ${requisition.requisitionId} - ${requisition.jobTitle}?`
        )

      if (!confirmed) {
        return
      }

      setActionId(
        requisition.id
      )

      setError(null)
      setSuccess(null)

      try {
        const updated =
          await closeAdminRequisition(
            requisition.id,
            auth.getValidToken
          )

        replaceRequisition(
          updated
        )

        setSuccess(
          `${updated.requisitionId} is now closed.`
        )
      } catch (
        closeError
      ) {
        setError(
          closeError instanceof Error
            ? closeError.message
            : 'Unable to close requisition.'
        )
      } finally {
        setActionId(null)
      }
    }

  const handleRefresh =
    async () => {
      setLoading(true)
      setError(null)

      try {
        const data =
          await loadRequisitions()

        setRequisitions(data)
      } catch (
        refreshError
      ) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'Unable to refresh requisitions.'
        )
      } finally {
        setLoading(false)
      }
    }

  if (loading) {
    return (
      <LoadingState message="Loading requisitions..." />
    )
  }

  if (
    error &&
    requisitions.length === 0
  ) {
    return (
      <ErrorState
        message={error}
      />
    )
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 5,
      }}
    >
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          justifyContent:
            'space-between',
          alignItems: {
            md: 'center',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            Requisition Management
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Create, edit, publish and
            close Talensora job
            requisitions.
          </Typography>
        </Box>

        <Stack
          direction="row"
          sx={{
            gap: 1.5,
          }}
        >
          <Button
            component={RouterLink}
            to="/recruiter"
          >
            Dashboard
          </Button>

          <Button
            variant="outlined"
            onClick={() =>
              void handleRefresh()
            }
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCreate
            }
          >
            Create Requisition
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError(null)
          }
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess(null)
          }
          sx={{
            mb: 3,
          }}
        >
          {success}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          sx={{
            gap: 2,
            justifyContent:
              'space-between',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              All Requisitions
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {
                filteredRequisitions
                  .length
              }{' '}
              of {
                requisitions.length
              } requisitions
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{
              gap: 2,
            }}
          >
            <TextField
              id="requisition-search"
              name="requisitionSearch"
              size="small"
              label="Search requisitions"
              value={search}
              placeholder="Job, department, REQ ID..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              sx={{
                minWidth: 290,
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 170,
              }}
            >
              <Select
                id="requisition-status-filter"
                name="requisitionStatus"
                inputProps={{ 'aria-label': 'Filter requisitions by status' }}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter
                  )
                }
              >
                <MenuItem value="ALL">
                  All statuses
                </MenuItem>

                <MenuItem value="DRAFT">
                  Draft
                </MenuItem>

                <MenuItem value="PUBLISHED">
                  Published
                </MenuItem>

                <MenuItem value="CLOSED">
                  Closed
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table
            size="small"
            sx={{
              minWidth: 1300,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  Requisition
                </TableCell>

                <TableCell>
                  Department
                </TableCell>

                <TableCell>
                  Location
                </TableCell>

                <TableCell>
                  Type
                </TableCell>

                <TableCell>
                  Experience
                </TableCell>

                <TableCell>
                  Openings
                </TableCell>

                <TableCell>
                  Hiring Manager
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {
                filteredRequisitions.map(
                  (requisition) => {
                    const busy =
                      actionId ===
                      requisition.id

                    return (
                      <TableRow
                        key={
                          requisition.id
                        }
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
                              requisition
                                .jobTitle
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              requisition
                                .requisitionId
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {
                            requisition
                              .department
                          }
                        </TableCell>

                        <TableCell>
                          {
                            requisition
                              .location
                          }
                        </TableCell>

                        <TableCell>
                          {formatEmploymentType(
                            requisition
                              .employmentType
                          )}
                        </TableCell>

                        <TableCell>
                          {
                            requisition
                              .experienceRange
                          }
                        </TableCell>

                        <TableCell>
                          {
                            requisition
                              .numberOfOpenings
                          }
                        </TableCell>

                        <TableCell>
                          {
                            requisition
                              .hiringManager
                          }
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              formatStatus(
                                requisition
                                  .status
                              )
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            sx={{
                              gap: 1,
                              flexWrap:
                                'wrap',
                            }}
                          >
                            {requisition.status !==
                              'CLOSED' && (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  handleEdit(
                                    requisition
                                  )
                                }
                              >
                                Edit
                              </Button>
                            )}

                            {requisition.status ===
                              'DRAFT' && (
                              <Button
                                size="small"
                                variant="contained"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handlePublish(
                                    requisition
                                  )
                                }
                              >
                                Publish
                              </Button>
                            )}

                            {requisition.status ===
                              'PUBLISHED' && (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void handleClose(
                                    requisition
                                  )
                                }
                              >
                                Close
                              </Button>
                            )}

                            <Button
                              size="small"
                              component={
                                RouterLink
                              }
                              to={`/recruiter/requisitions/${requisition.id}/applications`}
                            >
                              Applications
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  }
                )
              }
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRequisitions.length ===
          0 && (
          <Typography
            color="text.secondary"
            sx={{
              py: 5,
              textAlign: 'center',
            }}
          >
            No requisitions match the
            selected filters.
          </Typography>
        )}
      </Paper>

      <RequisitionFormDialog
        open={formOpen}
        requisition={editing}
        saving={saving}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={
          handleSave
        }
      />
    </Container>
  )
}
