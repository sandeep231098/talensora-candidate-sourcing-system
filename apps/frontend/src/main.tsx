import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'

import { BrowserRouter } from 'react-router-dom'

import App from './App'
import './index.css'

import { appTheme } from './theme/theme'

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)