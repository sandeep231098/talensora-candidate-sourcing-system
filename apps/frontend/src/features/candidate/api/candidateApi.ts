import {
  authenticatedFetch,
} from '../../auth/api/authenticatedFetch'

import type {
  ApplicationResponse,
  CandidateApplicationSummary,
  CandidateEducation,
  CandidateEducationRequest,
  CandidateExperience,
  CandidateExperienceRequest,
  CandidateProfile,
  CandidateProfileRequest,
  PublicJob,
  ResumeResponse,
  SubmitApplicationRequest,
} from '../types/candidate'

type TokenProvider =
  () => Promise<string | null>

const errorMessage = async (
  response: Response,
): Promise<string> => {
  try {
    const body: unknown =
      await response.json()

    if (
      body &&
      typeof body === 'object' &&
      'fieldErrors' in body &&
      body.fieldErrors &&
      typeof body.fieldErrors ===
        'object'
    ) {
      const fieldMessages =
        Object.values(
          body.fieldErrors
        ).filter(
          (value): value is string =>
            typeof value === 'string' &&
            value.trim().length > 0
        )

      if (fieldMessages.length > 0) {
        return [
          ...new Set(fieldMessages),
        ].join(' ')
      }
    }

    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
    ) {
      return body.message
    }
  } catch {
    // Keep generic fallback.
  }

  return `Request failed with HTTP ${response.status}`
}

const ensureSuccess = async (
  response: Response,
): Promise<Response> => {
  if (response.ok) {
    return response
  }

  throw new Error(
    await errorMessage(response)
  )
}

export async function fetchPublicJob(
  id: string,
): Promise<PublicJob> {
  const response =
    await fetch(
      `/api/v1/public/jobs/${id}`
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchCandidateProfile(
  getToken: TokenProvider,
): Promise<CandidateProfile | null> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/profile',
      getToken,
    )

  if (response.status === 404) {
    return null
  }

  await ensureSuccess(response)

  return response.json()
}

export async function saveCandidateProfile(
  request: CandidateProfileRequest,
  getToken: TokenProvider,
): Promise<CandidateProfile> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/profile',
      getToken,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchEducation(
  getToken: TokenProvider,
): Promise<CandidateEducation[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/education',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function addEducation(
  request: CandidateEducationRequest,
  getToken: TokenProvider,
): Promise<CandidateEducation> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/education',
      getToken,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function updateEducation(
  id: string,
  request: CandidateEducationRequest,
  getToken: TokenProvider,
): Promise<CandidateEducation> {
  const response =
    await authenticatedFetch(
      `/api/v1/candidate/education/${id}`,
      getToken,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}
export async function deleteEducation(
  id: string,
  getToken: TokenProvider,
): Promise<void> {
  const response =
    await authenticatedFetch(
      `/api/v1/candidate/education/${id}`,
      getToken,
      {
        method: 'DELETE',
      },
    )

  await ensureSuccess(response)
}

export async function fetchExperience(
  getToken: TokenProvider,
): Promise<CandidateExperience[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/experience',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function addExperience(
  request: CandidateExperienceRequest,
  getToken: TokenProvider,
): Promise<CandidateExperience> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/experience',
      getToken,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function updateExperience(
  id: string,
  request: CandidateExperienceRequest,
  getToken: TokenProvider,
): Promise<CandidateExperience> {
  const response =
    await authenticatedFetch(
      `/api/v1/candidate/experience/${id}`,
      getToken,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}
export async function deleteExperience(
  id: string,
  getToken: TokenProvider,
): Promise<void> {
  const response =
    await authenticatedFetch(
      `/api/v1/candidate/experience/${id}`,
      getToken,
      {
        method: 'DELETE',
      },
    )

  await ensureSuccess(response)
}

export async function fetchCurrentResume(
  getToken: TokenProvider,
): Promise<ResumeResponse | null> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/resume',
      getToken,
    )

  if (response.status === 404) {
    return null
  }

  await ensureSuccess(response)

  return response.json()
}

export async function uploadResume(
  file: File,
  getToken: TokenProvider,
): Promise<ResumeResponse> {
  const formData = new FormData()

  formData.append(
    'file',
    file
  )

  const response =
    await authenticatedFetch(
      '/api/v1/candidate/resume',
      getToken,
      {
        method: 'POST',
        body: formData,
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchResumeHistory(
  getToken: TokenProvider,
): Promise<ResumeResponse[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/resume/history',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function downloadCurrentResume(
  getToken: TokenProvider,
): Promise<Blob> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/resume/download',
      getToken,
    )

  await ensureSuccess(response)

  return response.blob()
}

export async function deleteCurrentResume(
  getToken: TokenProvider,
): Promise<void> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/resume',
      getToken,
      {
        method: 'DELETE',
      },
    )

  await ensureSuccess(response)
}
export async function submitApplication(
  request: SubmitApplicationRequest,
  getToken: TokenProvider,
): Promise<ApplicationResponse> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/applications',
      getToken,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchMyApplications(
  getToken: TokenProvider,
): Promise<CandidateApplicationSummary[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/candidate/applications',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}
