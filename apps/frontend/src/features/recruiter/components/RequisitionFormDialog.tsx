import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'

import {
  useState,
} from 'react'

import type {
  AdminRequisition,
  EmploymentType,
  RequisitionRequest,
} from '../types/recruiter'

interface RequisitionFormDialogProps {
  open: boolean
  requisition: AdminRequisition | null
  saving: boolean

  onClose: () => void

  onSave: (
    request: RequisitionRequest,
  ) => Promise<void>
}

interface FormState {
  jobTitle: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceRange: string
  numberOfOpenings: string
  hiringManager: string
  jobDescription: string
  maximumSalaryBudget: string
  hiringCompletedBy: string
}

const emptyForm: FormState = {
  jobTitle: '',
  department: '',
  location: '',
  employmentType: 'FULL_TIME',
  experienceRange: '',
  numberOfOpenings: '1',
  hiringManager: '',
  jobDescription: '',
  maximumSalaryBudget: '',
  hiringCompletedBy: '',
}

const createInitialForm = (
  requisition: AdminRequisition | null,
): FormState => {
  if (!requisition) {
    return {
      ...emptyForm,
    }
  }

  return {
    jobTitle:
      requisition.jobTitle,

    department:
      requisition.department,

    location:
      requisition.location,

    employmentType:
      requisition.employmentType,

    experienceRange:
      requisition.experienceRange,

    numberOfOpenings:
      String(
        requisition.numberOfOpenings
      ),

    hiringManager:
      requisition.hiringManager,

    jobDescription:
      requisition.jobDescription,

    maximumSalaryBudget:
      requisition.maximumSalaryBudget ===
      null
        ? ''
        : String(
            requisition
              .maximumSalaryBudget
          ),

    hiringCompletedBy:
      requisition
        .hiringCompletedBy ?? '',
  }
}

interface RequisitionFormContentProps {
  requisition: AdminRequisition | null
  saving: boolean
  onClose: () => void

  onSave: (
    request: RequisitionRequest,
  ) => Promise<void>
}

function RequisitionFormContent({
  requisition,
  saving,
  onClose,
  onSave,
}: RequisitionFormContentProps) {
  const [
    form,
    setForm,
  ] = useState<FormState>(
    () =>
      createInitialForm(
        requisition
      )
  )

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null
  )

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    )
  }

  const handleSubmit =
    async () => {
      const requiredValues = [
        form.jobTitle,
        form.department,
        form.location,
        form.experienceRange,
        form.hiringManager,
        form.jobDescription,
      ]

      if (
        requiredValues.some(
          (value) =>
            !value.trim()
        )
      ) {
        setValidationError(
          'Please complete all required fields.'
        )

        return
      }

      const openings =
        Number(
          form.numberOfOpenings
        )

      if (
        !Number.isInteger(
          openings
        ) ||
        openings <= 0
      ) {
        setValidationError(
          'Number of openings must be greater than zero.'
        )

        return
      }

      const salary =
        form.maximumSalaryBudget
          .trim()
          ? Number(
              form.maximumSalaryBudget
            )
          : null

      if (
        salary !== null &&
        (
          !Number.isFinite(
            salary
          ) ||
          salary < 0
        )
      ) {
        setValidationError(
          'Maximum salary budget cannot be negative.'
        )

        return
      }

      setValidationError(null)

      await onSave({
        jobTitle:
          form.jobTitle.trim(),

        department:
          form.department.trim(),

        location:
          form.location.trim(),

        employmentType:
          form.employmentType,

        experienceRange:
          form.experienceRange.trim(),

        numberOfOpenings:
          openings,

        hiringManager:
          form.hiringManager.trim(),

        jobDescription:
          form.jobDescription.trim(),

        maximumSalaryBudget:
          salary,

        hiringCompletedBy:
          form.hiringCompletedBy ||
          null,
      })
    }

  return (
    <Dialog
      open
      onClose={
        saving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {requisition
          ? `Edit ${requisition.requisitionId}`
          : 'Create Job Requisition'}
      </DialogTitle>

      <DialogContent>
        {validationError && (
          <TextField
            fullWidth
            error
            value={
              validationError
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{
              mt: 1,
              mb: 2,
            }}
          />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: 16,
            marginTop: 8,
          }}
        >
          <TextField
            required
            label="Job Title"
            value={form.jobTitle}
            onChange={(event) =>
              updateField(
                'jobTitle',
                event.target.value
              )
            }
          />

          <TextField
            required
            label="Department"
            value={
              form.department
            }
            onChange={(event) =>
              updateField(
                'department',
                event.target.value
              )
            }
          />

          <TextField
            required
            label="Location"
            value={form.location}
            onChange={(event) =>
              updateField(
                'location',
                event.target.value
              )
            }
          />

          <TextField
            select
            required
            label="Employment Type"
            value={
              form.employmentType
            }
            onChange={(event) =>
              updateField(
                'employmentType',
                event.target.value
              )
            }
          >
            <MenuItem value="FULL_TIME">
              Full Time
            </MenuItem>

            <MenuItem value="PART_TIME">
              Part Time
            </MenuItem>

            <MenuItem value="CONTRACT">
              Contract
            </MenuItem>

            <MenuItem value="INTERNSHIP">
              Internship
            </MenuItem>
          </TextField>

          <TextField
            required
            label="Experience Range"
            placeholder="3-5 years"
            value={
              form.experienceRange
            }
            onChange={(event) =>
              updateField(
                'experienceRange',
                event.target.value
              )
            }
          />

          <TextField
            required
            type="number"
            label="Number of Openings"
            value={
              form.numberOfOpenings
            }
            onChange={(event) =>
              updateField(
                'numberOfOpenings',
                event.target.value
              )
            }
            slotProps={{
              htmlInput: {
                min: 1,
              },
            }}
          />

          <TextField
            required
            label="Hiring Manager"
            value={
              form.hiringManager
            }
            onChange={(event) =>
              updateField(
                'hiringManager',
                event.target.value
              )
            }
          />

          <TextField
            type="number"
            label="Maximum Salary Budget"
            value={
              form.maximumSalaryBudget
            }
            onChange={(event) =>
              updateField(
                'maximumSalaryBudget',
                event.target.value
              )
            }
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
          />

          <TextField
            type="date"
            label="Hiring Completed By"
            value={
              form.hiringCompletedBy
            }
            onChange={(event) =>
              updateField(
                'hiringCompletedBy',
                event.target.value
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </div>

        <TextField
          required
          fullWidth
          multiline
          minRows={6}
          label="Job Description"
          value={
            form.jobDescription
          }
          onChange={(event) =>
            updateField(
              'jobDescription',
              event.target.value
            )
          }
          sx={{
            mt: 2,
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={saving}
          onClick={() =>
            void handleSubmit()
          }
        >
          {saving
            ? 'Saving...'
            : requisition
              ? 'Save Changes'
              : 'Create Draft'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function RequisitionFormDialog({
  open,
  requisition,
  saving,
  onClose,
  onSave,
}: RequisitionFormDialogProps) {
  if (!open) {
    return null
  }

  const formKey =
    requisition?.id ??
    'new-requisition'

  return (
    <RequisitionFormContent
      key={formKey}
      requisition={
        requisition
      }
      saving={saving}
      onClose={onClose}
      onSave={onSave}
    />
  )
}