import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { LoadingState } from '../components/common/LoadingState'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  requiredRoles?: string[]
}

export function ProtectedRoute({
  requiredRoles = [],
}: ProtectedRouteProps) {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.initialized) {
    return (
      <LoadingState message="Checking your session..." />
    )
  }

  if (!auth.authenticated) {
    const returnTo =
      encodeURIComponent(
        `${location.pathname}${location.search}`
      )

    return (
      <Navigate
        to={`/login?returnTo=${returnTo}`}
        replace
      />
    )
  }

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some(
      (role) => auth.hasRole(role)
    )
  ) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    )
  }

  return <Outlet />
}