import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'

import {
  BrowserRouter,
} from 'react-router-dom'

import App from './App'
import './index.css'

import { AuthProvider } from './auth/AuthProvider'
import { initializeKeycloak } from './auth/keycloak'
import { appTheme } from './theme/theme'

const rootElement =
  document.getElementById('root')

if (!rootElement) {
  throw new Error(
    'Root element was not found.'
  )
}

const root =
  createRoot(rootElement)

const renderApplication = () => {
  root.render(
    <StrictMode>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />

        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>,
  )
}

initializeKeycloak()
  .catch((error: unknown) => {
    console.error(
      'Initial Keycloak startup failed',
      error
    )
  })
  .finally(() => {
    renderApplication()
  })