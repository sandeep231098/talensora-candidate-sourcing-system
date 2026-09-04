import { lazy, Suspense } from 'react'
import type { ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoadingState } from './components/common/LoadingState'
import { PublicLayout } from './components/layout/PublicLayout'
import { RolePortalPage } from './features/auth/pages/RolePortalPage'

const page = <T extends Record<string, unknown>>(
  loader: () => Promise<T>, exportName: keyof T,
) => lazy(async () => ({ default: (await loader())[exportName] as ComponentType }))

const JobsPage = page(() => import('./features/jobs/pages/JobsPage'), 'JobsPage')
const JobDetailPage = page(() => import('./features/jobs/pages/JobDetailPage'), 'JobDetailPage')
const LoginPlaceholderPage = page(() => import('./features/auth/pages/LoginPlaceholderPage'), 'LoginPlaceholderPage')
const ForbiddenPage = page(() => import('./features/auth/pages/ForbiddenPage'), 'ForbiddenPage')
const PortalRedirectPage = page(() => import('./features/auth/pages/PortalRedirectPage'), 'PortalRedirectPage')
const CandidateProfilePage = page(() => import('./features/candidate/pages/CandidateProfilePage'), 'CandidateProfilePage')
const CandidateApplyPage = page(() => import('./features/candidate/pages/CandidateApplyPage'), 'CandidateApplyPage')
const MyApplicationsPage = page(() => import('./features/candidate/pages/MyApplicationsPage'), 'MyApplicationsPage')
const ApplicationConfirmationPage = page(() => import('./features/candidate/pages/ApplicationConfirmationPage'), 'ApplicationConfirmationPage')
const RecruiterDashboardPage = page(() => import('./features/recruiter/pages/RecruiterDashboardPage'), 'RecruiterDashboardPage')
const RecruiterApplicationReviewPage = page(() => import('./features/recruiter/pages/RecruiterApplicationReviewPage'), 'RecruiterApplicationReviewPage')
const RequisitionApplicationsPage = page(() => import('./features/recruiter/pages/RequisitionApplicationsPage'), 'RequisitionApplicationsPage')
const RequisitionsPage = page(() => import('./features/recruiter/pages/RequisitionsPage'), 'RequisitionsPage')
const NotFoundPage = page(() => import('./features/auth/pages/NotFoundPage'), 'NotFoundPage')

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
          <Route element={<ProtectedRoute requiredRoles={['CANDIDATE']} />}>
            <Route path="/candidate" element={<Navigate to="/candidate/profile" replace />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
            <Route path="/candidate/applications" element={<MyApplicationsPage />} />
            <Route path="/jobs/:id/apply" element={<CandidateApplyPage />} />
            <Route path="/candidate/applications/:applicationId/confirmation" element={<ApplicationConfirmationPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['HR']} />}>
            <Route path="/hr" element={<RolePortalPage title="HR Portal" description="Human Resources workspace for recruiting and candidate operations." />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['RECRUITER']} />}>
            <Route path="/recruiter" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/applications/:applicationId" element={<RecruiterApplicationReviewPage />} />
            <Route path="/recruiter/requisitions/:requisitionId/applications" element={<RequisitionApplicationsPage />} />
            <Route path="/recruiter/requisitions" element={<RequisitionsPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
            <Route path="/admin" element={<RolePortalPage title="Admin Portal" description="Administrative workspace for Talensora platform operations." />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['HIRING_MANAGER']} />}>
            <Route path="/hiring-manager" element={<RolePortalPage title="Hiring Manager Portal" description="Hiring manager workspace for recruitment reviews and decisions." />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['AUDITOR']} />}>
            <Route path="/auditor" element={<RolePortalPage title="Audit Portal" description="Read-oriented workspace for audit and compliance activities." />} />
          </Route>
          <Route element={<ProtectedRoute requiredRoles={['ACCOUNTS']} />}>
            <Route path="/accounts" element={<RolePortalPage title="Accounts Portal" description="Accounts and finance workspace." />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
