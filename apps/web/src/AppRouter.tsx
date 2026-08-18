import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './screens/auth/LoginPage';
import ForgotPasswordPage from './screens/auth/ForgotPasswordPage';
import ResetPasswordPage from './screens/auth/ResetPasswordPage';
import VerifyOtpPage from './screens/auth/VerifyOtpPage';
import ProfilePage from './screens/auth/ProfilePage';
import ChangePasswordPage from './screens/auth/ChangePasswordPage';
import ActiveSessionsPage from './screens/auth/ActiveSessionsPage';

import ExecutiveDashboardPage from './screens/dashboard/ExecutiveDashboardPage';
import SalesDashboardPage from './screens/dashboard/SalesDashboardPage';
import FieldActivityDashboardPage from './screens/dashboard/FieldActivityDashboardPage';
import RevenueDashboardPage from './screens/dashboard/RevenueDashboardPage';
import ConversionDashboardPage from './screens/dashboard/ConversionDashboardPage';
import RealTimeActivityDashboardPage from './screens/dashboard/RealTimeActivityDashboardPage';

import AllExecutivesPage from './screens/executives/AllExecutivesPage';
import AddExecutivePage from './screens/executives/AddExecutivePage';
import ExecutiveDetailsPage from './screens/executives/ExecutiveDetailsPage';
import EditExecutivePage from './screens/executives/EditExecutivePage';
import SuspendExecutivePage from './screens/executives/SuspendExecutivePage';

import ShiftManagementPage from './screens/shifts/ShiftManagementPage';
import AttendanceMonitoringPage from './screens/attendance/AttendanceMonitoringPage';
import PayrollManagementPage from './screens/payroll/PayrollManagementPage';

import SalesTeamsPage from './screens/teams/SalesTeamsPage';
import CreateTeamPage from './screens/teams/CreateTeamPage';
import TeamDetailsPage from './screens/teams/TeamDetailsPage';
import AssignTeamLeaderPage from './screens/teams/AssignTeamLeaderPage';
import TeamMembersPage from './screens/teams/TeamMembersPage';
import TeamPerformancePage from './screens/teams/TeamPerformancePage';
import TeamTargetsPage from './screens/teams/TeamTargetsPage';

import AppShell from './layouts/AppShell';
import ProtectedRoute from './layouts/ProtectedRoute';
import { Role, AuthTokensSchema } from '@visiblo/shared';
import { useAppDispatch, useAppSelector } from './store';
import { setCredentials, clearCredentials } from './store/slices/authSlice';
import { getStoredRefreshToken, getRefreshPayload, saveRefreshToken, clearStoredRefreshToken } from './common/authSession';
import { api } from './common/api';

export default function AppRouter() {
  const [initializing, setInitializing] = useState(true);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = getStoredRefreshToken();
      if (!isAuthenticated && refreshToken) {
        try {
          const res = await api.post('/auth/refresh', getRefreshPayload());
          const tokens = AuthTokensSchema.parse(res.data);
          saveRefreshToken(tokens.refreshToken);
          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              user: tokens.user,
            }),
          );
        } catch {
          clearStoredRefreshToken();
          dispatch(clearCredentials());
        }
      }
      setInitializing(false);
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  if (initializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B2E6B]" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/verify" element={<VerifyOtpPage />} />

        {/* Protected Base Routes inside App Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            {/* Executive Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<ExecutiveDashboardPage />} />
            </Route>

            {/* Sales Dashboard */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/dashboard/sales" element={<SalesDashboardPage />} />
            </Route>

            {/* Field Activity Dashboard */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/dashboard/field" element={<FieldActivityDashboardPage />} />
            </Route>

            {/* Revenue Dashboard */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS]}
                />
              }
            >
              <Route path="/admin/dashboard/revenue" element={<RevenueDashboardPage />} />
            </Route>

            {/* Conversion Dashboard */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER]}
                />
              }
            >
              <Route path="/admin/dashboard/conversions" element={<ConversionDashboardPage />} />
            </Route>

            {/* Real-time Activity */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/dashboard/live" element={<RealTimeActivityDashboardPage />} />
            </Route>

            {/* Account Profile Routes */}
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/profile/security" element={<ChangePasswordPage />} />
            <Route path="/admin/profile/sessions" element={<ActiveSessionsPage />} />

            {/* Field Executives & Sales Manager Management Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/executives" element={<AllExecutivesPage />} />
              <Route path="/admin/executives/new" element={<AddExecutivePage />} />
              <Route path="/admin/executives/:id" element={<ExecutiveDetailsPage />} />
              <Route path="/admin/executives/:id/edit" element={<EditExecutivePage />} />
              <Route path="/admin/executives/:id/suspend" element={<SuspendExecutivePage />} />
            </Route>

            {/* Workforce, Attendance, and Payroll Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/shifts" element={<ShiftManagementPage />} />
              <Route path="/admin/attendance" element={<AttendanceMonitoringPage />} />
            </Route>

            {/* Teams & Hierarchy Management Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                  ]}
                />
              }
            >
              <Route path="/admin/teams" element={<SalesTeamsPage />} />
              <Route path="/admin/teams/create" element={<CreateTeamPage />} />
              <Route path="/admin/teams/targets" element={<TeamTargetsPage />} />
              <Route path="/admin/teams/:teamId" element={<TeamDetailsPage />} />
              <Route path="/admin/teams/:teamId/leader" element={<AssignTeamLeaderPage />} />
              <Route path="/admin/teams/:teamId/members" element={<TeamMembersPage />} />
              <Route path="/admin/teams/:teamId/performance" element={<TeamPerformancePage />} />
              <Route path="/admin/teams/:teamId/targets" element={<TeamTargetsPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS]}
                />
              }
            >
              <Route path="/admin/payroll" element={<PayrollManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
