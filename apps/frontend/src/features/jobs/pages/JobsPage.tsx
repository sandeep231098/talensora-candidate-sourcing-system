import {
  Box,
  Container,
  Typography,
} from '@mui/material'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ErrorState } from '../../../components/common/ErrorState'
import { LoadingState } from '../../../components/common/LoadingState'

import {
  fetchPublicJobs,
} from '../api/jobsApi'

import { JobCard } from '../components/JobCard'
import { SearchFilters } from '../components/SearchFilters'

import type {
  Job,
  JobSearchParams,
} from '../types/job'

const EMPTY_FILTERS: JobSearchParams = {
  search: '',
  department: '',
  location: '',
  employmentType: '',
  experience: '',
}

const DEPARTMENT_CATALOG = [
  'Engineering',
  'Information Technology',
  'Human Resources',
  'Finance',
  'Accounts',
  'Operations',
  'Sales',
  'Marketing',
  'Customer Support',
]

const LOCATION_CATALOG = [
  'Indore, India',
  'Pune, India',
  'Bengaluru, India',
  'Mumbai, India',
  'Chennai, India',
  'Hyderabad, India',
  'Noida, India',
  'Gurugram, India',
  'Remote',
]

const EMPLOYMENT_TYPE_CATALOG = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
]

const EXPERIENCE_CATALOG = [
  '0-1 Years',
  '0-2 Years',
  '1-3 Years',
  '2-4 Years',
  '3-6 Years',
  '5-8 Years',
  '8+ Years',
]

const uniqueSorted = (
  values: string[],
): string[] =>
  Array.from(new Set(values))
    .filter(Boolean)
    .sort((a, b) =>
      a.localeCompare(b)
    )

export function JobsPage() {
  const [jobs, setJobs] =
    useState<Job[]>([])

  const [allJobs, setAllJobs] =
    useState<Job[]>([])

  const [filters, setFilters] =
    useState<JobSearchParams>(
      EMPTY_FILTERS
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [reloadKey, setReloadKey] =
    useState(0)

  useEffect(() => {
    let cancelled = false

    fetchPublicJobs()
      .then((data) => {
        if (!cancelled) {
          setAllJobs(data)
        }
      })
      .catch(() => {
        // Filter metadata is optional.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const timeout = window.setTimeout(
      async () => {
        setLoading(true)
        setError(null)

        try {
          const data =
            await fetchPublicJobs(filters)

          if (!cancelled) {
            setJobs(data)
          }
        } catch {
          if (!cancelled) {
            setError(
              'Unable to load jobs. Please make sure the SmartSkale backend is running.'
            )
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      },
      filters.search ? 350 : 0
    )

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [filters, reloadKey])

  const departments = useMemo(
    () =>
      uniqueSorted([
        ...DEPARTMENT_CATALOG,
        ...allJobs.map(
          (job) => job.department
        ),
      ]),
    [allJobs]
  )

  const locations = useMemo(
    () =>
      uniqueSorted([
        ...LOCATION_CATALOG,
        ...allJobs.map(
          (job) => job.location
        ),
      ]),
    [allJobs]
  )

  const employmentTypes = useMemo(
    () =>
      uniqueSorted([
        ...EMPLOYMENT_TYPE_CATALOG,
        ...allJobs.map(
          (job) => job.employmentType
        ),
      ]),
    [allJobs]
  )

  const experiences = useMemo(
    () =>
      uniqueSorted([
        ...EXPERIENCE_CATALOG,
        ...allJobs.map(
          (job) => job.experienceRange
        ),
      ]),
    [allJobs]
  )

  return (
    <>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: {
            xs: 6,
            md: 9,
          },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{ opacity: 0.8 }}
          >
            SmartSkale Careers
          </Typography>

          <Typography
            variant="h3"
            sx={{
              mt: 1,
              maxWidth: 720,
            }}
          >
            Find your next opportunity
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 2,
              maxWidth: 680,
              fontWeight: 400,
              opacity: 0.9,
            }}
          >
            Explore open roles and help us
            build scalable technology and
            meaningful products.
          </Typography>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          mt: -3,
          position: 'relative',
        }}
      >
        <SearchFilters
          filters={filters}
          departments={departments}
          locations={locations}
          employmentTypes={
            employmentTypes
          }
          experiences={experiences}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              ...EMPTY_FILTERS,
            })
          }
        />

        <Box
          sx={{
            mt: 5,
            mb: 3,
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5">
              Open positions
            </Typography>

            {!loading && !error && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {jobs.length}{' '}
                {jobs.length === 1
                  ? 'opportunity'
                  : 'opportunities'}{' '}
                found
              </Typography>
            )}
          </Box>
        </Box>

        {loading && (
          <LoadingState message="Finding available roles..." />
        )}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={() =>
              setReloadKey(
                (value) => value + 1
              )
            }
          />
        )}

        {!loading &&
          !error &&
          jobs.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                bgcolor:
                  'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6">
                No jobs found
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Try changing or clearing
                your search filters.
              </Typography>
            </Box>
          )}

        {!loading &&
          !error &&
          jobs.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </Box>
          )}
      </Container>
    </>
  )
}