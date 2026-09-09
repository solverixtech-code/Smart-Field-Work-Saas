import { api } from '../../../../common/api';
import { runtimeService } from '../../../runtime/services/runtime.service';

export interface WorkspaceProfileSettings {
  companyName: string;
  shortName: string;
  industry: string;
  tenantCode: string;
  website: string;
  primaryEmail: string;
  primaryPhone: string;
  primaryColor: string;
  secondaryColor: string;
  logoInLogin: boolean;
  workspaceId: string;
  configVersion: string;
  createdOn: string;
  createdBy: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface WorkspaceLocalizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  weekStart: string;
  numberFormat: string;
}

export interface WorkspaceFinancialSettings {
  currency: string;
  fyStart: string;
  gstNumber: string;
  panNumber: string;
  billingAddress: string;
  autoInvoice: boolean;
}

export interface WorkspacePreferencesSettings {
  defaultLandingPage: string;
  sessionTimeout: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
  showMapView: boolean;
  compactTable: boolean;
}

export interface WorkspaceSecuritySettings {
  enforce2FA: boolean;
  passwordMinLength: string;
  passwordExpiry: string;
  maxLoginAttempts: string;
  ipWhitelist: boolean;
  geoFenceAttendance: boolean;
  forceLogoutOnInactivity: boolean;
}

export interface WorkspaceSettings {
  tenantId: string;
  profile: WorkspaceProfileSettings;
  localization: WorkspaceLocalizationSettings;
  financial: WorkspaceFinancialSettings;
  preferences: WorkspacePreferencesSettings;
  security: WorkspaceSecuritySettings;
}

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  tenantId: 'default',
  profile: {
    companyName: 'Visiblo Workspace',
    shortName: 'Visiblo',
    industry: 'Pharma & Healthcare',
    tenantCode: 'DEFAULT',
    website: 'www.smartfieldwork.com',
    primaryEmail: 'info@smartfieldwork.com',
    primaryPhone: '9876543210',
    primaryColor: '#0D1F3D',
    secondaryColor: '#2563EB',
    logoInLogin: true,
    workspaceId: 'ws_default',
    configVersion: 'v1.0.0',
    createdOn: '24 May 2026',
    createdBy: 'System Provisioning',
    address1: 'Sunrise Tower',
    address2: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400059',
  },
  localization: {
    timezone: '(GMT+05:30) Asia/Kolkata',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '12-hour (hh:mm AM/PM)',
    language: 'English',
    weekStart: 'Monday',
    numberFormat: '1,23,456.78 (Indian)',
  },
  financial: {
    currency: 'INR - Indian Rupee (₹)',
    fyStart: 'April',
    gstNumber: '27ABCDE1234F1ZH',
    panNumber: 'ABCDE1234F',
    billingAddress: 'Sunrise Tower, Andheri East, Mumbai 400059',
    autoInvoice: true,
  },
  preferences: {
    defaultLandingPage: 'Dashboard',
    sessionTimeout: '30 minutes',
    emailNotifications: true,
    pushNotifications: true,
    dailyDigest: false,
    showMapView: true,
    compactTable: false,
  },
  security: {
    enforce2FA: true,
    passwordMinLength: '8',
    passwordExpiry: '90 days',
    maxLoginAttempts: '5',
    ipWhitelist: false,
    geoFenceAttendance: true,
    forceLogoutOnInactivity: true,
  },
};

class ApiWorkspaceSettingsService {
  async getWorkspaceSettings(tenantId?: string): Promise<WorkspaceSettings> {
    try {
      const bootstrap = await runtimeService.getBootstrap();
      return {
        ...DEFAULT_WORKSPACE_SETTINGS,
        tenantId: bootstrap.tenant.id,
        profile: {
          ...DEFAULT_WORKSPACE_SETTINGS.profile,
          companyName: bootstrap.tenant.displayName,
          shortName: bootstrap.tenant.displayName,
          workspaceId: bootstrap.tenant.id,
          configVersion: bootstrap.configVersion,
        },
        localization: {
          ...DEFAULT_WORKSPACE_SETTINGS.localization,
          timezone: bootstrap.settings.timezone,
          dateFormat: bootstrap.settings.dateFormat,
          language: bootstrap.settings.language,
          weekStart: bootstrap.settings.weekStartDay,
        },
        financial: {
          ...DEFAULT_WORKSPACE_SETTINGS.financial,
          currency: bootstrap.settings.currency,
          fyStart: `Month ${bootstrap.settings.financialYearStartMonth}`,
        },
      };
    } catch {
      return {
        ...DEFAULT_WORKSPACE_SETTINGS,
        tenantId: tenantId || 'default',
      };
    }
  }

  async updateWorkspaceSettings(tenantId: string, updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const current = await this.getWorkspaceSettings(tenantId);
    return {
      ...current,
      ...updates,
      profile: { ...current.profile, ...(updates.profile || {}) },
      localization: { ...current.localization, ...(updates.localization || {}) },
      financial: { ...current.financial, ...(updates.financial || {}) },
      preferences: { ...current.preferences, ...(updates.preferences || {}) },
      security: { ...current.security, ...(updates.security || {}) },
    };
  }

  async resetWorkspaceSettings(tenantId: string): Promise<WorkspaceSettings> {
    return this.getWorkspaceSettings(tenantId);
  }
}

export const workspaceSettingsService = new ApiWorkspaceSettingsService();
