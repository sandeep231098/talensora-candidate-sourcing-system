import type { Job, JobSearchParams } from '../types/job'

const BASE_URL = '/api/v1/public/jobs'

const buildQueryString = (params: JobSearchParams): string => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value?.trim()) {
      query.append(key, value.trim())
    }
  })

  const value = query.toString()

  return value ? `?${value}` : ''
}

const ensureSuccess = async (response: Response): Promise<void> => {
  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}`
    )
  }
}

export const fetchPublicJobs = async (
  params: JobSearchParams = {},
): Promise<Job[]> => {
  const response = await fetch(
    `${BASE_URL}${buildQueryString(params)}`
  )

  await ensureSuccess(response)

  return response.json() as Promise<Job[]>
}

export const fetchPublicJob = async (
  id: string,
): Promise<Job> => {
  const response = await fetch(`${BASE_URL}/${id}`)

  await ensureSuccess(response)

  return response.json() as Promise<Job>
}