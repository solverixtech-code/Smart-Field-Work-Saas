import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import PayrollSettingsPage from './screens/payroll/PayrollSettingsPage';

import SalesTeamsPage from './screens/teams/SalesTeamsPage';
import CreateTeamPage from './screens/teams/CreateTeamPage';
import TeamDetailsPage from './screens/teams/TeamDetailsPage';
import AssignTeamLeaderPage from './screens/teams/AssignTeamLeaderPage';
import TeamMembersPage from './screens/teams/TeamMembersPage';
import TeamPerformancePage from './screens/teams/TeamPerformancePage';
import TeamTargetsPage from './screens/teams/TeamTargetsPage';
import MasterManagementPage from './screens/admin/masters/MasterManagementPage';

import AllLeadsPage from './screens/leads/AllLeadsPage';
import AddLeadPage from './screens/leads/AddLeadPage';
import EditLeadPage from './screens/leads/EditLeadPage';
import LeadDetailsPage from './screens/leads/LeadDetailsPage';
import BulkAssignLeadsPage from './screens/leads/BulkAssignLeadsPage';
import LeadImportPage from './screens/leads/LeadImportPage';
import LeadExportPage from './screens/leads/LeadExportPage';

import AllBusinessesPage from './screens/businesses/AllBusinessesPage';
import AddBusinessPage from './screens/businesses/AddBusinessPage';
import BusinessLayoutWrapper from './screens/businesses/BusinessLayoutWrapper';
import BusinessDetailsPage from './screens/businesses/BusinessDetailsPage';
import BusinessContactsPage from './screens/businesses/BusinessContactsPage';
import BusinessGoogleProfilePage from './screens/businesses/BusinessGoogleProfilePage';
import BusinessSalesHistoryPage from './screens/businesses/BusinessSalesHistoryPage';
import BusinessVisitHistoryPage from './screens/businesses/BusinessVisitHistoryPage';
import BusinessSubscriptionPage from './screens/businesses/BusinessSubscriptionPage';

import AllVisitsPage from './screens/visits/AllVisitsPage';
import ScheduleVisitPage from './screens/visits/ScheduleVisitPage';
import VisitDetailsPage from './screens/visits/VisitDetailsPage';
import GpsExceptionsPage from './screens/visits/GpsExceptionsPage';
import GpsExceptionDetailsPage from './screens/visits/GpsExceptionDetailsPage';

import LiveFieldMapPage from './screens/maps/LiveFieldMapPage';
import ExecutiveLocationsPage from './screens/maps/ExecutiveLocationsPage';
import BusinessProspectMapPage from './screens/maps/BusinessProspectMapPage';
import VisitHeatmapPage from './screens/maps/VisitHeatmapPage';
import SalesHeatmapPage from './screens/maps/SalesHeatmapPage';
import TerritoryMapPage from './screens/maps/TerritoryMapPage';
import RoutePlaybackPage from './screens/maps/RoutePlaybackPage';

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
          const baseURL = import.meta.env.VITE_API_URL ?? '/api';
          const res = await axios.post(`${baseURL}/auth/refresh`, getRefreshPayload(), {
            withCredentials: true,
          });
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
              <Route path="/admin/payroll/settings" element={<PayrollSettingsPage />} />
            </Route>

            {/* Leads Management Routes (Screens 33 to 53) */}
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
              <Route path="/admin/leads" element={<AllLeadsPage viewMode="all" />} />
              <Route path="/admin/leads/create" element={<AddLeadPage />} />
              <Route path="/admin/leads/bulk-assign" element={<BulkAssignLeadsPage />} />
              <Route path="/admin/leads/import" element={<LeadImportPage />} />
              <Route path="/admin/leads/export" element={<LeadExportPage />} />
              <Route path="/admin/leads/unassigned" element={<AllLeadsPage viewMode="unassigned" />} />
              <Route path="/admin/leads/hot" element={<AllLeadsPage viewMode="hot" />} />
              <Route path="/admin/leads/follow-up" element={<AllLeadsPage viewMode="follow-up" />} />
              <Route path="/admin/leads/converted" element={<AllLeadsPage viewMode="converted" />} />
              <Route path="/admin/leads/lost" element={<AllLeadsPage viewMode="lost" />} />
              <Route path="/admin/leads/not-interested" element={<AllLeadsPage viewMode="not-interested" />} />
              <Route path="/admin/leads/duplicates" element={<AllLeadsPage viewMode="duplicates" />} />
              <Route path="/admin/leads/:leadId" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/edit" element={<EditLeadPage />} />
              <Route path="/admin/leads/:leadId/timeline" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/visits" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/follow-ups" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/demos" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/communications" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/payments" element={<LeadDetailsPage />} />
              <Route path="/admin/leads/:leadId/assignment" element={<LeadDetailsPage />} />
            </Route>

            {/* Business Database Management Routes (Screens 54 to 60) */}
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
              <Route path="/admin/businesses" element={<AllBusinessesPage />} />
              <Route path="/admin/businesses/create" element={<AddBusinessPage />} />
              <Route path="/admin/businesses/:businessId/edit" element={<AddBusinessPage isEdit />} />
              <Route path="/admin/businesses/:businessId" element={<BusinessLayoutWrapper />}>
                <Route index element={<BusinessDetailsPage />} />
                <Route path="contacts" element={<BusinessContactsPage />} />
                <Route path="google-profile" element={<BusinessGoogleProfilePage />} />
                <Route path="sales-history" element={<BusinessSalesHistoryPage />} />
                <Route path="visits" element={<BusinessVisitHistoryPage />} />
                <Route path="subscription" element={<BusinessSubscriptionPage />} />
              </Route>
            </Route>

            {/* Visit Management Routes (Screens 61 to 70) */}
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
              <Route path="/admin/visits" element={<AllVisitsPage viewMode="all" />} />
              <Route path="/admin/visits/schedule" element={<ScheduleVisitPage />} />
              <Route path="/admin/visits/today" element={<AllVisitsPage viewMode="today" />} />
              <Route path="/admin/visits/scheduled" element={<AllVisitsPage viewMode="scheduled" />} />
              <Route path="/admin/visits/completed" element={<AllVisitsPage viewMode="completed" />} />
              <Route path="/admin/visits/missed" element={<AllVisitsPage viewMode="missed" />} />
              <Route path="/admin/visits/verified" element={<AllVisitsPage viewMode="verified" />} />
              <Route path="/admin/visits/unverified" element={<AllVisitsPage viewMode="unverified" />} />
              <Route path="/admin/visits/gps-exceptions" element={<GpsExceptionsPage />} />
              <Route path="/admin/visits/gps-exceptions/:exceptionId" element={<GpsExceptionDetailsPage />} />
              <Route path="/admin/visits/:visitId" element={<VisitDetailsPage />} />
            </Route>

            {/* Live Location & Maps Routes (Screens 71 to 77) */}
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
              <Route path="/admin/map/live" element={<LiveFieldMapPage />} />
              <Route path="/admin/map/executives" element={<ExecutiveLocationsPage />} />
              <Route path="/admin/map/businesses" element={<BusinessProspectMapPage />} />
              <Route path="/admin/map/visits" element={<VisitHeatmapPage />} />
              <Route path="/admin/map/sales" element={<SalesHeatmapPage />} />
              <Route path="/admin/map/territories" element={<TerritoryMapPage />} />
              <Route path="/admin/map/routes" element={<RoutePlaybackPage />} />
              <Route path="/admin/map/routes/:executiveId" element={<RoutePlaybackPage />} />
            </Route>

            {/* System Masters Management Route */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.ADMIN,
                    Role.SALES_MANAGER,
                    Role.TEAM_LEADER,
                    Role.FINANCE_OPS,
                    Role.SUPPORT,
                  ]}
                />
              }
            >
              <Route path="/admin/masters" element={<MasterManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
