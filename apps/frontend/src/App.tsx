import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { PublicLayout } from './components/layout/PublicLayout'

import { LoginPlaceholderPage } from './features/auth/pages/LoginPlaceholderPage'
import { JobDetailPage } from './features/jobs/pages/JobDetailPage'
import { JobsPage } from './features/jobs/pages/JobsPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          index
          element={
            <Navigate
              to="/jobs"
              replace
            />
          }
        />

        <Route
          path="/jobs"
          element={<JobsPage />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetailPage />}
        />

        <Route
          path="/login"
          element={<LoginPlaceholderPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/jobs"
              replace
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App