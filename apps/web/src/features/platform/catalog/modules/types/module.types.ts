export type ModuleCategory = 'Core' | 'Sales' | 'Field Ops' | 'Automation' | 'Enterprise';

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
}
