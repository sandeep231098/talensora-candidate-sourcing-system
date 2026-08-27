import type {
  CandidateEducation,
  CandidateExperience,
  CandidateProfile,
} from '../../candidate/types/candidate'
export type ApplicationStatus =
  | 'NEW'
  | 'REVIEWED'
  | 'SHORTLISTED'
  | 'REJECTED'

export type RequisitionStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CLOSED'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'

export interface AdminApplication {
  id: string
  applicationReference: string
  status: ApplicationStatus
  submittedAt: string

  candidateId: string
  candidateFirstName: string
  candidateLastName: string
  candidateEmail: string
  candidateLocation: string
  totalExperienceMonths: number

  requisitionId: string
  requisitionNumber: string
  jobTitle: string
  department: string
  jobLocation: string

  resumeId: string
  resumeVersion: number
  resumeFilename: string
  resumeFileType: string
  resumeSizeBytes: number

  coverNote: string | null
  updatedAt: string
}

export interface AdminRequisition {
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
  status: RequisitionStatus
  postedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface RequisitionRequest {
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
}
export interface AdminApplicationDetail {
  application: AdminApplication
  candidateProfile: CandidateProfile
  education: CandidateEducation[]
  workExperience: CandidateExperience[]
}