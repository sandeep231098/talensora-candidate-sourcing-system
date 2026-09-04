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
            minHeight: { xs: 64, sm: 72 },
            gap: { xs: 0.75, sm: 2 },
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
              flexShrink: 0,
            }}
            aria-label="Talensora careers home"
          >
            <WorkHistoryOutlinedIcon />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Talensora Careers
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            component={RouterLink}
            to="/jobs"
            color="inherit"
            aria-label="Find jobs"
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
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
                aria-label={portal.label}
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
              aria-label="Sign out"
            >
              Sign out
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to={`/login?returnTo=${returnTo}`}
              variant="contained"
              startIcon={<LoginIcon />}
              aria-label="Sign in"
            >
              Sign in
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
