export type PlatformModuleCategory = 'CORE' | 'SALES' | 'FIELD_OPS' | 'AUTOMATION' | 'ENTERPRISE';
export type ModuleCategory = PlatformModuleCategory | 'Core' | 'Sales' | 'Field Ops' | 'Automation' | 'Enterprise';

export type PlatformModuleStatus = 'DRAFT' | 'ACTIVE' | 'BETA' | 'DEPRECATED' | 'ARCHIVED';
export type ModuleFeatureStatus = 'ACTIVE' | 'BETA' | 'DEPRECATED';

export interface ModuleFeature {
  id?: string;
  code: string;
  name: string;
  description: string;
  status: ModuleFeatureStatus;
  platformSupport?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformModule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ModuleCategory;
  status?: PlatformModuleStatus;
  isAddon: boolean;
  monthlyPrice: number;
  requiredBySystem?: boolean;
  displayOrder?: number;
  dependencyCodes?: string[];
  dependentCodes?: string[];
  dependsOnModuleCode?: string; // Legacy fallback helper
  features?: ModuleFeature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleQueryFilter {
  search?: string;
  category?: ModuleCategory;
  status?: PlatformModuleStatus;
  type?: 'addon' | 'standard';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateModuleInput {
  code: string;
  name: string;
  description: string;
  category: ModuleCategory;
  status?: PlatformModuleStatus;
  isAddon?: boolean;
  monthlyPrice?: number;
  requiredBySystem?: boolean;
  displayOrder?: number;
  dependencyCodes?: string[];
}

export interface UpdateModuleInput {
  name?: string;
  description?: string;
  category?: ModuleCategory;
  status?: PlatformModuleStatus;
  isAddon?: boolean;
  monthlyPrice?: number;
  requiredBySystem?: boolean;
  displayOrder?: number;
  dependencyCodes?: string[];
}

export interface CreateFeatureInput {
  code: string;
  name: string;
  description: string;
  status?: ModuleFeatureStatus;
  platformSupport?: boolean;
  displayOrder?: number;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
  status?: ModuleFeatureStatus;
  platformSupport?: boolean;
  displayOrder?: number;
}
