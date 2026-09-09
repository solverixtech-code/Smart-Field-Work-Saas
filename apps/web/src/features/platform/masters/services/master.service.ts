import { api } from '../../../../common/api';

export interface EffectiveMasterDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  moduleCode: string | null;
  valueType: string;
  metadataSchema: string;
  allowTenantCreate: boolean;
  allowTenantEdit: boolean;
  allowTenantDeactivate: boolean;
  allowIndustryDefaults: boolean;
  systemValuePolicy: 'OVERRIDABLE_LABEL' | 'LOCKED_IDENTITY';
  displayOrder: number;
  status: 'ACTIVE';
  revision: number;
}

export interface EffectiveMasterValue {
  id: string;
  code: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
  provenance: 'SYSTEM' | 'INDUSTRY' | 'TENANT';
  isOverridden?: boolean;
  overrideLabel?: string | null;
  originId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTenantValueDto {
  code: string;
  label: string;
  displayOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateTenantValueDto {
  label?: string;
  displayOrder?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SetTenantOverrideDto {
  overrideLabel?: string | null;
  displayOrder?: number;
  isHidden?: boolean;
}

class ApiMasterService {
  async getEffectiveDefinitions(): Promise<EffectiveMasterDefinition[]> {
    const response = await api.get<EffectiveMasterDefinition[]>('/tenant/masters');
    return response.data;
  }

  async getEffectiveValues(code: string, query: { search?: string; isActive?: boolean } = {}): Promise<EffectiveMasterValue[]> {
    const params: Record<string, any> = {};
    if (query.search?.trim()) params.search = query.search.trim();
    if (query.isActive !== undefined) params.isActive = query.isActive;

    const response = await api.get<EffectiveMasterValue[]>(`/tenant/masters/${code}/values`, { params });
    return response.data;
  }

  async createTenantValue(code: string, input: CreateTenantValueDto): Promise<EffectiveMasterValue> {
    const response = await api.post<EffectiveMasterValue>(`/tenant/masters/${code}/values`, input);
    return response.data;
  }

  async updateTenantValue(id: string, input: UpdateTenantValueDto): Promise<EffectiveMasterValue> {
    const response = await api.patch<EffectiveMasterValue>(`/tenant/masters/values/${id}`, input);
    return response.data;
  }

  async setTenantOverride(id: string, input: SetTenantOverrideDto): Promise<any> {
    const response = await api.put(`/tenant/masters/overrides/${id}`, input);
    return response.data;
  }

  async removeTenantOverride(id: string): Promise<any> {
    const response = await api.delete(`/tenant/masters/overrides/${id}`);
    return response.data;
  }
}

export const masterService = new ApiMasterService();
