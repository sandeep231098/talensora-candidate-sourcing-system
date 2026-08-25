type TokenProvider =
  () => Promise<string | null>

export async function authenticatedFetch(
  input: RequestInfo | URL,
  getToken: TokenProvider,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getToken()

  if (!token) {
    throw new Error(
      'Authentication token is unavailable.'
    )
  }

  const headers =
    new Headers(init.headers)

  headers.set(
    'Authorization',
    `Bearer ${token}`
  )

  return fetch(input, {
    ...init,
    headers,
  })
}