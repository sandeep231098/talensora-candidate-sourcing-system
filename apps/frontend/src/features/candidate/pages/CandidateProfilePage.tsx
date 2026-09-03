import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import {
  Link,
} from 'react-router-dom'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  addEducation,
  addExperience,
  deleteCurrentResume,
  deleteEducation,
  deleteExperience,
  downloadCurrentResume,
  fetchCandidateProfile,
  fetchCurrentResume,
  fetchEducation,
  fetchExperience,
  fetchResumeHistory,
  saveCandidateProfile,
  updateEducation,
  updateExperience,
  uploadResume,
} from '../api/candidateApi'

import type {
  CandidateEducation,
  CandidateEducationRequest,
  CandidateExperience,
  CandidateExperienceRequest,
  CandidateProfile,
  CandidateProfileRequest,
  EducationLevel,
  Gender,
  NoticePeriod,
  ResumeResponse,
} from '../types/candidate'

import {
  isValidMobileNumber,
  MOBILE_NUMBER_HELPER_TEXT,
} from '../utils/candidateValidation'

type ProfileForm = {
  firstName: string
  lastName: string
  gender: Gender | ''
  mobileNumber: string
  dateOfBirth: string
  currentLocation: string
  currentCompany: string
  noticePeriod: NoticePeriod | ''
  currentAddress: string
  fresher: boolean
}

type EducationForm = {
  degreeQualification: string
  specialization: string
  institutionUniversity: string
  yearOfPassing: string
  gradeScore: string
  educationLevel: EducationLevel | ''
}

type ExperienceForm = {
  employerName: string
  jobTitle: string
  startDate: string
  endDate: string
  currentlyWorkingHere: boolean
  keyResponsibilities: string
}

const emptyProfileForm: ProfileForm = {
  firstName: '',
  lastName: '',
  gender: '',
  mobileNumber: '',
  dateOfBirth: '',
  currentLocation: '',
  currentCompany: '',
  noticePeriod: '',
  currentAddress: '',
  fresher: false,
}

const emptyEducationForm: EducationForm = {
  degreeQualification: '',
  specialization: '',
  institutionUniversity: '',
  yearOfPassing: '',
  gradeScore: '',
  educationLevel: '',
}

const emptyExperienceForm: ExperienceForm = {
  employerName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  currentlyWorkingHere: false,
  keyResponsibilities: '',
}

function profileToForm(
  profile: CandidateProfile,
): ProfileForm {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender ?? '',
    mobileNumber: profile.mobileNumber,
    dateOfBirth:
      profile.dateOfBirth ?? '',
    currentLocation:
      profile.currentLocation,
    currentCompany:
      profile.currentCompany ?? '',
    noticePeriod:
      profile.noticePeriod ?? '',
    currentAddress:
      profile.currentAddress ?? '',
    fresher: profile.fresher,
  }
}

function formatBytes(
  bytes: number,
): string {
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

export function CandidateProfilePage() {
  const auth = useAuth()

  const [
    profile,
    setProfile,
  ] = useState<CandidateProfile | null>(
    null
  )

  const [
    education,
    setEducation,
  ] = useState<CandidateEducation[]>([])

  const [
    experience,
    setExperience,
  ] = useState<CandidateExperience[]>([])

  const [
    currentResume,
    setCurrentResume,
  ] = useState<ResumeResponse | null>(
    null
  )

  const [
    resumeHistory,
    setResumeHistory,
  ] = useState<ResumeResponse[]>([])

  const [
    profileForm,
    setProfileForm,
  ] = useState<ProfileForm>(
    emptyProfileForm
  )

  const [
    educationForm,
    setEducationForm,
  ] = useState<EducationForm>(
    emptyEducationForm
  )

  const [
    experienceForm,
    setExperienceForm,
  ] = useState<ExperienceForm>(
    emptyExperienceForm
  )

  const [
    editingEducationId,
    setEditingEducationId,
  ] = useState<string | null>(
    null
  )

  const [
    editingExperienceId,
    setEditingExperienceId,
  ] = useState<string | null>(
    null
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    busy,
    setBusy,
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
    let cancelled = false

    fetchCandidateProfile(
      auth.getValidToken
    )
      .then(async (
        loadedProfile
      ) => {
        if (!loadedProfile) {
          return {
            loadedProfile: null,
            loadedEducation:
              [] as CandidateEducation[],
            loadedExperience:
              [] as CandidateExperience[],
            loadedResume: null,
            loadedHistory:
              [] as ResumeResponse[],
          }
        }

        const [
          loadedEducation,
          loadedExperience,
          loadedResume,
          loadedHistory,
        ] =
          await Promise.all([
            fetchEducation(auth.getValidToken),
            fetchExperience(auth.getValidToken),
            fetchCurrentResume(auth.getValidToken),
            fetchResumeHistory(auth.getValidToken),
          ])

        return {
          loadedProfile,
          loadedEducation,
          loadedExperience,
          loadedResume,
          loadedHistory,
        }
      })
      .then((data) => {
        if (cancelled) {
          return
        }

        setProfile(
          data.loadedProfile
        )

        setEducation(
          data.loadedEducation
        )

        setExperience(
          data.loadedExperience
        )

        setCurrentResume(
          data.loadedResume
        )

        setResumeHistory(
          data.loadedHistory
        )

        if (data.loadedProfile) {
          setProfileForm(
            profileToForm(
              data.loadedProfile
            )
          )
        }
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return
        }

        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to load candidate profile.'
        )
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    auth.getValidToken,
  ])

  const profileCompletion =
    useMemo(
      () => {
        const checks = [
          Boolean(profile),
          education.length > 0,
          Boolean(
            profile?.fresher ||
            experience.length > 0
          ),
          Boolean(currentResume),
        ]

        const complete =
          checks.filter(Boolean).length

        return Math.round(
          (
            complete /
            checks.length
          ) * 100
        )
      },
      [
        profile,
        education,
        experience,
        currentResume,
      ],
    )

  const refreshCandidateData =
    async () => {
      const loadedProfile =
        await fetchCandidateProfile(
          auth.getValidToken
        )

      setProfile(
        loadedProfile
      )

      if (!loadedProfile) {
        setEducation([])
        setExperience([])
        setCurrentResume(null)
        setResumeHistory([])
        return
      }

      const [
        loadedEducation,
        loadedExperience,
        loadedResume,
        loadedHistory,
      ] =
        await Promise.all([
          fetchEducation(auth.getValidToken),
          fetchExperience(auth.getValidToken),
          fetchCurrentResume(auth.getValidToken),
          fetchResumeHistory(auth.getValidToken),
        ])

      setEducation(
        loadedEducation
      )

      setExperience(
        loadedExperience
      )

      setCurrentResume(
        loadedResume
      )

      setResumeHistory(
        loadedHistory
      )

      setProfileForm(
        profileToForm(
          loadedProfile
        )
      )
    }

  const beginAction = () => {
    setBusy(true)
    setError(null)
    setSuccess(null)
  }

  const finishAction = () => {
    setBusy(false)
  }

  const saveProfile = async () => {
    if (
      !profileForm.firstName.trim() ||
      !profileForm.lastName.trim() ||
      !profileForm.mobileNumber.trim() ||
      !profileForm.currentLocation.trim()
    ) {
      setError(
        'First name, last name, mobile number and current location are required.'
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

    const request:
      CandidateProfileRequest = {
        firstName:
          profileForm.firstName.trim(),
        lastName:
          profileForm.lastName.trim(),
        gender:
          profileForm.gender ||
          'PREFER_NOT_TO_SAY',
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
      }

    beginAction()

    try {
      await saveCandidateProfile(
        request,
        auth.getValidToken
      )

      await refreshCandidateData()

      setSuccess(
        'Personal information saved.'
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save profile.'
      )
    } finally {
      finishAction()
    }
  }

  const saveEducation = async () => {
    if (
      !educationForm
        .degreeQualification
        .trim() ||
      !educationForm
        .institutionUniversity
        .trim() ||
      !educationForm.yearOfPassing ||
      !educationForm.educationLevel
    ) {
      setError(
        'Degree, institution, year and education level are required.'
      )
      return
    }

    const year =
      Number(
        educationForm.yearOfPassing
      )

    const currentYear =
      new Date().getFullYear()

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      setError(
        'Year of passing must be a valid year and cannot be in the future.'
      )
      return
    }

    const request:
      CandidateEducationRequest = {
        degreeQualification:
          educationForm
            .degreeQualification
            .trim(),
        specialization:
          educationForm
            .specialization
            .trim() || null,
        institutionUniversity:
          educationForm
            .institutionUniversity
            .trim(),
        yearOfPassing: year,
        gradeScore:
          educationForm
            .gradeScore
            .trim() || null,
        educationLevel:
          educationForm.educationLevel,
      }

    beginAction()

    try {
      if (editingEducationId) {
        await updateEducation(
          editingEducationId,
          request,
          auth.getValidToken
        )
      } else {
        await addEducation(
          request,
          auth.getValidToken
        )
      }

      setEducation(
        await fetchEducation(
          auth.getValidToken
        )
      )

      setEducationForm(
        emptyEducationForm
      )

      setEditingEducationId(
        null
      )

      setSuccess(
        'Education details saved.'
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save education.'
      )
    } finally {
      finishAction()
    }
  }

  const editEducation = (
    item: CandidateEducation,
  ) => {
    setEditingEducationId(
      item.id
    )

    setEducationForm({
      degreeQualification:
        item.degreeQualification,
      specialization:
        item.specialization ?? '',
      institutionUniversity:
        item.institutionUniversity,
      yearOfPassing:
        String(
          item.yearOfPassing
        ),
      gradeScore:
        item.gradeScore ?? '',
      educationLevel:
        item.educationLevel,
    })
  }

  const removeEducation =
    async (
      id: string,
    ) => {
      if (
        !window.confirm(
          'Delete this education record?'
        )
      ) {
        return
      }

      beginAction()

      try {
        await deleteEducation(
          id,
          auth.getValidToken
        )

        setEducation(
          await fetchEducation(
            auth.getValidToken
          )
        )

        setSuccess(
          'Education record deleted.'
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to delete education.'
        )
      } finally {
        finishAction()
      }
    }

  const saveExperience = async () => {
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

    if (
      !experienceForm
        .currentlyWorkingHere &&
      !experienceForm.endDate
    ) {
      setError(
        'End date is required unless you currently work here.'
      )
      return
    }

    const request:
      CandidateExperienceRequest = {
        employerName:
          experienceForm
            .employerName
            .trim(),
        jobTitle:
          experienceForm
            .jobTitle
            .trim(),
        startDate:
          experienceForm.startDate,
        endDate:
          experienceForm
            .currentlyWorkingHere
            ? null
            : (
                experienceForm
                  .endDate ||
                null
              ),
        currentlyWorkingHere:
          experienceForm
            .currentlyWorkingHere,
        keyResponsibilities:
          experienceForm
            .keyResponsibilities
            .trim() || null,
      }

    beginAction()

    try {
      if (editingExperienceId) {
        await updateExperience(
          editingExperienceId,
          request,
          auth.getValidToken
        )
      } else {
        await addExperience(
          request,
          auth.getValidToken
        )
      }

      await refreshCandidateData()

      setExperienceForm(
        emptyExperienceForm
      )

      setEditingExperienceId(
        null
      )

      setSuccess(
        'Work experience saved.'
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to save experience.'
      )
    } finally {
      finishAction()
    }
  }

  const editExperience = (
    item: CandidateExperience,
  ) => {
    setEditingExperienceId(
      item.id
    )

    setExperienceForm({
      employerName:
        item.employerName,
      jobTitle:
        item.jobTitle,
      startDate:
        item.startDate,
      endDate:
        item.endDate ?? '',
      currentlyWorkingHere:
        item.currentlyWorkingHere,
      keyResponsibilities:
        item.keyResponsibilities ??
        '',
    })
  }

  const removeExperience =
    async (
      id: string,
    ) => {
      if (
        !window.confirm(
          'Delete this work experience record?'
        )
      ) {
        return
      }

      beginAction()

      try {
        await deleteExperience(
          id,
          auth.getValidToken
        )

        await refreshCandidateData()

        setSuccess(
          'Work experience deleted.'
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to delete experience.'
        )
      } finally {
        finishAction()
      }
    }

  const handleResumeUpload =
    async (
      file: File | undefined,
    ) => {
      if (!file) {
        return
      }

      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase()

      if (
        ![
          'pdf',
          'doc',
          'docx',
        ].includes(
          extension ?? ''
        )
      ) {
        setError(
          'Resume must be PDF, DOC or DOCX.'
        )
        return
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          'Resume must be 5 MB or smaller.'
        )
        return
      }

      beginAction()

      try {
        await uploadResume(
          file,
          auth.getValidToken
        )

        await refreshCandidateData()

        setSuccess(
          'New resume version uploaded.'
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to upload resume.'
        )
      } finally {
        finishAction()
      }
    }

  const downloadResume =
    async () => {
      if (!currentResume) {
        return
      }

      beginAction()

      try {
        const blob =
          await downloadCurrentResume(
            auth.getValidToken
          )

        const url =
          URL.createObjectURL(
            blob
          )

        const anchor =
          document.createElement(
            'a'
          )

        anchor.href = url
        anchor.download =
          currentResume
            .originalFilename

        document.body.appendChild(
          anchor
        )

        anchor.click()
        anchor.remove()

        URL.revokeObjectURL(
          url
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to download resume.'
        )
      } finally {
        finishAction()
      }
    }

  const removeCurrentResume =
    async () => {
      if (
        !window.confirm(
          'Delete the current resume? Existing submitted applications will keep their pinned resume version.'
        )
      ) {
        return
      }

      beginAction()

      try {
        await deleteCurrentResume(
          auth.getValidToken
        )

        await refreshCandidateData()

        setSuccess(
          'Current resume deleted.'
        )
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Unable to delete resume.'
        )
      } finally {
        finishAction()
      }
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
          Loading candidate profile...
        </Typography>

        <LinearProgress />
      </Container>
    )
  }

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
            Candidate Profile
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Maintain your profile once and
            reuse it for future applications.
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/candidate/applications"
          variant="outlined"
        >
          My Applications
        </Button>
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Profile completeness
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              my: 1,
            }}
          >
            {profileCompletion}% complete
          </Typography>

          <LinearProgress
            variant="determinate"
            value={
              profileCompletion
            }
          />
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
            Personal Information
          </Typography>

          {profile?.email && (
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
              sx={{
                mb: 2,
              }}
            />
          )}

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
                setProfileForm({
                  ...profileForm,
                  firstName:
                    event.target.value,
                })
              }
            />

            <TextField
              required
              label="Last Name"
              value={
                profileForm.lastName
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  lastName:
                    event.target.value,
                })
              }
            />

            <TextField
              select
              label="Gender"
              value={
                profileForm.gender
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  gender:
                    event.target
                      .value as
                        Gender | '',
                })
              }
            >
              <MenuItem value="">
                Not specified
              </MenuItem>

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
              id="candidate-profile-mobile-number"
              name="mobileNumber"
              label="Mobile Number"
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
                setProfileForm({
                  ...profileForm,
                  mobileNumber:
                    event.target.value,
                })
              }
            />

            <TextField
              type="date"
              label="Date of Birth"
              value={
                profileForm.dateOfBirth
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  dateOfBirth:
                    event.target.value,
                })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              required
              label="Current Location"
              value={
                profileForm
                  .currentLocation
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  currentLocation:
                    event.target.value,
                })
              }
            />

            <TextField
              label="Current Company"
              value={
                profileForm
                  .currentCompany
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  currentCompany:
                    event.target.value,
                })
              }
            />

            <TextField
              select
              label="Notice Period"
              value={
                profileForm.noticePeriod
              }
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  noticePeriod:
                    event.target
                      .value as
                        NoticePeriod | '',
                })
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
            fullWidth
            multiline
            rows={3}
            label="Current Address"
            value={
              profileForm
                .currentAddress
            }
            onChange={(event) =>
              setProfileForm({
                ...profileForm,
                currentAddress:
                  event.target.value,
              })
            }
            sx={{
              mt: 2,
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={
                  profileForm.fresher
                }
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    fresher:
                      event.target.checked,
                  })
                }
              />
            }
            label="I am a fresher"
          />

          {profileForm.fresher &&
            experience.length > 0 && (
              <Alert
                severity="warning"
                sx={{
                  my: 2,
                }}
              >
                Saving as fresher will remove
                existing work experience,
                because the backend treats
                fresher and experienced
                candidate data as mutually
                exclusive.
              </Alert>
            )}

          <Box
            sx={{
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              disabled={busy}
              onClick={saveProfile}
            >
              Save Personal Information
            </Button>
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
            }}
          >
            Education
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {education.map(
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

                <Typography
                  color="text.secondary"
                >
                  {
                    item.institutionUniversity
                  }
                  {' · '}
                  {item.yearOfPassing}
                </Typography>

                {item.specialization && (
                  <Typography>
                    {
                      item.specialization
                    }
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() =>
                      editEducation(
                        item
                      )
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      void removeEducation(
                        item.id
                      )
                    }
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )
          )}

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mt: 3,
              mb: 2,
            }}
          >
            {editingEducationId
              ? 'Edit Education'
              : 'Add Education'}
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
                setEducationForm({
                  ...educationForm,
                  degreeQualification:
                    event.target.value,
                })
              }
            />

            <TextField
              label="Specialization"
              value={
                educationForm
                  .specialization
              }
              onChange={(event) =>
                setEducationForm({
                  ...educationForm,
                  specialization:
                    event.target.value,
                })
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
                setEducationForm({
                  ...educationForm,
                  institutionUniversity:
                    event.target.value,
                })
              }
            />

            <TextField
              required
              type="number"
              label="Year of Passing"
              value={
                educationForm
                  .yearOfPassing
              }
              onChange={(event) =>
                setEducationForm({
                  ...educationForm,
                  yearOfPassing:
                    event.target.value,
                })
              }
            />

            <TextField
              label="Grade / Score"
              value={
                educationForm
                  .gradeScore
              }
              onChange={(event) =>
                setEducationForm({
                  ...educationForm,
                  gradeScore:
                    event.target.value,
                })
              }
            />

            <TextField
              select
              required
              label="Education Level"
              value={
                educationForm
                  .educationLevel
              }
              onChange={(event) =>
                setEducationForm({
                  ...educationForm,
                  educationLevel:
                    event.target
                      .value as
                        EducationLevel | '',
                })
              }
            >
              <MenuItem value="HIGH_SCHOOL">
                High School
              </MenuItem>

              <MenuItem value="DIPLOMA">
                Diploma
              </MenuItem>

              <MenuItem value="BACHELORS">
                Bachelor's
              </MenuItem>

              <MenuItem value="MASTERS">
                Master's
              </MenuItem>

              <MenuItem value="DOCTORATE">
                Doctorate
              </MenuItem>
            </TextField>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              disabled={busy}
              onClick={saveEducation}
            >
              {editingEducationId
                ? 'Update Education'
                : 'Add Education'}
            </Button>

            {editingEducationId && (
              <Button
                onClick={() => {
                  setEditingEducationId(
                    null
                  )
                  setEducationForm(
                    emptyEducationForm
                  )
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {!profileForm.fresher && (
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

            {profile && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Total experience:
                {' '}
                {
                  profile.totalExperienceMonths
                }
                {' months'}
              </Typography>
            )}

            <Divider
              sx={{
                my: 2,
              }}
            />

            {experience.map(
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

                  <Typography
                    color="text.secondary"
                  >
                    {item.employerName}
                  </Typography>

                  <Typography
                    variant="body2"
                  >
                    {item.startDate}
                    {' - '}
                    {
                      item.currentlyWorkingHere
                        ? 'Present'
                        : item.endDate
                    }
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() =>
                        editExperience(
                          item
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        void removeExperience(
                          item.id
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              )
            )}

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mt: 3,
                mb: 2,
              }}
            >
              {editingExperienceId
                ? 'Edit Experience'
                : 'Add Experience'}
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
                label="Employer Name"
                value={
                  experienceForm
                    .employerName
                }
                onChange={(event) =>
                  setExperienceForm({
                    ...experienceForm,
                    employerName:
                      event.target.value,
                  })
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
                  setExperienceForm({
                    ...experienceForm,
                    jobTitle:
                      event.target.value,
                  })
                }
              />

              <TextField
                required
                type="date"
                label="Start Date"
                value={
                  experienceForm
                    .startDate
                }
                onChange={(event) =>
                  setExperienceForm({
                    ...experienceForm,
                    startDate:
                      event.target.value,
                  })
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                type="date"
                label="End Date"
                disabled={
                  experienceForm
                    .currentlyWorkingHere
                }
                value={
                  experienceForm.endDate
                }
                onChange={(event) =>
                  setExperienceForm({
                    ...experienceForm,
                    endDate:
                      event.target.value,
                  })
                }
                slotProps={{
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
                    setExperienceForm({
                      ...experienceForm,
                      currentlyWorkingHere:
                        event.target.checked,
                      endDate:
                        event.target.checked
                          ? ''
                          : experienceForm
                              .endDate,
                    })
                  }
                />
              }
              label="I currently work here"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Key Responsibilities"
              value={
                experienceForm
                  .keyResponsibilities
              }
              onChange={(event) =>
                setExperienceForm({
                  ...experienceForm,
                  keyResponsibilities:
                    event.target.value,
                })
              }
              sx={{
                mt: 1,
              }}
            />

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                disabled={busy}
                onClick={saveExperience}
              >
                {editingExperienceId
                  ? 'Update Experience'
                  : 'Add Experience'}
              </Button>

              {editingExperienceId && (
                <Button
                  onClick={() => {
                    setEditingExperienceId(
                      null
                    )
                    setExperienceForm(
                      emptyExperienceForm
                    )
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Resume
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {currentResume ? (
            <Box
              sx={{
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
                  currentResume
                    .originalFilename
                }
              </Typography>

              <Typography
                color="text.secondary"
              >
                Version
                {' '}
                {
                  currentResume
                    .resumeVersion
                }
                {' · '}
                {
                  formatBytes(
                    currentResume
                      .sizeBytes
                  )
                }
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mt: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  disabled={busy}
                  onClick={() =>
                    void downloadResume()
                  }
                >
                  Download
                </Button>

                <Button
                  color="error"
                  disabled={busy}
                  onClick={() =>
                    void removeCurrentResume()
                  }
                >
                  Delete Current Resume
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert
              severity="info"
              sx={{
                mb: 2,
              }}
            >
              No active resume uploaded.
            </Alert>
          )}

          <Box
            sx={{
              mt: 2,
            }}
          >
            <Button
              component="label"
              variant="contained"
              disabled={busy}
            >
              {currentResume
                ? 'Upload New Version'
                : 'Upload Resume'}

              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  const file =
                    event.target
                      .files?.[0]

                  void handleResumeUpload(
                    file
                  )

                  event.target.value =
                    ''
                }}
              />
            </Button>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mt: 4,
              mb: 2,
            }}
          >
            Resume History
          </Typography>

          {resumeHistory.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              No resume history yet.
            </Typography>
          ) : (
            resumeHistory.map(
              (item) => (
                <Box
                  key={item.id}
                  sx={{
                    py: 1.5,
                    borderBottom:
                      '1px solid',
                    borderColor:
                      'divider',
                  }}
                >
                  <Typography>
                    {
                      item.originalFilename
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Version
                    {' '}
                    {item.resumeVersion}
                    {' · '}
                    {
                      item.active
                        ? 'Active'
                        : 'Historical'
                    }
                    {' · '}
                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }
                  </Typography>
                </Box>
              )
            )
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
