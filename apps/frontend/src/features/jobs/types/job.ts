export interface Job {
  id: string
  requisitionId: string
  jobTitle: string
  department: string
  location: string
  employmentType: string
  experienceRange: string
  numberOfOpenings: number
  hiringManager: string
  jobDescription: string
  maximumSalaryBudget: number | null
  hiringCompletedBy: string | null
  status: string
  postedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface JobSearchParams {
  search?: string
  department?: string
  location?: string
  employmentType?: string
  experience?: string
}