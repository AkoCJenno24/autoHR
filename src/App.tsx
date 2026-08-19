import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth views
import { FindCompanyView } from '@/features/auth/FindCompanyView';
import { LoginView } from '@/features/auth/LoginView';
import { RegisterView } from '@/features/auth/RegisterView';
import { OnboardingView } from '@/features/auth/OnboardingView';

// App views
import { DashboardView } from '@/features/dashboard/DashboardView';
import { EmployeeListView } from '@/features/employees/EmployeeListView';
import { EmployeeDetailView } from '@/features/employees/EmployeeDetailView';
import { OrganizationView } from '@/features/organization/OrganizationView';
import { AttendanceView } from '@/features/attendance/AttendanceView';
import { LeaveView } from '@/features/leave/LeaveView';
import { PayrollView } from '@/features/payroll/PayrollView';
import { DocumentsView } from '@/features/documents/DocumentsView';
import { WorkflowsView } from '@/features/workflows/WorkflowsView';
import { TasksView } from '@/features/tasks/TasksView';
import { NotificationsView } from '@/features/notifications/NotificationsView';
import { ReportsView } from '@/features/reports/ReportsView';
import { AdminView } from '@/features/admin/AdminView';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public: find company (slug input) ── */}
          <Route path="/login" element={<FindCompanyView />} />

          {/* ── Public: company-specific login portal ── */}
          <Route path="/login/:slug" element={<LoginView />} />

          {/* ── Public: new user registration ── */}
          <Route path="/register" element={<RegisterView />} />

          {/* ── Semi-protected: Firebase authed but no org yet ── */}
          <Route path="/onboarding" element={<OnboardingView />} />

          {/* ── Protected: authed + has company ── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/employees" element={<EmployeeListView />} />
            <Route path="/employees/:id" element={<EmployeeDetailView />} />
            <Route path="/organization" element={<OrganizationView />} />
            <Route path="/organization/*" element={<OrganizationView />} />
            <Route path="/attendance" element={<AttendanceView />} />
            <Route path="/leave" element={<LeaveView />} />
            <Route path="/leave/*" element={<LeaveView />} />
            <Route path="/payroll" element={<PayrollView />} />
            <Route path="/payroll/*" element={<PayrollView />} />
            <Route path="/documents" element={<DocumentsView />} />
            <Route path="/workflows" element={<WorkflowsView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/admin/*" element={<AdminView />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
