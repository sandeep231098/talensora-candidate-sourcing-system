import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SiteHeader />

      <Box
        component="main"
        sx={{ flexGrow: 1 }}
      >
        <Outlet />
      </Box>

      <SiteFooter />
    </Box>
  )
}