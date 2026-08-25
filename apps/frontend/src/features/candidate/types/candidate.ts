export type Gender =
  | 'MALE'
  | 'FEMALE'
  | 'OTHER'
  | 'PREFER_NOT_TO_SAY'

export type NoticePeriod =
  | 'IMMEDIATE'
  | 'DAYS_15'
  | 'DAYS_30'
  | 'DAYS_60'
  | 'DAYS_90_PLUS'

export type EducationLevel =
  | 'HIGH_SCHOOL'
  | 'DIPLOMA'
  | 'BACHELORS'
  | 'MASTERS'
  | 'DOCTORATE'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'

export type ApplicationStatus =
  | 'NEW'
  | 'REVIEWED'
  | 'SHORTLISTED'
  | 'REJECTED'

export interface PublicJob {
  id: string
  requisitionId: string
  jobTitle: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceRange: string
  numberOfOpenings: number
  hiringManager: string
  jobDescription: string
  maximumSalaryBudget: number | null
  hiringCompletedBy: string | null
  status: 'PUBLISHED'
  postedAt: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface CandidateProfileRequest {
  firstName: string
  lastName: string
  gender: Gender
  mobileNumber: string
  dateOfBirth: string | null
  currentLocation: string
  currentCompany: string | null
  noticePeriod: NoticePeriod | null
  currentAddress: string | null
  fresher: boolean
}

export interface CandidateProfile extends CandidateProfileRequest {
  id: string
  email: string
  totalExperienceMonths: number
  createdAt: string
  updatedAt: string
  version: number
}

export interface CandidateEducationRequest {
  degreeQualification: string
  specialization: string | null
  institutionUniversity: string
  yearOfPassing: number
  gradeScore: string | null
  educationLevel: EducationLevel
}

export interface CandidateEducation
  extends CandidateEducationRequest {
  id: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface CandidateExperienceRequest {
  employerName: string
  jobTitle: string
  startDate: string
  endDate: string | null
  currentlyWorkingHere: boolean
  keyResponsibilities: string | null
}

export interface CandidateExperience
  extends CandidateExperienceRequest {
  id: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface ResumeResponse {
  id: string
  resumeVersion: number
  originalFilename: string
  fileType: string
  contentType: string
  sizeBytes: number
  active: boolean
  createdAt: string
}

export interface SubmitApplicationRequest {
  requisitionId: string
  coverNote: string | null
  dataAccuracyConsent: boolean
  privacyConsent: boolean
}

export interface ApplicationResponse {
  id: string
  applicationReference: string
  requisitionId: string
  resumeId: string
  resumeVersion: number
  status: ApplicationStatus
  coverNote: string | null
  submittedAt: string
  updatedAt: string
}

export interface CandidateApplicationSummary {
  applicationId: string
  applicationReference: string
  status: ApplicationStatus
  submittedAt: string
  requisitionId: string
  requisitionNumber: string
  jobTitle: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceRange: string
  requisitionStatus:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'CLOSED'
  resumeVersion: number
}