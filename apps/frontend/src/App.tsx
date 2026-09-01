import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  ProtectedRoute,
} from './auth/ProtectedRoute'

import {
  PublicLayout,
} from './components/layout/PublicLayout'

import {
  ApplicationConfirmationPage,
} from './features/candidate/pages/ApplicationConfirmationPage'

import {
  CandidateApplyPage,
} from './features/candidate/pages/CandidateApplyPage'

import {
  CandidateProfilePage,
} from './features/candidate/pages/CandidateProfilePage'
import {
  MyApplicationsPage,
} from './features/candidate/pages/MyApplicationsPage'

import {
  ForbiddenPage,
} from './features/auth/pages/ForbiddenPage'

import {
  LoginPlaceholderPage,
} from './features/auth/pages/LoginPlaceholderPage'

import {
  PortalRedirectPage,
} from './features/auth/pages/PortalRedirectPage'

import {
  RolePortalPage,
} from './features/auth/pages/RolePortalPage'

import {
  RecruiterApplicationReviewPage,
} from './features/recruiter/pages/RecruiterApplicationReviewPage'
import {
  RecruiterDashboardPage,
} from './features/recruiter/pages/RecruiterDashboardPage'

import {
  RequisitionApplicationsPage,
} from './features/recruiter/pages/RequisitionApplicationsPage'
import {
  RequisitionsPage,
} from './features/recruiter/pages/RequisitionsPage'

import {
  JobDetailPage,
} from './features/jobs/pages/JobDetailPage'

import {
  JobsPage,
} from './features/jobs/pages/JobsPage'

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
          element={
            <LoginPlaceholderPage />
          }
        />

        <Route
          path="/forbidden"
          element={<ForbiddenPage />}
        />

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/portal"
            element={
              <PortalRedirectPage />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'CANDIDATE',
              ]}
            />
          }
        >
          <Route
            path="/candidate"
            element={
              <Navigate
                to="/candidate/profile"
                replace
              />
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <CandidateProfilePage />
            }
          />

          <Route
            path="/candidate/applications"
            element={
              <MyApplicationsPage />
            }
          />

          <Route
            path="/jobs/:id/apply"
            element={
              <CandidateApplyPage />
            }
          />

          <Route
            path="/candidate/applications/:applicationId/confirmation"
            element={
              <ApplicationConfirmationPage />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'HR',
              ]}
            />
          }
        >
          <Route
            path="/hr"
            element={
              <RolePortalPage
                title="HR Portal"
                description="Human Resources workspace for recruiting and candidate operations."
              />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'RECRUITER',
              ]}
            />
          }
        >
          <Route
            path="/recruiter"
            element={
              <RecruiterDashboardPage />
            }
          />
          <Route
            path="/recruiter/applications/:applicationId"
            element={
              <RecruiterApplicationReviewPage />
            }
          />
          <Route
            path="/recruiter/requisitions/:requisitionId/applications"
            element={
              <RequisitionApplicationsPage />
            }
          />

          <Route
            path="/recruiter/requisitions"
            element={
              <RequisitionsPage />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'ADMIN',
              ]}
            />
          }
        >
          <Route
            path="/admin"
            element={
              <RolePortalPage
                title="Admin Portal"
                description="Administrative workspace for Talensora platform operations."
              />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'HIRING_MANAGER',
              ]}
            />
          }
        >
          <Route
            path="/hiring-manager"
            element={
              <RolePortalPage
                title="Hiring Manager Portal"
                description="Hiring manager workspace for recruitment reviews and decisions."
              />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'AUDITOR',
              ]}
            />
          }
        >
          <Route
            path="/auditor"
            element={
              <RolePortalPage
                title="Audit Portal"
                description="Read-oriented workspace for audit and compliance activities."
              />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'ACCOUNTS',
              ]}
            />
          }
        >
          <Route
            path="/accounts"
            element={
              <RolePortalPage
                title="Accounts Portal"
                description="Accounts and finance workspace."
              />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              requiredRoles={[
                'CUSTOMER',
              ]}
            />
          }
        >
          <Route
            path="/customer"
            element={
              <RolePortalPage
                title="Customer Portal"
                description="Customer workspace for future Talensora services."
              />
            }
          />
        </Route>

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
