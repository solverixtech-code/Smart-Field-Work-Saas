import { api } from '../../../common/api';

export interface RuntimeBootstrapDto {
  schemaVersion: number;
  configVersion: string;
  generatedAt: string;
  nextRevalidationAt: string | null;
  principal: {
    userId: string;
    membershipId: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    displayName: string;
    status: 'ACTIVE';
  };
  access: {
    mode: 'FULL' | 'READ_ONLY';
    mapping: 'SUBSCRIBED' | 'LEGACY_UNMAPPED';
    subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'GRACE' | null;
    planVersionId: string | null;
  };
  modules: Array<{
    code: string;
    status: 'ACTIVE' | 'BETA';
    source: 'PLAN_VERSION';
  }>;
  industry: {
    templateId: string;
    versionId: string;
    version: number;
  } | null;
  settings: {
    timezone: string;
    currency: string;
    locale: string;
    language: string;
    dateFormat: string;
    weekStartDay: string;
    financialYearStartMonth: number;
  };
  settingsProvenance: 'SYSTEM' | 'TENANT';
  permissions: string[];
  masters: {
    strategy: 'MANIFEST';
    canRead: boolean;
    canManage: boolean;
    definitions: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      moduleCode: string | null;
      valueType: 'LABEL';
      metadataSchema: 'NONE';
      allowTenantCreate: boolean;
      allowTenantEdit: boolean;
      allowTenantDeactivate: boolean;
      allowIndustryDefaults: boolean;
      systemValuePolicy: 'OVERRIDABLE_LABEL' | 'LOCKED_IDENTITY';
      displayOrder: number;
      status: 'ACTIVE';
      revision: number;
    }>;
  };
}

class ApiRuntimeService {
  private currentBootstrap: RuntimeBootstrapDto | null = null;
  private tenantCacheListeners: Array<() => void> = [];

  async getBootstrap(): Promise<RuntimeBootstrapDto> {
    const response = await api.get<RuntimeBootstrapDto>('/tenant/runtime/bootstrap');
    const data = response.data;

    // Fail-safe validation of schema version
    if (data.schemaVersion !== 1) {
      throw new Error(`UNSUPPORTED_BOOTSTRAP_SCHEMA: Received schemaVersion ${data.schemaVersion}, expected 1.`);
    }

    this.currentBootstrap = data;
    return data;
  }

  getCurrentBootstrap(): RuntimeBootstrapDto | null {
    return this.currentBootstrap;
  }

  /**
   * Clears and invalidates all tenant-specific cached state upon tenant or membership switch.
   */
  invalidateTenantCache(): void {
    this.currentBootstrap = null;
    for (const listener of this.tenantCacheListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in tenant cache invalidation listener', err);
      }
    }
  }

  onTenantCacheInvalidate(listener: () => void): () => void {
    this.tenantCacheListeners.push(listener);
    return () => {
      this.tenantCacheListeners = this.tenantCacheListeners.filter((l) => l !== listener);
    };
  }
}

export const runtimeService = new ApiRuntimeService();
