import {
  authenticatedFetch,
} from '../../auth/api/authenticatedFetch'
import { ensureApiSuccess } from '../../../api/apiError'

import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminRequisition,
  ApplicationStatus,
  RequisitionRequest,
} from '../types/recruiter'

type TokenProvider =
  () => Promise<string | null>

const ensureSuccess = async (
  response: Response,
): Promise<Response> => {
  return ensureApiSuccess(response)
}

export async function fetchAdminApplications(
  getToken: TokenProvider,
): Promise<AdminApplication[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/admin/applications',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchAdminRequisitions(
  getToken: TokenProvider,
): Promise<AdminRequisition[]> {
  const response =
    await authenticatedFetch(
      '/api/v1/admin/requisitions',
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function createAdminRequisition(
  request: RequisitionRequest,
  getToken: TokenProvider,
): Promise<AdminRequisition> {
  const response =
    await authenticatedFetch(
      '/api/v1/admin/requisitions',
      getToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function updateAdminRequisition(
  requisitionId: string,
  request: RequisitionRequest,
  getToken: TokenProvider,
): Promise<AdminRequisition> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/requisitions/${requisitionId}`,
      getToken,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function publishAdminRequisition(
  requisitionId: string,
  getToken: TokenProvider,
): Promise<AdminRequisition> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/requisitions/${requisitionId}/publish`,
      getToken,
      {
        method: 'POST',
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function closeAdminRequisition(
  requisitionId: string,
  getToken: TokenProvider,
): Promise<AdminRequisition> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/requisitions/${requisitionId}/close`,
      getToken,
      {
        method: 'POST',
      },
    )

  await ensureSuccess(response)

  return response.json()
}

export async function fetchAdminApplicationDetail(
  applicationId: string,
  getToken: TokenProvider,
): Promise<AdminApplicationDetail> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/applications/${applicationId}`,
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  getToken: TokenProvider,
): Promise<AdminApplication> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/applications/${applicationId}/status`,
      getToken,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      },
    )

  await ensureSuccess(response)

  return response.json()
}

const getFilename = (
  response: Response,
  fallback: string,
): string => {
  const disposition =
    response.headers.get(
      'Content-Disposition',
    )

  if (!disposition) {
    return fallback
  }

  const utf8Match =
    disposition.match(
      /filename\*=UTF-8''([^;]+)/,
    )

  if (utf8Match?.[1]) {
    return decodeURIComponent(
      utf8Match[1],
    )
  }

  const normalMatch =
    disposition.match(
      /filename="?([^";]+)"?/,
    )

  return normalMatch?.[1] ??
    fallback
}

export async function downloadApplicationResume(
  application: AdminApplication,
  getToken: TokenProvider,
): Promise<void> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/applications/${application.id}/resume`,
      getToken,
    )

  await ensureSuccess(response)

  const blob =
    await response.blob()

  const objectUrl =
    URL.createObjectURL(blob)

  const anchor =
    document.createElement('a')

  anchor.href = objectUrl

  anchor.download =
    getFilename(
      response,
      application.resumeFilename,
    )

  document.body.appendChild(anchor)

  anchor.click()

  anchor.remove()

  URL.revokeObjectURL(objectUrl)
}
export async function fetchRequisitionApplications(
  requisitionId: string,
  getToken: TokenProvider,
): Promise<AdminApplication[]> {
  const response =
    await authenticatedFetch(
      `/api/v1/admin/requisitions/${requisitionId}/applications`,
      getToken,
    )

  await ensureSuccess(response)

  return response.json()
}

export async function exportRequisitionApplications(
  requisitionId: string,
  search: string,
  status: ApplicationStatus | '',
  getToken: TokenProvider,
): Promise<void> {
  const params =
    new URLSearchParams()

  const trimmedSearch =
    search.trim()

  if (trimmedSearch) {
    params.set(
      'search',
      trimmedSearch,
    )
  }

  if (status) {
    params.set(
      'status',
      status,
    )
  }

  const query =
    params.toString()

  const endpoint =
    `/api/v1/admin/requisitions/${requisitionId}/applications/export` +
    (query ? `?${query}` : '')

  const response =
    await authenticatedFetch(
      endpoint,
      getToken,
    )

  await ensureSuccess(response)

  const blob =
    await response.blob()

  const disposition =
    response.headers.get(
      'Content-Disposition'
    ) ??
    response.headers.get(
      'content-disposition'
    )

  let filename =
    `applications-${requisitionId}.csv`

  const encodedFilename =
    disposition?.match(
      /filename\*=UTF-8''([^;]+)/i
    )

  const simpleFilename =
    disposition?.match(
      /filename="?([^";]+)"?/i
    )

  if (encodedFilename?.[1]) {
    filename =
      decodeURIComponent(
        encodedFilename[1]
      )
  } else if (simpleFilename?.[1]) {
    filename =
      simpleFilename[1]
  }

  const url =
    URL.createObjectURL(blob)

  const anchor =
    document.createElement('a')

  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
