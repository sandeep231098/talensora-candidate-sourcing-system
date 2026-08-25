import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#243B73',
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
    borderRadius: 12,
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
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E7E9F0',
          boxShadow: '0 4px 18px rgba(25, 35, 60, 0.05)',
        },
      },
    },
  },
})