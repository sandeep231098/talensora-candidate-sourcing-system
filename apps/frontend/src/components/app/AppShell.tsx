import { useState, type ReactNode } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'

interface NavigationItem {
  label: string
  path: string
  icon: ReactNode
}

const drawerWidth = 264

const candidateNavigation: NavigationItem[] = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Profile & resume', path: '/candidate/profile', icon: <PersonOutlineIcon /> },
  { label: 'My applications', path: '/candidate/applications', icon: <DescriptionOutlinedIcon /> },
  { label: 'Browse jobs', path: '/jobs', icon: <WorkOutlineIcon /> },
]

const internalNavigation: Record<string, NavigationItem[]> = {
  RECRUITER: [
    { label: 'Dashboard', path: '/recruiter', icon: <DashboardOutlinedIcon /> },
    { label: 'Requisitions', path: '/recruiter/requisitions', icon: <FolderSharedOutlinedIcon /> },
  ],
  HR: [
    { label: 'HR dashboard', path: '/hr', icon: <DashboardOutlinedIcon /> },
    { label: 'Recruiting workspace', path: '/recruiter', icon: <FolderSharedOutlinedIcon /> },
    { label: 'Requisitions', path: '/recruiter/requisitions', icon: <WorkOutlineIcon /> },
  ],
  ADMIN: [
    { label: 'Admin dashboard', path: '/admin', icon: <DashboardOutlinedIcon /> },
    { label: 'Recruiting workspace', path: '/recruiter', icon: <FolderSharedOutlinedIcon /> },
    { label: 'Requisitions', path: '/recruiter/requisitions', icon: <WorkOutlineIcon /> },
  ],
  HIRING_MANAGER: [{ label: 'Hiring workspace', path: '/hiring-manager', icon: <DashboardOutlinedIcon /> }],
  AUDITOR: [{ label: 'Audit workspace', path: '/auditor', icon: <DashboardOutlinedIcon /> }],
  ACCOUNTS: [{ label: 'Accounts workspace', path: '/accounts', icon: <DashboardOutlinedIcon /> }],
}

interface AppShellProps {
  role: 'CANDIDATE' | 'RECRUITER' | 'HR' | 'ADMIN' | 'HIRING_MANAGER' | 'AUDITOR' | 'ACCOUNTS'
  roleLabel: string
}

export function AppShell({ role, roleLabel }: AppShellProps) {
  const auth = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigation = role === 'CANDIDATE' ? candidateNavigation : internalNavigation[role]
  const displayName = auth.user?.name ?? auth.user?.username ?? 'Talensora user'

  const isActive = (path: string) => {
    if (path === '/recruiter/requisitions') {
      return location.pathname.startsWith(path)
    }

    if (path === '/recruiter') {
      return location.pathname === path || location.pathname.startsWith('/recruiter/applications/')
    }

    if (path === '/jobs') {
      return location.pathname.startsWith('/jobs')
    }

    return location.pathname === path
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2.5, minHeight: 72 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, mr: 1.5 }}>T</Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Talensora</Typography>
          <Typography variant="caption" color="text.secondary">{roleLabel}</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label={`${roleLabel} navigation`} sx={{ px: 1.5, py: 2 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/recruiter' || item.path === `/${role.toLowerCase().replace('_', '-')}`}
            onClick={() => setMobileOpen(false)}
            selected={isActive(item.path)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{displayName}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {auth.user?.email ?? roleLabel}
        </Typography>
        <Button fullWidth startIcon={<LogoutOutlinedIcon />} onClick={() => void auth.logout()} sx={{ mt: 1.5 }}>
          Sign out
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', ml: { lg: `${drawerWidth}px` }, width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ minHeight: 72 }}>
          <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ display: { lg: 'none' }, mr: 1 }}><MenuIcon /></IconButton>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, flexGrow: 1 }}>{roleLabel}</Typography>
          <Tooltip title={displayName}><Avatar sx={{ width: 36, height: 36 }}>{displayName.charAt(0).toUpperCase()}</Avatar></Tooltip>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="Primary navigation" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>{drawer}</Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: '72px' }}><Outlet /></Box>
    </Box>
  )
}
