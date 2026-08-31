import { Plan, PlanDraftInput } from '../types/plan.types';
import { CANONICAL_PLATFORM_PLANS } from '../fixtures/plan.fixtures';

const LOCAL_STORAGE_KEY = 'sfw_plans_catalog_v1';

class FixturePlanService {
  private loadFromStorage(): Plan[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if localStorage fails
    }
    this.saveToStorage(CANONICAL_PLATFORM_PLANS);
    return [...CANONICAL_PLATFORM_PLANS];
  }

  private saveToStorage(plans: Plan[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Ignore storage errors
    }
  }

  async getPlans(): Promise<Plan[]> {
    const plans = this.loadFromStorage();
    return Promise.resolve(JSON.parse(JSON.stringify(plans)));
  }

  async getPlanById(planId: string): Promise<Plan | null> {
    const plans = this.loadFromStorage();
    const found = plans.find((p) => p.id === planId || p.code === planId.toUpperCase());
    if (!found) return Promise.resolve(null);
    return Promise.resolve(JSON.parse(JSON.stringify(found)));
  }

  async createDraft(input: PlanDraftInput): Promise<Plan> {
    const plans = this.loadFromStorage();
    const now = new Date().toISOString();
    const generatedId = `plan_${input.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newPlan: Plan = {
      ...input,
      id: generatedId,
      code: input.code.trim().toUpperCase(),
      status: input.status || 'Draft',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    plans.push(newPlan);
    this.saveToStorage(plans);
    return Promise.resolve(JSON.parse(JSON.stringify(newPlan)));
  }

  async updateDraft(planId: string, input: PlanDraftInput): Promise<Plan> {
    const plans = this.loadFromStorage();
    const index = plans.findIndex((p) => p.id === planId);
    if (index === -1) {
      throw new Error(`Plan with ID '${planId}' not found.`);
    }

    const now = new Date().toISOString();
    const updatedPlan: Plan = {
      ...plans[index],
      ...input,
      id: planId, // preserve ID
      code: input.code.trim().toUpperCase(),
      updatedAt: now,
    };

    plans[index] = updatedPlan;
    this.saveToStorage(plans);
    return Promise.resolve(JSON.parse(JSON.stringify(updatedPlan)));
  }

  async publishPlan(planId: string): Promise<Plan> {
    const plans = this.loadFromStorage();
    const index = plans.findIndex((p) => p.id === planId);
    if (index === -1) {
      throw new Error(`Plan with ID '${planId}' not found.`);
    }

    const now = new Date().toISOString();
    plans[index].status = 'Active';
    plans[index].updatedAt = now;

    this.saveToStorage(plans);
    return Promise.resolve(JSON.parse(JSON.stringify(plans[index])));
  }

  async duplicatePlan(planId: string): Promise<Plan> {
    const target = await this.getPlanById(planId);
    if (!target) {
      throw new Error(`Plan with ID '${planId}' not found for duplication.`);
    }

    const plans = this.loadFromStorage();
    const now = new Date().toISOString();
    const duplicateCode = `${target.code}_COPY_${Math.floor(Math.random() * 1000)}`;
    const duplicateId = `plan_${duplicateCode.toLowerCase()}`;

    const newPlan: Plan = {
      ...target,
      id: duplicateId,
      code: duplicateCode,
      name: `${target.name} (Copy)`,
      status: 'Draft',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    plans.push(newPlan);
    this.saveToStorage(plans);
    return Promise.resolve(JSON.parse(JSON.stringify(newPlan)));
  }

  async archivePlan(planId: string): Promise<Plan> {
    const plans = this.loadFromStorage();
    const index = plans.findIndex((p) => p.id === planId);
    if (index === -1) {
      throw new Error(`Plan with ID '${planId}' not found.`);
    }

    const now = new Date().toISOString();
    plans[index].status = 'Archived';
    plans[index].updatedAt = now;

    this.saveToStorage(plans);
    return Promise.resolve(JSON.parse(JSON.stringify(plans[index])));
  }
}

export const planService = new FixturePlanService();
