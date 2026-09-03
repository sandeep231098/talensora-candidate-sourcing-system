import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  LoadingState,
} from '../../../components/common/LoadingState'

import {
  addEducation,
  addExperience,
  deleteEducation,
  deleteExperience,
  fetchCandidateProfile,
  fetchCurrentResume,
  fetchEducation,
  fetchExperience,
  fetchPublicJob,
  saveCandidateProfile,
  submitApplication,
  uploadResume,
} from '../api/candidateApi'

import type {
  CandidateEducation,
  CandidateExperience,
  CandidateProfile,
  EducationLevel,
  Gender,
  NoticePeriod,
  PublicJob,
  ResumeResponse,
} from '../types/candidate'

import {
  currentLocalDate,
  isValidMobileNumber,
  MOBILE_NUMBER_HELPER_TEXT,
} from '../utils/candidateValidation'

const steps = [
  'Bio-Data',
  'Education',
  'Experience',
  'Resume',
  'Review & Submit',
]

interface ProfileForm {
  firstName: string
  lastName: string
  gender: Gender
  mobileNumber: string
  dateOfBirth: string
  currentLocation: string
  currentCompany: string
  noticePeriod: NoticePeriod | ''
  currentAddress: string
  fresher: boolean
}

const emptyProfile: ProfileForm = {
  firstName: '',
  lastName: '',
  gender: 'PREFER_NOT_TO_SAY',
  mobileNumber: '',
  dateOfBirth: '',
  currentLocation: '',
  currentCompany: '',
  noticePeriod: '',
  currentAddress: '',
  fresher: false,
}

interface EducationForm {
  degreeQualification: string
  specialization: string
  institutionUniversity: string
  yearOfPassing: string
  gradeScore: string
  educationLevel: EducationLevel
}

const emptyEducation: EducationForm = {
  degreeQualification: '',
  specialization: '',
  institutionUniversity: '',
  yearOfPassing: '',
  gradeScore: '',
  educationLevel: 'BACHELORS',
}

interface ExperienceForm {
  employerName: string
  jobTitle: string
  startDate: string
  endDate: string
  currentlyWorkingHere: boolean
  keyResponsibilities: string
}

const emptyExperience: ExperienceForm = {
  employerName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  currentlyWorkingHere: false,
  keyResponsibilities: '',
}

export function CandidateApplyPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const {
    id,
  } = useParams()

  const [
    activeStep,
    setActiveStep,
  ] = useState(0)

  const [
    job,
    setJob,
  ] = useState<PublicJob | null>(
    null
  )

  const [
    profile,
    setProfile,
  ] = useState<CandidateProfile | null>(
    null
  )

  const [
    profileForm,
    setProfileForm,
  ] = useState<ProfileForm>(
    emptyProfile
  )

  const [
    education,
    setEducation,
  ] = useState<CandidateEducation[]>(
    []
  )

  const [
    educationForm,
    setEducationForm,
  ] = useState<EducationForm>(
    emptyEducation
  )

  const [
    experience,
    setExperience,
  ] = useState<CandidateExperience[]>(
    []
  )

  const [
    experienceForm,
    setExperienceForm,
  ] = useState<ExperienceForm>(
    emptyExperience
  )

  const [
    resume,
    setResume,
  ] = useState<ResumeResponse | null>(
    null
  )

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  )

  const [
    coverNote,
    setCoverNote,
  ] = useState('')

  const [
    dataAccuracyConsent,
    setDataAccuracyConsent,
  ] = useState(false)

  const [
    privacyConsent,
    setPrivacyConsent,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const loadContext =
    useCallback(
      async () => {
        if (!id) {
          throw new Error(
            'Job ID is missing.'
          )
        }

        const loadedJob =
          await fetchPublicJob(id)

        const loadedProfile =
          await fetchCandidateProfile(
            auth.getValidToken
          )

        if (!loadedProfile) {
          return {
            loadedJob,
            loadedProfile: null,
            loadedEducation:
              [] as CandidateEducation[],
            loadedExperience:
              [] as CandidateExperience[],
            loadedResume: null,
          }
        }

        const [
          loadedEducation,
          loadedExperience,
          loadedResume,
        ] = await Promise.all([
          fetchEducation(
            auth.getValidToken
          ),
          fetchExperience(
            auth.getValidToken
          ),
          fetchCurrentResume(
            auth.getValidToken
          ),
        ])

        return {
          loadedJob,
          loadedProfile,
          loadedEducation,
          loadedExperience,
          loadedResume,
        }
      },
      [
        auth.getValidToken,
        id,
      ]
    )

  useEffect(() => {
    let active = true

    loadContext()
      .then((context) => {
        if (!active) {
          return
        }

        setJob(
          context.loadedJob
        )

        setProfile(
          context.loadedProfile
        )

        setEducation(
          context.loadedEducation
        )

        setExperience(
          context.loadedExperience
        )

        setResume(
          context.loadedResume
        )

        if (
          context.loadedProfile
        ) {
          const value =
            context.loadedProfile

          setProfileForm({
            firstName:
              value.firstName,
            lastName:
              value.lastName,
            gender:
              value.gender,
            mobileNumber:
              value.mobileNumber,
            dateOfBirth:
              value.dateOfBirth ?? '',
            currentLocation:
              value.currentLocation,
            currentCompany:
              value.currentCompany ?? '',
            noticePeriod:
              value.noticePeriod ?? '',
            currentAddress:
              value.currentAddress ?? '',
            fresher:
              value.fresher,
          })
        }

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
              : 'Unable to load application.'
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
  }, [loadContext])

  const saveBio =
    async () => {
      if (
        !profileForm.firstName.trim() ||
        !profileForm.lastName.trim() ||
        !profileForm.mobileNumber.trim() ||
        !profileForm.currentLocation.trim()
      ) {
        setError(
          'Please complete all required Bio-Data fields.'
        )

        return
      }

      if (
        !isValidMobileNumber(
          profileForm.mobileNumber
        )
      ) {
        setError(
          'Enter a valid mobile number with its country code.'
        )

        return
      }

      if (
        profileForm.dateOfBirth &&
        profileForm.dateOfBirth >=
          currentLocalDate()
      ) {
        setError(
          'Date of birth must be in the past.'
        )

        return
      }

      setSaving(true)
      setError(null)

      try {
        const saved =
          await saveCandidateProfile(
            {
              firstName:
                profileForm.firstName.trim(),
              lastName:
                profileForm.lastName.trim(),
              gender:
                profileForm.gender,
              mobileNumber:
                profileForm.mobileNumber.trim(),
              dateOfBirth:
                profileForm.dateOfBirth ||
                null,
              currentLocation:
                profileForm.currentLocation.trim(),
              currentCompany:
                profileForm.currentCompany.trim() ||
                null,
              noticePeriod:
                profileForm.noticePeriod ||
                null,
              currentAddress:
                profileForm.currentAddress.trim() ||
                null,
              fresher:
                profileForm.fresher,
            },
            auth.getValidToken,
          )

        setProfile(saved)

        if (saved.fresher) {
          setExperience([])
        }

        setActiveStep(1)
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save profile.'
        )
      } finally {
        setSaving(false)
      }
    }

  const saveEducation =
    async () => {
      const year =
        Number(
          educationForm.yearOfPassing
        )

      if (
        !educationForm
          .degreeQualification
          .trim() ||
        !educationForm
          .institutionUniversity
          .trim() ||
        !Number.isInteger(year)
      ) {
        setError(
          'Degree, institution and year are required.'
        )

        return
      }

      const currentYear =
        new Date().getFullYear()

      if (
        year < 1900 ||
        year > currentYear
      ) {
        setError(
          'Year of passing must be between 1900 and the current year.'
        )

        return
      }

      setSaving(true)
      setError(null)

      try {
        const created =
          await addEducation(
            {
              degreeQualification:
                educationForm
                  .degreeQualification
                  .trim(),
              specialization:
                educationForm
                  .specialization
                  .trim() ||
                null,
              institutionUniversity:
                educationForm
                  .institutionUniversity
                  .trim(),
              yearOfPassing:
                year,
              gradeScore:
                educationForm
                  .gradeScore
                  .trim() ||
                null,
              educationLevel:
                educationForm
                  .educationLevel,
            },
            auth.getValidToken,
          )

        setEducation(
          (current) => [
            created,
            ...current,
          ]
        )

        setEducationForm(
          emptyEducation
        )
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Unable to add education.'
        )
      } finally {
        setSaving(false)
      }
    }

  const removeEducation =
    async (
      educationId: string,
    ) => {
      setSaving(true)
      setError(null)

      try {
        await deleteEducation(
          educationId,
          auth.getValidToken
        )

        setEducation(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                educationId
            )
        )
      } catch (
        deleteError
      ) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : 'Unable to remove education.'
        )
      } finally {
        setSaving(false)
      }
    }

  const saveExperience =
    async () => {
      if (
        !experienceForm
          .employerName
          .trim() ||
        !experienceForm
          .jobTitle
          .trim() ||
        !experienceForm.startDate
      ) {
        setError(
          'Employer, job title and start date are required.'
        )

        return
      }

      const today = currentLocalDate()

      if (
        experienceForm.startDate >
          today ||
        (
          experienceForm.endDate &&
          experienceForm.endDate >
            today
        )
      ) {
        setError(
          'Employment dates cannot be in the future.'
        )

        return
      }

      if (
        !experienceForm
          .currentlyWorkingHere &&
        !experienceForm.endDate
      ) {
        setError(
          'End date is required unless this is your current job.'
        )

        return
      }

      setSaving(true)
      setError(null)

      try {
        const created =
          await addExperience(
            {
              employerName:
                experienceForm
                  .employerName
                  .trim(),
              jobTitle:
                experienceForm
                  .jobTitle
                  .trim(),
              startDate:
                experienceForm
                  .startDate,
              endDate:
                experienceForm
                  .currentlyWorkingHere
                  ? null
                  : experienceForm
                      .endDate,
              currentlyWorkingHere:
                experienceForm
                  .currentlyWorkingHere,
              keyResponsibilities:
                experienceForm
                  .keyResponsibilities
                  .trim() ||
                null,
            },
            auth.getValidToken,
          )

        setExperience(
          (current) => [
            created,
            ...current,
          ]
        )

        setExperienceForm(
          emptyExperience
        )

        const refreshedProfile =
          await fetchCandidateProfile(
            auth.getValidToken
          )

        if (refreshedProfile) {
          setProfile(
            refreshedProfile
          )
        }
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : 'Unable to add experience.'
        )
      } finally {
        setSaving(false)
      }
    }

  const removeExperience =
    async (
      experienceId: string,
    ) => {
      setSaving(true)
      setError(null)

      try {
        await deleteExperience(
          experienceId,
          auth.getValidToken
        )

        setExperience(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                experienceId
            )
        )

        const refreshedProfile =
          await fetchCandidateProfile(
            auth.getValidToken
          )

        if (refreshedProfile) {
          setProfile(
            refreshedProfile
          )
        }
      } catch (
        deleteError
      ) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : 'Unable to remove experience.'
        )
      } finally {
        setSaving(false)
      }
    }

  const saveResume =
    async () => {
      if (!selectedFile) {
        if (resume) {
          setActiveStep(4)
          return
        }

        setError(
          'A resume is required.'
        )

        return
      }

      const maximumSize =
        5 * 1024 * 1024

      if (
        selectedFile.size >
        maximumSize
      ) {
        setError(
          'Resume must not exceed 5 MB.'
        )

        return
      }

      setSaving(true)
      setError(null)

      try {
        const uploaded =
          await uploadResume(
            selectedFile,
            auth.getValidToken
          )

        setResume(uploaded)
        setSelectedFile(null)
        setActiveStep(4)
      } catch (
        uploadError
      ) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : 'Resume upload failed.'
        )
      } finally {
        setSaving(false)
      }
    }

  const finishEducation = () => {
    if (education.length === 0) {
      setError(
        'Add at least one education record before continuing.'
      )

      return
    }

    setError(null)
    setActiveStep(2)
  }

  const finishExperience = () => {
    if (
      !profile?.fresher &&
      experience.length === 0
    ) {
      setError(
        'Add work experience or mark yourself as Fresher in Bio-Data.'
      )

      return
    }

    setError(null)
    setActiveStep(3)
  }

  const submit =
    async () => {
      if (
        !job ||
        !profile ||
        education.length === 0 ||
        !resume
      ) {
        setError(
          'Application information is incomplete.'
        )

        return
      }

      if (
        !dataAccuracyConsent ||
        !privacyConsent
      ) {
        setError(
          'Both consent checkboxes must be accepted.'
        )

        return
      }

      setSaving(true)
      setError(null)

      try {
        const application =
          await submitApplication(
            {
              requisitionId:
                job.id,
              coverNote:
                coverNote.trim() ||
                null,
              dataAccuracyConsent,
              privacyConsent,
            },
            auth.getValidToken,
          )

        navigate(
          `/candidate/applications/${application.id}/confirmation`,
          {
            replace: true,
            state: {
              application,
              job,
            },
          }
        )
      } catch (
        submitError
      ) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : 'Application submission failed.'
        )
      } finally {
        setSaving(false)
      }
    }

  if (loading) {
    return (
      <LoadingState message="Preparing your application..." />
    )
  }

  if (!job) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 6 }}
      >
        <Alert severity="error">
          {error ??
            'Job could not be loaded.'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 5 }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800 }}
        >
          Apply for {job.jobTitle}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {job.requisitionId}
          {' · '}
          {job.department}
          {' · '}
          {job.location}
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ my: 5 }}
        >
          {steps.map(
            (label) => (
              <Step key={label}>
                <StepLabel>
                  {label}
                </StepLabel>
              </Step>
            )
          )}
        </Stepper>

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError(null)
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h6">
              Bio-Data
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
              <TextField
                required
                label="First Name"
                value={
                  profileForm.firstName
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      firstName:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                required
                label="Last Name"
                value={
                  profileForm.lastName
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      lastName:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                select
                label="Gender"
                value={
                  profileForm.gender
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      gender:
                        event.target
                          .value as Gender,
                    })
                  )
                }
              >
                <MenuItem value="MALE">
                  Male
                </MenuItem>

                <MenuItem value="FEMALE">
                  Female
                </MenuItem>

                <MenuItem value="OTHER">
                  Other
                </MenuItem>

                <MenuItem value="PREFER_NOT_TO_SAY">
                  Prefer not to say
                </MenuItem>
              </TextField>

              <TextField
                required
                id="candidate-application-mobile-number"
                name="mobileNumber"
                label="Mobile Number"
                placeholder="+919876543210"
                error={
                  profileForm.mobileNumber
                    .trim().length > 0 &&
                  !isValidMobileNumber(
                    profileForm.mobileNumber
                  )
                }
                helperText={
                  profileForm.mobileNumber
                    .trim().length > 0 &&
                  !isValidMobileNumber(
                    profileForm.mobileNumber
                  )
                    ? 'Enter a valid international mobile number.'
                    : MOBILE_NUMBER_HELPER_TEXT
                }
                value={
                  profileForm.mobileNumber
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      mobileNumber:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                id="candidate-application-date-of-birth"
                name="dateOfBirth"
                type="date"
                label="Date of Birth"
                value={
                  profileForm.dateOfBirth
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      dateOfBirth:
                        event.target.value,
                    })
                  )
                }
                slotProps={{
                  htmlInput: {
                    max: currentLocalDate(),
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                required
                label="Current Location"
                value={
                  profileForm.currentLocation
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      currentLocation:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                label="Current Company"
                value={
                  profileForm.currentCompany
                }
                disabled={
                  profileForm.fresher
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      currentCompany:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                select
                label="Notice Period"
                value={
                  profileForm.noticePeriod
                }
                disabled={
                  profileForm.fresher
                }
                onChange={(event) =>
                  setProfileForm(
                    (current) => ({
                      ...current,
                      noticePeriod:
                        event.target
                          .value as
                          | NoticePeriod
                          | '',
                    })
                  )
                }
              >
                <MenuItem value="">
                  Not specified
                </MenuItem>

                <MenuItem value="IMMEDIATE">
                  Immediate
                </MenuItem>

                <MenuItem value="DAYS_15">
                  15 Days
                </MenuItem>

                <MenuItem value="DAYS_30">
                  30 Days
                </MenuItem>

                <MenuItem value="DAYS_60">
                  60 Days
                </MenuItem>

                <MenuItem value="DAYS_90_PLUS">
                  90+ Days
                </MenuItem>
              </TextField>
            </Box>

            <TextField
              multiline
              minRows={3}
              label="Current Address"
              value={
                profileForm.currentAddress
              }
              onChange={(event) =>
                setProfileForm(
                  (current) => ({
                    ...current,
                    currentAddress:
                      event.target.value,
                  })
                )
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    profileForm.fresher
                  }
                  onChange={(event) =>
                    setProfileForm(
                      (current) => ({
                        ...current,
                        fresher:
                          event.target
                            .checked,
                        currentCompany:
                          event.target
                            .checked
                            ? ''
                            : current
                                .currentCompany,
                        noticePeriod:
                          event.target
                            .checked
                            ? ''
                            : current
                                .noticePeriod,
                      })
                    )
                  }
                />
              }
              label="Fresher / No work experience"
            />

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  'flex-end',
              }}
            >
              <Button
                variant="contained"
                disabled={saving}
                onClick={() =>
                  void saveBio()
                }
              >
                {saving
                  ? 'Saving...'
                  : 'Save & Continue'}
              </Button>
            </Stack>
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h6">
              Education
            </Typography>

            {education.map(
              (item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Stack
                    direction={{
                      xs: 'column',
                      md: 'row',
                    }}
                    sx={{
                      justifyContent:
                        'space-between',
                      gap: 2,
                    }}
                  >
                    <div>
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {
                          item
                            .degreeQualification
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {
                          item
                            .institutionUniversity
                        }
                        {' · '}
                        {item.yearOfPassing}
                      </Typography>
                    </div>

                    <Button
                      color="error"
                      disabled={saving}
                      onClick={() =>
                        void removeEducation(
                          item.id
                        )
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              )
            )}

            <Divider />

            <Typography
              sx={{ fontWeight: 700 }}
            >
              Add Education
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
              <TextField
                required
                label="Degree / Qualification"
                value={
                  educationForm
                    .degreeQualification
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      degreeQualification:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                label="Specialization"
                value={
                  educationForm
                    .specialization
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      specialization:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                required
                label="Institution / University"
                value={
                  educationForm
                    .institutionUniversity
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      institutionUniversity:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                required
                id="candidate-application-education-year"
                name="yearOfPassing"
                type="number"
                label="Year of Passing"
                value={
                  educationForm
                    .yearOfPassing
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      yearOfPassing:
                        event.target.value,
                    })
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 1900,
                    max: new Date()
                      .getFullYear(),
                  },
                }}
              />

              <TextField
                label="Grade / Score"
                value={
                  educationForm
                    .gradeScore
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      gradeScore:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                select
                label="Education Level"
                value={
                  educationForm
                    .educationLevel
                }
                onChange={(event) =>
                  setEducationForm(
                    (current) => ({
                      ...current,
                      educationLevel:
                        event.target
                          .value as EducationLevel,
                    })
                  )
                }
              >
                <MenuItem value="HIGH_SCHOOL">
                  High School
                </MenuItem>

                <MenuItem value="DIPLOMA">
                  Diploma
                </MenuItem>

                <MenuItem value="BACHELORS">
                  Bachelors
                </MenuItem>

                <MenuItem value="MASTERS">
                  Masters
                </MenuItem>

                <MenuItem value="DOCTORATE">
                  Doctorate
                </MenuItem>
              </TextField>
            </Box>

            <Button
              variant="outlined"
              disabled={saving}
              onClick={() =>
                void saveEducation()
              }
            >
              Add Education
            </Button>

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  'space-between',
              }}
            >
              <Button
                onClick={() =>
                  setActiveStep(0)
                }
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={
                  finishEducation
                }
              >
                Continue
              </Button>
            </Stack>
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h6">
              Work Experience
            </Typography>

            {profile?.fresher ? (
              <Alert severity="info">
                You are marked as a
                Fresher. Work experience
                is not required.
              </Alert>
            ) : (
              <>
                {experience.map(
                  (item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Stack
                        direction={{
                          xs: 'column',
                          md: 'row',
                        }}
                        sx={{
                          justifyContent:
                            'space-between',
                          gap: 2,
                        }}
                      >
                        <div>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {item.jobTitle}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {item.employerName}
                            {' · '}
                            {item.startDate}
                            {' → '}
                            {
                              item.currentlyWorkingHere
                                ? 'Present'
                                : item.endDate
                            }
                          </Typography>
                        </div>

                        <Button
                          color="error"
                          disabled={saving}
                          onClick={() =>
                            void removeExperience(
                              item.id
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Paper>
                  )
                )}

                <Divider />

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
                  <TextField
                    required
                    label="Employer"
                    value={
                      experienceForm
                        .employerName
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          employerName:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                  <TextField
                    required
                    label="Job Title"
                    value={
                      experienceForm
                        .jobTitle
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          jobTitle:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                  <TextField
                    required
                    id="candidate-application-experience-start-date"
                    name="startDate"
                    type="date"
                    label="Start Date"
                    value={
                      experienceForm
                        .startDate
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          startDate:
                            event.target
                              .value,
                        })
                      )
                    }
                    slotProps={{
                      htmlInput: {
                        max: currentLocalDate(),
                      },
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <TextField
                    id="candidate-application-experience-end-date"
                    name="endDate"
                    type="date"
                    label="End Date"
                    disabled={
                      experienceForm
                        .currentlyWorkingHere
                    }
                    value={
                      experienceForm
                        .endDate
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          endDate:
                            event.target
                              .value,
                        })
                      )
                    }
                    slotProps={{
                      htmlInput: {
                        max: currentLocalDate(),
                      },
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        experienceForm
                          .currentlyWorkingHere
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            currentlyWorkingHere:
                              event.target
                                .checked,
                            endDate:
                              event.target
                                .checked
                                ? ''
                                : current
                                    .endDate,
                          })
                        )
                      }
                    />
                  }
                  label="I currently work here"
                />

                <TextField
                  multiline
                  minRows={3}
                  label="Key Responsibilities"
                  value={
                    experienceForm
                      .keyResponsibilities
                  }
                  onChange={(event) =>
                    setExperienceForm(
                      (current) => ({
                        ...current,
                        keyResponsibilities:
                          event.target
                            .value,
                      })
                    )
                  }
                />

                <Button
                  variant="outlined"
                  disabled={saving}
                  onClick={() =>
                    void saveExperience()
                  }
                >
                  Add Experience
                </Button>
              </>
            )}

            {profile && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total calculated experience:{' '}
                {
                  profile
                    .totalExperienceMonths
                }{' '}
                months
              </Typography>
            )}

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  'space-between',
              }}
            >
              <Button
                onClick={() =>
                  setActiveStep(1)
                }
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={
                  finishExperience
                }
              >
                Continue
              </Button>
            </Stack>
          </Stack>
        )}

        {activeStep === 3 && (
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h6">
              Resume
            </Typography>

            {resume && (
              <Alert severity="success">
                Active resume:{' '}
                {resume.originalFilename}
                {' · '}
                Version{' '}
                {resume.resumeVersion}
              </Alert>
            )}

            <Button
              component="label"
              variant="outlined"
            >
              Choose Resume

              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setSelectedFile(
                    event.target
                      .files?.[0] ??
                      null
                  )
                }
              />
            </Button>

            {selectedFile && (
              <Typography>
                Selected:{' '}
                {selectedFile.name}
              </Typography>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
            >
              PDF, DOC or DOCX. Maximum
              size: 5 MB.
            </Typography>

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  'space-between',
              }}
            >
              <Button
                onClick={() =>
                  setActiveStep(2)
                }
              >
                Back
              </Button>

              <Button
                variant="contained"
                disabled={saving}
                onClick={() =>
                  void saveResume()
                }
              >
                {saving
                  ? 'Uploading...'
                  : resume &&
                      !selectedFile
                    ? 'Use Current Resume'
                    : 'Upload & Continue'}
              </Button>
            </Stack>
          </Stack>
        )}

        {activeStep === 4 && (
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h6">
              Review & Submit
            </Typography>

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography
                sx={{ fontWeight: 700 }}
              >
                Job
              </Typography>

              <Typography>
                {job.jobTitle}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {job.requisitionId}
                {' · '}
                {job.location}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography
                sx={{ fontWeight: 700 }}
              >
                Candidate
              </Typography>

              <Typography>
                {profile?.firstName}{' '}
                {profile?.lastName}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {profile?.email}
              </Typography>
            </Paper>

            <Stack
              direction="row"
              sx={{
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={
                  `${education.length} education record(s)`
                }
              />

              <Chip
                label={
                  profile?.fresher
                    ? 'Fresher'
                    : `${experience.length} experience record(s)`
                }
              />

              <Chip
                label={
                  resume
                    ? `Resume V${resume.resumeVersion}`
                    : 'No resume'
                }
              />
            </Stack>

            <TextField
              multiline
              minRows={5}
              label="Cover Note (Optional)"
              value={coverNote}
              onChange={(event) =>
                setCoverNote(
                  event.target.value
                )
              }
              helperText={
                `${coverNote.length}/2000`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 2000,
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    dataAccuracyConsent
                  }
                  onChange={(event) =>
                    setDataAccuracyConsent(
                      event.target.checked
                    )
                  }
                />
              }
              label="I confirm that the information provided is accurate."
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    privacyConsent
                  }
                  onChange={(event) =>
                    setPrivacyConsent(
                      event.target.checked
                    )
                  }
                />
              }
              label="I consent to Talensora processing my application data for recruitment."
            />

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  'space-between',
              }}
            >
              <Button
                onClick={() =>
                  setActiveStep(3)
                }
              >
                Back
              </Button>

              <Button
                variant="contained"
                size="large"
                disabled={saving}
                onClick={() =>
                  void submit()
                }
              >
                {saving
                  ? 'Submitting...'
                  : 'Submit Application'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
