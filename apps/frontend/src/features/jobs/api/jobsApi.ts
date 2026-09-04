import type { Job, JobSearchParams } from '../types/job'
import { ensureApiSuccess } from '../../../api/apiError'

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

export const fetchPublicJobs = async (
  params: JobSearchParams = {},
): Promise<Job[]> => {
  const response = await fetch(
    `${BASE_URL}${buildQueryString(params)}`
  )

  await ensureApiSuccess(response)

  return response.json() as Promise<Job[]>
}

export const fetchPublicJob = async (
  id: string,
): Promise<Job> => {
  const response = await fetch(`${BASE_URL}/${id}`)

  await ensureApiSuccess(response)

  return response.json() as Promise<Job>
}
