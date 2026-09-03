export type ModuleCategory = 'Core' | 'Sales' | 'Field Ops' | 'Automation' | 'Enterprise';

export interface ModuleFeature {
  code: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'BETA' | 'DEPRECATED';
  platformSupport?: boolean;
}

export interface PlatformModule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ModuleCategory;
  isAddon: boolean;
  monthlyPrice: number;
  requiredBySystem?: boolean;
  dependsOnModuleCode?: string;
  features?: ModuleFeature[];
}
