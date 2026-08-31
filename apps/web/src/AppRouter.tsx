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

import PlatformShell from './layouts/PlatformShell';
import { PlatformDashboardPage } from './screens/platform/PlatformDashboardPage';
import { AllTenantsPage } from './screens/platform/AllTenantsPage';
import { CreateTenantWizardPage } from './screens/platform/CreateTenantWizardPage';
import { TenantDetailsPage } from './screens/platform/TenantDetailsPage';
import { TenantModulesPage } from './screens/platform/TenantModulesPage';
import { TenantUsersPage } from './screens/platform/TenantUsersPage';
import { WorkspaceSettingsPage } from './screens/admin/settings/WorkspaceSettingsPage';
import { PlansPricingPage } from './screens/platform/PlansPricingPage';
import { AuditLogsPage } from './screens/platform/AuditLogsPage';
import { TenantCreationProvider } from './features/platform/tenants/context/TenantCreationContext';
import { PlatformAccessGuard } from './features/platform/auth/guards/PlatformAccessGuard';
import { WorkspaceSettingsGuard } from './layouts/WorkspaceSettingsGuard';
import { PlatformPlaceholderPage } from './screens/platform/PlatformPlaceholderPage';

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

import SalesPipelinePage from './screens/sales/SalesPipelinePage';
import SalesStageViewPage from './screens/sales/SalesStageViewPage';

import TargetDashboardPage from './screens/targets/TargetDashboardPage';
import TeamTargetsScreen from './screens/targets/TeamTargetsScreen';
import ExecutiveTargetsScreen from './screens/targets/ExecutiveTargetsScreen';
import IncentiveRulesPage from './screens/targets/IncentiveRulesPage';
import IncentivesManagementPage from './screens/targets/IncentivesManagementPage';

import { SalesPerformancePage } from './screens/performance/SalesPerformancePage';
import { ExecutiveRankingPage } from './screens/performance/ExecutiveRankingPage';
import { TeamRankingPage } from './screens/performance/TeamRankingPage';
import { TerritoryRankingPage } from './screens/performance/TerritoryRankingPage';
import { CategoryPerformancePage } from './screens/performance/CategoryPerformancePage';
import { ConversionFunnelPage } from './screens/performance/ConversionFunnelPage';
import { ProductivityReportPage } from './screens/performance/ProductivityReportPage';

import AllCategoriesPage from './screens/categories/AllCategoriesPage';
import AddCategoryPage from './screens/categories/AddCategoryPage';
import CategoryDetailsPage from './screens/categories/CategoryDetailsPage';

import AllLeadSourcesPage from './screens/leadsources/AllLeadSourcesPage';
import AddLeadSourcePage from './screens/leadsources/AddLeadSourcePage';
import LeadSourceDetailsPage from './screens/leadsources/LeadSourceDetailsPage';
import LeadIntegrationsDashboard from './screens/leadsources/LeadIntegrationsDashboard';
import LeadAutomationCenter from './screens/leadsources/LeadAutomationCenter';
import ConnectMetaWizardPage from './screens/leadsources/ConnectMetaWizardPage';
import ConnectGoogleAdsWizardPage from './screens/leadsources/ConnectGoogleAdsWizardPage';
import ConnectWhatsAppWizardPage from './screens/leadsources/ConnectWhatsAppWizardPage';
import AutomationSettingsPage from './screens/leadsources/AutomationSettingsPage';
import LiveLeadActivityPage from './screens/leadsources/LiveLeadActivityPage';

import ConvertedCustomersPage from './screens/customers/ConvertedCustomersPage';
import CustomerDetailsPage from './screens/customers/CustomerDetailsPage';
import SubscriptionDetailsPage from './screens/customers/SubscriptionDetailsPage';
import RenewalStatusPage from './screens/customers/RenewalStatusPage';
import {
  ReportsDashboardPage,
  DailySalesReportPage,
  ExecutiveReportPage,
  VisitReportPage,
  TerritoryReportPage,
  LeadConversionReportPage,
  RevenueReportPage,
  PaymentReportPage,
  AttendanceReportPage,
  IncentiveReportPage,
  CategoryRoiReportPage,
} from './screens/reports/ReportsPages';

import AllBusinessesPage from './screens/businesses/AllBusinessesPage';
import AddBusinessPage from './screens/businesses/AddBusinessPage';
import BusinessLayoutWrapper from './screens/businesses/BusinessLayoutWrapper';
import BusinessDetailsPage from './screens/businesses/BusinessDetailsPage';

import AllDemosPage from './screens/demos/AllDemosPage';
import DemosTodayPage from './screens/demos/DemosTodayPage';
import ScheduledDemosPage from './screens/demos/ScheduledDemosPage';
import CompletedDemosPage from './screens/demos/CompletedDemosPage';
import DemoDetailsPage from './screens/demos/DemoDetailsPage';
import DemoConversionReportPage from './screens/demos/DemoConversionReportPage';

import AllFollowUpsPage from './screens/followups/AllFollowUpsPage';
import TodayFollowUpsPage from './screens/followups/TodayFollowUpsPage';
import UpcomingFollowUpsPage from './screens/followups/UpcomingFollowUpsPage';
import OverdueFollowUpsPage from './screens/followups/OverdueFollowUpsPage';
import CompletedFollowUpsPage from './screens/followups/CompletedFollowUpsPage';
import FollowUpDetailsPage from './screens/followups/FollowUpDetailsPage';
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

import TerritoriesListPage from './screens/territories/TerritoriesListPage';
import CreateTerritoryPage from './screens/territories/CreateTerritoryPage';
import TerritoryDetailsPage from './screens/territories/TerritoryDetailsPage';
import EditTerritoryPage from './screens/territories/EditTerritoryPage';
import AssignExecutivesPage from './screens/territories/AssignExecutivesPage';
import TerritoryBusinessesPage from './screens/territories/TerritoryBusinessesPage';
import TerritoryPerformancePage from './screens/territories/TerritoryPerformancePage';
import ModuleTerritoryMapPage from './screens/territories/TerritoryMapPage';

import PrivacyPolicyPage from './screens/public/PrivacyPolicyPage';
import TermsOfServicePage from './screens/public/TermsOfServicePage';
import DataDeletionInstructionsPage from './screens/public/DataDeletionInstructionsPage';
import { CreateNotificationPage, ExecutiveAlertsPage, NotificationCenterPage, NotificationTemplatesPage, PushNotificationsPage } from './screens/notifications/NotificationsPages';

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
          dispatch(
            setCredentials({
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
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
        {/* Public Compliance Routes (Meta App Review & GDPR) */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/data-deletion" element={<DataDeletionInstructionsPage />} />
        <Route path="/user-data-deletion" element={<DataDeletionInstructionsPage />} />

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

            {/* Targets & Incentives Routes (Screens 128 to 136) */}
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
              <Route path="/admin/targets" element={<TargetDashboardPage />} />
              <Route path="/admin/targets/executives" element={<ExecutiveTargetsScreen />} />
              <Route path="/admin/targets/teams" element={<TeamTargetsScreen />} />
              <Route path="/admin/targets/create" element={<TargetDashboardPage />} />
              <Route path="/admin/incentives/rules" element={<IncentiveRulesPage />} />
              <Route path="/admin/incentives" element={<IncentivesManagementPage />} />
              <Route path="/admin/incentives/approvals" element={<IncentivesManagementPage />} />
              <Route path="/admin/incentives/payouts" element={<IncentivesManagementPage />} />
              <Route path="/admin/incentives/:executiveId" element={<IncentivesManagementPage />} />
            </Route>

            {/* Sales Performance Routes (Screens 137 to 143) */}
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
              <Route path="/admin/performance" element={<SalesPerformancePage />} />
              <Route path="/admin/performance/executives" element={<ExecutiveRankingPage />} />
              <Route path="/admin/performance/teams" element={<TeamRankingPage />} />
              <Route path="/admin/performance/territories" element={<TerritoryRankingPage />} />
              <Route path="/admin/performance/categories" element={<CategoryPerformancePage />} />
              <Route path="/admin/performance/funnel" element={<ConversionFunnelPage />} />
              <Route path="/admin/performance/productivity" element={<ProductivityReportPage />} />
            </Route>

            {/* Business Categories Routes (Screens 144 to 147) */}
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
              <Route path="/admin/categories" element={<AllCategoriesPage />} />
              <Route path="/admin/categories/create" element={<AddCategoryPage />} />
              <Route path="/admin/categories/:categoryId" element={<CategoryDetailsPage />} />
              <Route path="/admin/categories/:categoryId/performance" element={<CategoryPerformancePage />} />
            </Route>

            {/* Lead Sources & Automation Routes (Screens 148 to 157) */}
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
              <Route path="/admin/leads/sources" element={<AllLeadSourcesPage />} />
              <Route path="/admin/leads/sources/create" element={<AddLeadSourcePage />} />
              <Route path="/admin/leads/sources/:sourceId" element={<LeadSourceDetailsPage />} />
              <Route path="/admin/leads/integrations" element={<LeadIntegrationsDashboard />} />
              <Route path="/admin/leads/automation" element={<LeadAutomationCenter />} />
              <Route path="/admin/leads/integrations/meta/connect" element={<ConnectMetaWizardPage />} />
              <Route path="/admin/leads/integrations/google/connect" element={<ConnectGoogleAdsWizardPage />} />
              <Route path="/admin/leads/integrations/whatsapp/connect" element={<ConnectWhatsAppWizardPage />} />
              <Route path="/admin/leads/automation/settings" element={<AutomationSettingsPage />} />
              <Route path="/admin/leads/automation/activity" element={<LiveLeadActivityPage />} />
            </Route>

            {/* Customer & Subscription Linkage Routes (Screens 151 to 155) */}
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
              <Route path="/admin/customers" element={<ConvertedCustomersPage />} />
              <Route path="/admin/customers/field-sales" element={<ConvertedCustomersPage />} />
              <Route path="/admin/customers/:customerId" element={<CustomerDetailsPage />} />
              <Route path="/admin/customers/:customerId/subscription" element={<SubscriptionDetailsPage />} />
              <Route path="/admin/customers/:customerId/renewal" element={<RenewalStatusPage />} />
            </Route>

            {/* Notifications (Screens 163 to 167) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER]}
                />
              }
            >
              <Route path="/admin/notifications" element={<NotificationCenterPage />} />
              <Route path="/admin/notifications/create" element={<CreateNotificationPage />} />
              <Route path="/admin/notifications/push" element={<PushNotificationsPage />} />
              <Route path="/admin/notifications/executives" element={<ExecutiveAlertsPage />} />
              <Route path="/admin/notifications/templates" element={<NotificationTemplatesPage />} />
            </Route>

            {/* Reports & Analytics (Screens 168 to 179) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER]}
                />
              }
            >
              <Route path="/admin/reports" element={<ReportsDashboardPage />} />
              <Route path="/admin/reports/daily-sales" element={<DailySalesReportPage />} />
              <Route path="/admin/reports/executives" element={<ExecutiveReportPage />} />
              <Route path="/admin/reports/visits" element={<VisitReportPage />} />
              <Route path="/admin/reports/territories" element={<TerritoryReportPage />} />
              <Route path="/admin/reports/conversions" element={<LeadConversionReportPage />} />
              <Route path="/admin/reports/revenue" element={<RevenueReportPage />} />
              <Route path="/admin/reports/payments" element={<PaymentReportPage />} />
              <Route path="/admin/reports/attendance" element={<AttendanceReportPage />} />
              <Route path="/admin/reports/incentives" element={<IncentiveReportPage />} />
              <Route path="/admin/reports/categories" element={<CategoryRoiReportPage />} />
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

            {/* Demo Management Routes (Screens 93 to 98) */}
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
              <Route path="/admin/demos" element={<AllDemosPage />} />
              <Route path="/admin/demos/today" element={<DemosTodayPage />} />
              <Route path="/admin/demos/scheduled" element={<ScheduledDemosPage />} />
              <Route path="/admin/demos/completed" element={<CompletedDemosPage />} />
              <Route path="/admin/demos/conversions" element={<DemoConversionReportPage />} />
              <Route path="/admin/demos/:demoId" element={<DemoDetailsPage />} />
            </Route>

            {/* Follow-up Management Routes (Screens 99 to 104) */}
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
              <Route path="/admin/follow-ups" element={<AllFollowUpsPage />} />
              <Route path="/admin/follow-ups/today" element={<TodayFollowUpsPage />} />
              <Route path="/admin/follow-ups/upcoming" element={<UpcomingFollowUpsPage />} />
              <Route path="/admin/follow-ups/overdue" element={<OverdueFollowUpsPage />} />
              <Route path="/admin/follow-ups/completed" element={<CompletedFollowUpsPage />} />
              <Route path="/admin/follow-ups/:followupId" element={<FollowUpDetailsPage />} />
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

            {/* Sales Pipeline Routes (Screens 105 to 113) */}
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
              <Route path="/admin/sales/pipeline" element={<SalesPipelinePage />} />
              <Route path="/admin/sales/prospects" element={<SalesStageViewPage stageKeyOverride="prospects" />} />
              <Route path="/admin/sales/contacted" element={<SalesStageViewPage stageKeyOverride="contacted" />} />
              <Route path="/admin/sales/demo" element={<SalesStageViewPage stageKeyOverride="demo" />} />
              <Route path="/admin/sales/interested" element={<SalesStageViewPage stageKeyOverride="interested" />} />
              <Route path="/admin/sales/negotiation" element={<SalesStageViewPage stageKeyOverride="negotiation" />} />
              <Route path="/admin/sales/payment-pending" element={<SalesStageViewPage stageKeyOverride="payment-pending" />} />
              <Route path="/admin/sales/won" element={<SalesStageViewPage stageKeyOverride="won" />} />
              <Route path="/admin/sales/lost" element={<SalesStageViewPage stageKeyOverride="lost" />} />
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

            {/* Territory Management Routes (Module 9, Screens 78 to 85) */}
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
              <Route path="/admin/territories" element={<TerritoriesListPage />} />
              <Route path="/admin/territories/create" element={<CreateTerritoryPage />} />
              <Route path="/admin/territories/:territoryId" element={<TerritoryDetailsPage initialTab="Overview" />} />
              <Route path="/admin/territories/:territoryId/edit" element={<EditTerritoryPage />} />
              <Route path="/admin/territories/:territoryId/executives" element={<TerritoryDetailsPage initialTab="Executives" />} />
              <Route path="/admin/territories/:territoryId/businesses" element={<TerritoryDetailsPage initialTab="Businesses" />} />
              <Route path="/admin/territories/:territoryId/performance" element={<TerritoryDetailsPage initialTab="Performance" />} />
              <Route path="/admin/territories/:territoryId/map" element={<TerritoryDetailsPage initialTab="Map" />} />
            </Route>

            {/* System Masters Management & Workspace Settings Route */}
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
              <Route element={<WorkspaceSettingsGuard />}>
                <Route path="/admin/settings/workspace" element={<WorkspaceSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* SaaS Platform Console Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <TenantCreationProvider>
                <PlatformShell />
              </TenantCreationProvider>
            }
          >
            <Route element={<PlatformAccessGuard requiredPermission="platform.dashboard.view" />}>
              <Route path="/platform" element={<Navigate to="/platform/dashboard" replace />} />
              <Route path="/platform/dashboard" element={<PlatformDashboardPage />} />
              <Route path="/platform/tenants" element={<AllTenantsPage />} />
              <Route path="/platform/tenants/create" element={<CreateTenantWizardPage />} />
              <Route path="/platform/tenants/onboarding" element={<Navigate to="/platform/tenants" replace />} />
              <Route path="/platform/tenants/requests" element={<Navigate to="/platform/tenants" replace />} />
              <Route path="/platform/tenants/:tenantId" element={<TenantDetailsPage />} />
              <Route path="/platform/tenants/:tenantId/modules" element={<TenantModulesPage />} />
              <Route path="/platform/tenants/:tenantId/users" element={<TenantUsersPage />} />
              <Route path="/platform/plans" element={<PlansPricingPage />} />
              <Route path="/platform/modules" element={<PlatformPlaceholderPage title="Platform Modules Catalog" />} />
              <Route path="/platform/industries" element={<PlatformPlaceholderPage title="Industry Verticals" />} />
              <Route path="/platform/users" element={<PlatformPlaceholderPage title="Platform Operators" />} />
              <Route path="/platform/roles" element={<PlatformPlaceholderPage title="Platform RBAC & Roles" />} />
              <Route path="/platform/audit" element={<AuditLogsPage />} />
              <Route path="/platform/subscriptions" element={<PlatformPlaceholderPage title="Subscription Management" />} />
              <Route path="/platform/invoices" element={<PlatformPlaceholderPage title="Invoices & Billing" />} />
              <Route path="/platform/transactions" element={<PlatformPlaceholderPage title="Payment Transactions" />} />
              <Route path="/platform/reports" element={<PlatformPlaceholderPage title="Platform Analytics & Reports" />} />
              <Route path="/platform/profile" element={<ProfilePage />} />
              <Route path="/platform/profile/security" element={<ChangePasswordPage />} />
              <Route path="/platform/profile/sessions" element={<ActiveSessionsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
