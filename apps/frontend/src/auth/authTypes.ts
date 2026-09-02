export interface AuthUser {
  subject?: string
  username?: string
  email?: string
  name?: string
}

export interface AuthContextValue {
  initialized: boolean
  authenticated: boolean
  user: AuthUser | null
  roles: string[]

  login: (
    returnTo?: string
  ) => Promise<void>

  loginWithGoogle: (
    returnTo?: string
  ) => Promise<void>

  register: (
    returnTo?: string
  ) => Promise<void>

  logout: () => Promise<void>

  hasRole: (
    role: string
  ) => boolean

  getValidToken:
    () => Promise<string | null>
}
