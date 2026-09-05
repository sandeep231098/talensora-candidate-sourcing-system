import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#3155A6',
      dark: '#203B78',
    },

    secondary: {
      main: '#6750A4',
    },

    background: {
      default: '#F6F7FB',
      paper: '#FFFFFF',
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Roboto, Arial, sans-serif',

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:focus-visible': {
            outline: '3px solid rgba(49, 85, 166, 0.3)',
            outlineOffset: 2,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E3E7EF',
          boxShadow: '0 8px 28px rgba(31, 42, 68, 0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F3F5F9',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#E9EFFC',
            color: '#203B78',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(49, 85, 166, 0.3)',
            outlineOffset: 1,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid rgba(49, 85, 166, 0.3)',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E3E7EF',
        },
      },
    },
  },
})
