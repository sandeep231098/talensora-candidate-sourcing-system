import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  AuthContext,
} from './authContext'

import type {
  AuthContextValue,
  AuthUser,
} from './authTypes'

import {
  initializeKeycloak,
  keycloak,
} from './keycloak'

import {
  filterApplicationRoles,
} from './applicationRoles'

interface AuthProviderProps {
  children: ReactNode
}

const readUser = (): AuthUser | null => {
  if (!keycloak.authenticated) {
    return null
  }

  const token = keycloak.tokenParsed

  return {
    subject: keycloak.subject,

    username:
      typeof token?.preferred_username ===
      'string'
        ? token.preferred_username
        : undefined,

    email:
      typeof token?.email === 'string'
        ? token.email
        : undefined,

    name:
      typeof token?.name === 'string'
        ? token.name
        : undefined,
  }
}

const readRoles = (): string[] =>
  filterApplicationRoles(
    keycloak.realmAccess?.roles ?? []
  )

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    initialized,
    setInitialized,
  ] = useState(false)

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false)

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  )

  const [
    roles,
    setRoles,
  ] = useState<string[]>([])

  const synchronizeAuthState =
    useCallback(() => {
      setAuthenticated(
        Boolean(
          keycloak.authenticated
        )
      )

      setUser(
        readUser()
      )

      setRoles(
        readRoles()
      )
    }, [])

  useEffect(() => {
    let active = true

    let refreshTimer:
      number | undefined

    initializeKeycloak()
      .then(() => {
        if (!active) {
          return
        }

        synchronizeAuthState()

        setInitialized(true)

        refreshTimer =
          window.setInterval(
            async () => {
              if (
                !keycloak.authenticated
              ) {
                return
              }

              try {
                const refreshed =
                  await keycloak.updateToken(
                    60
                  )

                if (
                  active &&
                  refreshed
                ) {
                  synchronizeAuthState()
                }
              } catch {
                if (active) {
                  setAuthenticated(
                    false
                  )

                  setUser(null)

                  setRoles([])
                }
              }
            },
            30000
          )
      })
      .catch(
        (error: unknown) => {
          console.error(
            'Keycloak initialization failed',
            error
          )

          if (active) {
            setInitialized(true)

            setAuthenticated(false)

            setUser(null)

            setRoles([])
          }
        }
      )

    return () => {
      active = false

      if (refreshTimer) {
        window.clearInterval(
          refreshTimer
        )
      }
    }
  }, [synchronizeAuthState])

  const login =
    useCallback(
      async (
        returnTo = '/portal'
      ) => {
        await keycloak.login({
          redirectUri:
            `${window.location.origin}${returnTo}`,
        })
      },
      []
    )

  const loginWithGoogle =
    useCallback(
      async (
        returnTo = '/portal'
      ) => {
        await keycloak.login({
          redirectUri:
            `${window.location.origin}${returnTo}`,
          idpHint: 'google',
        })
      },
      []
    )

  const register =
    useCallback(
      async (
        returnTo = '/candidate'
      ) => {
        await keycloak.register({
          redirectUri:
            `${window.location.origin}${returnTo}`,
        })
      },
      []
    )

  const logout =
    useCallback(
      async () => {
        await keycloak.logout({
          redirectUri:
            `${window.location.origin}/jobs`,
        })
      },
      []
    )

  const hasRole =
    useCallback(
      (role: string) =>
        roles.includes(role),
      [roles]
    )

  const getValidToken =
    useCallback(
      async () => {
        if (
          !keycloak.authenticated
        ) {
          return null
        }

        try {
          await keycloak.updateToken(
            30
          )

          return (
            keycloak.token ?? null
          )
        } catch {
          return null
        }
      },
      []
    )

  const value =
    useMemo<AuthContextValue>(
      () => ({
        initialized,
        authenticated,
        user,
        roles,
        login,
        loginWithGoogle,
        register,
        logout,
        hasRole,
        getValidToken,
      }),
      [
        initialized,
        authenticated,
        user,
        roles,
        login,
        loginWithGoogle,
        register,
        logout,
        hasRole,
        getValidToken,
      ]
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}
