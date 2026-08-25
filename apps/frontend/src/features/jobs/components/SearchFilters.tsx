import SearchIcon from '@mui/icons-material/Search'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material'

import type { JobSearchParams } from '../types/job'
import { formatEnumLabel } from '../../../utils/formatters'

interface SearchFiltersProps {
  filters: JobSearchParams
  departments: string[]
  locations: string[]
  employmentTypes: string[]
  experiences: string[]
  onChange: (
    filters: JobSearchParams
  ) => void
  onReset: () => void
}

export function SearchFilters({
  filters,
  departments,
  locations,
  employmentTypes,
  experiences,
  onChange,
  onReset,
}: SearchFiltersProps) {
  const update = (
    key: keyof JobSearchParams,
    value: string,
  ) => {
    onChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 2.5,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '2fr 1fr 1fr',
        },
        gap: 2,
      }}
    >
      <TextField
        label="Search jobs"
        placeholder="Java, backend, cloud..."
        value={filters.search ?? ''}
        onChange={(event) =>
          update('search', event.target.value)
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        label="Department"
        value={filters.department ?? ''}
        onChange={(event) =>
          update('department', event.target.value)
        }
      >
        <MenuItem value="">
          All departments
        </MenuItem>

        {departments.map((department) => (
          <MenuItem
            key={department}
            value={department}
          >
            {department}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Location"
        value={filters.location ?? ''}
        onChange={(event) =>
          update('location', event.target.value)
        }
      >
        <MenuItem value="">
          All locations
        </MenuItem>

        {locations.map((location) => (
          <MenuItem
            key={location}
            value={location}
          >
            {location}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Employment type"
        value={filters.employmentType ?? ''}
        onChange={(event) =>
          update(
            'employmentType',
            event.target.value,
          )
        }
      >
        <MenuItem value="">
          All employment types
        </MenuItem>

        {employmentTypes.map((type) => (
          <MenuItem
            key={type}
            value={type}
          >
            {formatEnumLabel(type)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Experience"
        value={filters.experience ?? ''}
        onChange={(event) =>
          update('experience', event.target.value)
        }
      >
        <MenuItem value="">
          All experience levels
        </MenuItem>

        {experiences.map((experience) => (
          <MenuItem
            key={experience}
            value={experience}
          >
            {experience}
          </MenuItem>
        ))}
      </TextField>

      <Button
        startIcon={<RestartAltIcon />}
        onClick={onReset}
        sx={{
          minHeight: 56,
        }}
      >
        Clear filters
      </Button>
    </Box>
  )
}