import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'

import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined'

import {
  Link as RouterLink,
  useLocation,
} from 'react-router-dom'

import {
  getPrimaryPortal,
} from '../../auth/applicationRoles'

import {
  useAuth,
} from '../../auth/useAuth'

export function SiteHeader() {
  const location = useLocation()
  const auth = useAuth()

  const returnTo =
    encodeURIComponent(
      `${location.pathname}${location.search}`
    )

  const portal =
    getPrimaryPortal(auth.roles)

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 72,
            gap: 2,
          }}
        >
          <Box
            component={RouterLink}
            to="/jobs"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            <WorkHistoryOutlinedIcon />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              SmartSkale Careers
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            component={RouterLink}
            to="/jobs"
            color="inherit"
          >
            Find Jobs
          </Button>

          {auth.initialized &&
            auth.authenticated &&
            portal && (
              <Button
                component={RouterLink}
                to={portal.path}
                color="inherit"
              >
                {portal.label}
              </Button>
            )}

          {auth.initialized &&
          auth.authenticated ? (
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() =>
                void auth.logout()
              }
            >
              Sign out
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to={`/login?returnTo=${returnTo}`}
              variant="contained"
              startIcon={<LoginIcon />}
            >
              Sign in
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}