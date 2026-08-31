export interface WorkspaceSettings {
  tenantId: string;
  companyName: string;
  domain: string;
  dateFormat: string;
  timezone: string;
  currency: string;
  financialYearStart: string;
  weekStartDay: string;
  allowSelfRegistration: boolean;
  enforce2FA: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelist: string;
  supportEmail: string;
  primaryBrandColor: string;
}

const DEFAULT_SETTINGS_MAP: Record<string, WorkspaceSettings> = {
  default: {
    tenantId: 'default',
    companyName: 'Smart Field Work Workspace',
    domain: 'workspace.smartfieldwork.com',
    dateFormat: 'DD MMM YYYY',
    timezone: '(GMT+05:30) Asia/Kolkata',
    currency: 'INR (₹)',
    financialYearStart: 'April',
    weekStartDay: 'Monday',
    allowSelfRegistration: false,
    enforce2FA: true,
    sessionTimeoutMinutes: 60,
    ipWhitelist: '',
    supportEmail: 'support@smartfieldwork.com',
    primaryBrandColor: '#0D1F3D',
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
      this.savedSettings.set(tenantId, { ...init });
      this.initialDefaults.set(tenantId, { ...init });
    }
    return Promise.resolve({ ...this.savedSettings.get(tenantId)! });
  }

  async updateWorkspaceSettings(tenantId: string, updates: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const current = await this.getWorkspaceSettings(tenantId);
    const updated = { ...current, ...updates };
    this.savedSettings.set(tenantId, updated);
    return Promise.resolve({ ...updated });
  }

  async resetWorkspaceSettings(tenantId: string): Promise<WorkspaceSettings> {
    const initial = this.initialDefaults.get(tenantId) || { ...DEFAULT_SETTINGS_MAP.default, tenantId };
    this.savedSettings.set(tenantId, { ...initial });
    return Promise.resolve({ ...initial });
  }
}

export const workspaceSettingsService = new FixtureWorkspaceSettingsService();
