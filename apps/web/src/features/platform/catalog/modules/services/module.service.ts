import { PlatformModule } from '../types/module.types';
import { CANONICAL_PLATFORM_MODULES } from '../fixtures/module.fixtures';

class ModuleService {
  async getModules(): Promise<PlatformModule[]> {
    return Promise.resolve([...CANONICAL_PLATFORM_MODULES]);
  }

  async getModuleByCode(code: string): Promise<PlatformModule | null> {
    const found = CANONICAL_PLATFORM_MODULES.find((m) => m.code === code);
    return Promise.resolve(found || null);
  }
}

export const moduleService = new ModuleService();
