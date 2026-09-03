import { api } from '../../../../../common/api';
import {
  PlatformModule,
  ModuleFeature,
  ModuleQueryFilter,
  CreateModuleInput,
  UpdateModuleInput,
  CreateFeatureInput,
  UpdateFeatureInput,
} from '../types/module.types';

export interface PaginatedModulesResponse {
  data: PlatformModule[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ModuleService {
  /**
   * Fetches modules catalog from NestJS PostgreSQL backend.
   * Fixtures are strictly not used as production runtime fallback.
   */
  async getModules(filter: ModuleQueryFilter = {}): Promise<PlatformModule[]> {
    try {
      const response = await api.get<PaginatedModulesResponse>('/platform/modules', {
        params: filter,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch platform modules from API:', error);
      throw error;
    }
  }

  async getModulesPaginated(filter: ModuleQueryFilter = {}): Promise<PaginatedModulesResponse> {
    const response = await api.get<PaginatedModulesResponse>('/platform/modules', {
      params: filter,
    });
    return response.data;
  }

  async getModuleById(idOrCode: string): Promise<PlatformModule | null> {
    try {
      const response = await api.get<PlatformModule>(`/platform/modules/${idOrCode}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getModuleByCode(code: string): Promise<PlatformModule | null> {
    return this.getModuleById(code);
  }

  async createModule(input: CreateModuleInput): Promise<PlatformModule> {
    const response = await api.post<PlatformModule>('/platform/modules', input);
    return response.data;
  }

  async updateModule(id: string, input: UpdateModuleInput): Promise<PlatformModule> {
    const response = await api.patch<PlatformModule>(`/platform/modules/${id}`, input);
    return response.data;
  }

  async archiveModule(id: string): Promise<PlatformModule> {
    const response = await api.post<PlatformModule>(`/platform/modules/${id}/archive`);
    return response.data;
  }

  async restoreModule(id: string): Promise<PlatformModule> {
    const response = await api.post<PlatformModule>(`/platform/modules/${id}/restore`);
    return response.data;
  }

  async createFeature(moduleId: string, input: CreateFeatureInput): Promise<ModuleFeature> {
    const response = await api.post<ModuleFeature>(`/platform/modules/${moduleId}/features`, input);
    return response.data;
  }

  async updateFeature(
    moduleId: string,
    featureId: string,
    input: UpdateFeatureInput,
  ): Promise<ModuleFeature> {
    const response = await api.patch<ModuleFeature>(
      `/platform/modules/${moduleId}/features/${featureId}`,
      input,
    );
    return response.data;
  }

  async deleteFeature(moduleId: string, featureId: string): Promise<ModuleFeature> {
    const response = await api.delete<ModuleFeature>(
      `/platform/modules/${moduleId}/features/${featureId}`,
    );
    return response.data;
  }

  async updateDependencies(
    moduleId: string,
    dependencyCodes: string[],
  ): Promise<PlatformModule> {
    const response = await api.put<PlatformModule>(
      `/platform/modules/${moduleId}/dependencies`,
      { dependencyCodes },
    );
    return response.data;
  }
}

export const moduleService = new ModuleService();
