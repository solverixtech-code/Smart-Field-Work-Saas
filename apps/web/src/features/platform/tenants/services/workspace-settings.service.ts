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

// Safe presentational defaults for form fields (empty strings / unconfigured indicators)
// Authoritative data MUST come from server runtime bootstrap. No fake demo values are allowed.

class ApiWorkspaceSettingsService {
  async getWorkspaceSettings(tenantId?: string): Promise<WorkspaceSettings> {
    // Authoritative call: get runtime bootstrap from server.
    // If API fails, throw error so UI renders explicit error state.
    const bootstrap = await runtimeService.getBootstrap();

    if (!bootstrap || !bootstrap.tenant) {
      throw new Error('AUTHORITATIVE_BOOTSTRAP_UNAVAILABLE: Workspace bootstrap returned empty or missing tenant data.');
    }

    return {
      tenantId: bootstrap.tenant.id,
      profile: {
        companyName: bootstrap.tenant.displayName || '—',
        shortName: bootstrap.tenant.displayName || '—',
        industry: bootstrap.industry?.templateId ? `Template #${bootstrap.industry.templateId}` : 'Unassigned',
        tenantCode: bootstrap.tenant.id,
        website: '',
        primaryEmail: '',
        primaryPhone: '',
        primaryColor: '#0D1F3D',
        secondaryColor: '#2563EB',
        logoInLogin: false,
        workspaceId: bootstrap.tenant.id,
        configVersion: bootstrap.configVersion,
        createdOn: bootstrap.generatedAt ? new Date(bootstrap.generatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        createdBy: 'System Provisioning',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
      },
      localization: {
        timezone: bootstrap.settings?.timezone || 'Asia/Kolkata',
        dateFormat: bootstrap.settings?.dateFormat || 'DD MMM YYYY',
        timeFormat: '12-hour (hh:mm AM/PM)',
        language: bootstrap.settings?.language || 'English',
        weekStart: bootstrap.settings?.weekStartDay || 'Monday',
        numberFormat: '1,23,456.78 (Indian)',
      },
      financial: {
        currency: bootstrap.settings?.currency || 'INR',
        fyStart: bootstrap.settings?.financialYearStartMonth ? `Month ${bootstrap.settings.financialYearStartMonth}` : 'April',
        gstNumber: '',
        panNumber: '',
        billingAddress: '',
        autoInvoice: false,
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
        enforce2FA: false,
        passwordMinLength: '8',
        passwordExpiry: '90 days',
        maxLoginAttempts: '5',
        ipWhitelist: false,
        geoFenceAttendance: true,
        forceLogoutOnInactivity: true,
      },
    };
  }

  async updateWorkspaceSettings(tenantId: string, updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    // Prohibited: Local simulation of settings persistence.
    // Every field must either use a real backend mutation endpoint or throw MUTATION_UNSUPPORTED.
    throw new Error('MUTATION_UNSUPPORTED: Workspace settings update endpoint is not exposed by the current backend API contract.');
  }

  async resetWorkspaceSettings(tenantId: string): Promise<WorkspaceSettings> {
    return this.getWorkspaceSettings(tenantId);
  }
}

export const workspaceSettingsService = new ApiWorkspaceSettingsService();
