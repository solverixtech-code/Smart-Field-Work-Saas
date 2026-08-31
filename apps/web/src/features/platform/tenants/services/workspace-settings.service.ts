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

const DEFAULT_SETTINGS_MAP: Record<string, WorkspaceSettings> = {
  default: {
    tenantId: 'default',
    profile: {
      companyName: 'Sunrise Healthcare Pvt Ltd',
      shortName: 'Sunrise Healthcare',
      industry: 'Pharma & Healthcare',
      tenantCode: 'SRHC',
      website: 'www.sunrisehealthcare.com',
      primaryEmail: 'info@sunrisehealthcare.com',
      primaryPhone: '9876543210',
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      logoInLogin: true,
      workspaceId: 'ws_8f3a2d9e-7c61-4b8d',
      configVersion: 'v1.2.3',
      createdOn: '24 May 2026, 10:30 AM',
      createdBy: 'Amit Sharma (Platform Super Admin)',
      address1: '201, Sunrise Tower, Andheri Kurla Road',
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
      billingAddress: '201, Sunrise Tower, Andheri Kurla Road, Andheri East, Mumbai 400059',
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
  },
};

class FixtureWorkspaceSettingsService {
  private savedSettings: Map<string, WorkspaceSettings> = new Map();
  private initialDefaults: Map<string, WorkspaceSettings> = new Map();

  async getWorkspaceSettings(tenantId: string): Promise<WorkspaceSettings> {
    if (!this.savedSettings.has(tenantId)) {
      const init: WorkspaceSettings = {
        ...DEFAULT_SETTINGS_MAP.default,
        tenantId,
      };
      this.savedSettings.set(tenantId, JSON.parse(JSON.stringify(init)));
      this.initialDefaults.set(tenantId, JSON.parse(JSON.stringify(init)));
    }
    return Promise.resolve(JSON.parse(JSON.stringify(this.savedSettings.get(tenantId)!)));
  }

  async updateWorkspaceSettings(tenantId: string, updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const current = await this.getWorkspaceSettings(tenantId);
    const updated: WorkspaceSettings = {
      ...current,
      ...updates,
      profile: { ...current.profile, ...(updates.profile || {}) },
      localization: { ...current.localization, ...(updates.localization || {}) },
      financial: { ...current.financial, ...(updates.financial || {}) },
      preferences: { ...current.preferences, ...(updates.preferences || {}) },
      security: { ...current.security, ...(updates.security || {}) },
    };
    this.savedSettings.set(tenantId, JSON.parse(JSON.stringify(updated)));
    return Promise.resolve(JSON.parse(JSON.stringify(updated)));
  }

  async resetWorkspaceSettings(tenantId: string): Promise<WorkspaceSettings> {
    const initial = this.initialDefaults.get(tenantId) || { ...DEFAULT_SETTINGS_MAP.default, tenantId };
    this.savedSettings.set(tenantId, JSON.parse(JSON.stringify(initial)));
    return Promise.resolve(JSON.parse(JSON.stringify(initial)));
  }
}

export const workspaceSettingsService = new FixtureWorkspaceSettingsService();

