export interface ApiErrorResponse {
  message?: unknown
  fieldErrors?: unknown
  correlationId?: unknown
}

const fallbackForStatus = (status: number): string => {
  if (status === 401) return 'Please sign in to continue.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'The requested resource could not be found.'
  if (status >= 500) return 'The service is temporarily unavailable. Please try again.'
  return 'The request could not be completed. Please check your input and try again.'
}

export const getApiErrorMessage = async (
  response: Response,
): Promise<string> => {
  let body: ApiErrorResponse | null = null

  try {
    body = await response.json() as ApiErrorResponse
  } catch {
    // A safe status-based fallback is used for non-JSON responses.
  }

  const fieldMessages =
    body?.fieldErrors && typeof body.fieldErrors === 'object'
      ? Object.values(body.fieldErrors).filter(
          (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
        )
      : []

  const message = fieldMessages.length > 0
    ? [...new Set(fieldMessages)].join(' ')
    : typeof body?.message === 'string' && body.message.trim()
      ? body.message.trim()
      : fallbackForStatus(response.status)

  const correlationId =
    typeof body?.correlationId === 'string' && body.correlationId.trim()
      ? body.correlationId.trim()
      : response.headers.get('X-Correlation-Id')?.trim()

  return correlationId
    ? `${message} Reference: ${correlationId}`
    : message
}

export const ensureApiSuccess = async (
  response: Response,
): Promise<Response> => {
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response))
  }
  return response
}
