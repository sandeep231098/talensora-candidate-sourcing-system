import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoadingState } from './components/common/LoadingState'
import { AppShell } from './components/app/AppShell'
import { PublicLayout } from './components/layout/PublicLayout'

const page = <T extends Record<string, unknown>>(
  loader: () => Promise<T>, exportName: keyof T,
) => lazy(async () => ({ default: (await loader())[exportName] as ComponentType }))

const JobsPage = page(() => import('./features/jobs/pages/JobsPage'), 'JobsPage')
const JobDetailPage = page(() => import('./features/jobs/pages/JobDetailPage'), 'JobDetailPage')
const LoginPlaceholderPage = page(() => import('./features/auth/pages/LoginPlaceholderPage'), 'LoginPlaceholderPage')
const ForbiddenPage = page(() => import('./features/auth/pages/ForbiddenPage'), 'ForbiddenPage')
const PortalRedirectPage = page(() => import('./features/auth/pages/PortalRedirectPage'), 'PortalRedirectPage')
const CandidateProfilePage = page(() => import('./features/candidate/pages/CandidateProfilePage'), 'CandidateProfilePage')
const CandidateDashboardPage = page(
  () => import('./features/candidate/pages/CandidateDashboardPage'),
  'CandidateDashboardPage',
)
const CandidateApplyPage = page(() => import('./features/candidate/pages/CandidateApplyPage'), 'CandidateApplyPage')
const MyApplicationsPage = page(() => import('./features/candidate/pages/MyApplicationsPage'), 'MyApplicationsPage')
const ApplicationConfirmationPage = page(() => import('./features/candidate/pages/ApplicationConfirmationPage'), 'ApplicationConfirmationPage')
const RecruiterDashboardPage = page(() => import('./features/recruiter/pages/RecruiterDashboardPage'), 'RecruiterDashboardPage')
const RecruiterApplicationReviewPage = page(() => import('./features/recruiter/pages/RecruiterApplicationReviewPage'), 'RecruiterApplicationReviewPage')
const RequisitionApplicationsPage = page(() => import('./features/recruiter/pages/RequisitionApplicationsPage'), 'RequisitionApplicationsPage')
const RequisitionsPage = page(() => import('./features/recruiter/pages/RequisitionsPage'), 'RequisitionsPage')
const NotFoundPage = page(() => import('./features/auth/pages/NotFoundPage'), 'NotFoundPage')
const internalDashboards = () => import('./features/auth/pages/InternalDashboards')
const HrDashboardPage = page(internalDashboards, 'HrDashboardPage')
const AdminDashboardPage = page(internalDashboards, 'AdminDashboardPage')
const HiringManagerDashboardPage = page(internalDashboards, 'HiringManagerDashboardPage')
const AuditorDashboardPage = page(internalDashboards, 'AuditorDashboardPage')
const AccountsDashboardPage = page(internalDashboards, 'AccountsDashboardPage')

const internalRoles = [
  'ADMIN',
  'HR',
  'RECRUITER',
  'HIRING_MANAGER',
  'AUDITOR',
  'ACCOUNTS',
]

export default function App() {
  return (
    <Suspense fallback={<LoadingState message="Loading Talensora..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/login" element={<LoginPlaceholderPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<PortalRedirectPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          element={(
            <ProtectedRoute
              requiredRoles={['CANDIDATE']}
              forbiddenRoles={internalRoles}
            />
          )}
        >
          <Route element={<AppShell role="CANDIDATE" roleLabel="Candidate workspace" />}>
            <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
            <Route path="/candidate/applications" element={<MyApplicationsPage />} />
            <Route path="/jobs/:id/apply" element={<CandidateApplyPage />} />
            <Route path="/candidate/applications/:applicationId/confirmation" element={<ApplicationConfirmationPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['RECRUITER', 'ADMIN']} />}>
          <Route element={<AppShell role="RECRUITER" roleLabel="Recruiter workspace" />}>
            <Route path="/recruiter" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/applications/:applicationId" element={<RecruiterApplicationReviewPage />} />
            <Route path="/recruiter/requisitions/:requisitionId/applications" element={<RequisitionApplicationsPage />} />
            <Route path="/recruiter/requisitions" element={<RequisitionsPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['HR']} />}>
          <Route element={<AppShell role="HR" roleLabel="HR workspace" />}>
            <Route path="/hr" element={<HrDashboardPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
          <Route element={<AppShell role="ADMIN" roleLabel="Admin workspace" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['HIRING_MANAGER']} />}>
          <Route element={<AppShell role="HIRING_MANAGER" roleLabel="Hiring Manager workspace" />}>
            <Route path="/hiring-manager" element={<HiringManagerDashboardPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['AUDITOR']} />}>
          <Route element={<AppShell role="AUDITOR" roleLabel="Audit workspace" />}>
            <Route path="/auditor" element={<AuditorDashboardPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requiredRoles={['ACCOUNTS']} />}>
          <Route element={<AppShell role="ACCOUNTS" roleLabel="Accounts workspace" />}>
            <Route path="/accounts" element={<AccountsDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
