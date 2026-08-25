import {
  Navigate,
} from 'react-router-dom'

import {
  getPrimaryPortal,
} from '../../../auth/applicationRoles'

import {
  useAuth,
} from '../../../auth/useAuth'

import {
  LoadingState,
} from '../../../components/common/LoadingState'

export function PortalRedirectPage() {
  const auth = useAuth()

  if (!auth.initialized) {
    return (
      <LoadingState message="Opening your portal..." />
    )
  }

  if (!auth.authenticated) {
    return (
      <Navigate
        to="/login?returnTo=%2Fportal"
        replace
      />
    )
  }

  const portal =
    getPrimaryPortal(auth.roles)

  if (!portal) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    )
  }

  return (
    <Navigate
      to={portal.path}
      replace
    />
  )
}