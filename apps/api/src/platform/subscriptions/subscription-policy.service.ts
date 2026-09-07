import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanLimit, Prisma, TenantSubscription } from '@prisma/client';
import { addMonths, readRules, Selection } from './subscription-contract';
import { MODULE_REGISTRY } from '../modules/feature-registry';

export const commercialVersionSelect = {
  id: true, status: true, publishedAt: true,
  plan: { select: { id: true, status: true } },
  commercialRule: { select: { schemaVersion: true, rules: true } },
  pricing: true, limits: true,
  modules: { select: { moduleId: true, module: { select: { code: true, status: true } } } },
} satisfies Prisma.PlanVersionSelect;
export type CommercialVersion = Prisma.PlanVersionGetPayload<{ select: typeof commercialVersionSelect }>;

@Injectable()
export class SubscriptionPolicyService {
  async select(tx: Prisma.TransactionClient, input: Selection, audience: 'NEW' | 'EXISTING', trial = false) {
    const version = await tx.planVersion.findUnique({ where: { id: input.planVersionId }, select: commercialVersionSelect });
    if (!version || version.status !== 'PUBLISHED' || !version.publishedAt || version.plan.status !== 'ACTIVE') {
      throw new BadRequestException('Select an explicitly published version of an active Plan');
    }
    const rules = readRules(version.commercialRule);
    const codes = new Set(version.modules.map(m => m.module.code));
    if (MODULE_REGISTRY.some(m => m.requiredBySystem && !codes.has(m.code))) throw new BadRequestException('Published Plan is missing required Modules');
    for (const link of version.modules) {
      const registered = MODULE_REGISTRY.find(m => m.code === link.module.code);
      if (!registered || !['ACTIVE', 'BETA'].includes(link.module.status) || !['ACTIVE', 'BETA'].includes(registered.status) || registered.dependencyCodes?.some(code => !codes.has(code))) {
        throw new BadRequestException('Published Plan has unavailable Modules or incomplete dependencies');
      }
    }
    if (!(audience === 'NEW' ? rules.availableForNewTenants : rules.availableForExistingTenants)) {
      throw new BadRequestException('Plan is unavailable for this Tenant');
    }
    if (!version.pricing.some(p => p.billingCycle === input.billingCycle)) {
      throw new BadRequestException('Billing cycle is unavailable on the selected PlanVersion');
    }
    const min = version.limits.find(l => l.limitCode === 'minimum_seats')?.integerValue ?? 1;
    const defaultSeats = version.limits.find(l => l.limitCode === 'default_seat_limit')?.integerValue ?? min;
    const max = version.limits.find(l => l.limitCode === 'maximum_seats');
    const increment = version.limits.find(l => l.limitCode === 'seat_increment')?.integerValue ?? 1;
    if (input.seatQuantity < min || (!max?.isUnlimited && input.seatQuantity > (max?.integerValue ?? defaultSeats)) || increment < 1 || (input.seatQuantity - min) % increment !== 0) {
      throw new BadRequestException('Seat quantity violates the pinned Plan limits');
    }
    if (trial && (!rules.trialEnabled || (rules.trialSeatLimit !== undefined && input.seatQuantity > rules.trialSeatLimit))) {
      throw new BadRequestException('Trial is disabled or trial seats exceeded');
    }
    return { version, rules };
  }

  commitment(sub: TenantSubscription, version: CommercialVersion, now: Date) {
    if (now < addMonths(sub.startedAt, readRules(version.commercialRule).minimumCommitmentMonths)) {
      throw new BadRequestException('Minimum commitment has not elapsed');
    }
  }

  change(sub: TenantSubscription, current: CommercialVersion, target: CommercialVersion, input: Selection, now: Date) {
    const rules = readRules(current.commercialRule);
    // A Plan has no frozen tier ordering. Compare concrete capacity and recurring price;
    // mixed/incomparable changes must satisfy both permissions rather than guessing a rank.
    const oldPrice = current.pricing.find(p => p.billingCycle === sub.billingCycle);
    const newPrice = target.pricing.find(p => p.billingCycle === input.billingCycle);
    if (!oldPrice || !newPrice || oldPrice.currency !== newPrice.currency) {
      throw new BadRequestException('Plan change requires comparable pricing in the same currency');
    }
    const recurring = (p: typeof oldPrice, seats: number) => {
      let amount = new Prisma.Decimal(0);
      switch (p.model) {
        case 'FLAT': amount = p.flatFee ?? amount; break;
        case 'PER_USER': amount = (p.perSeatFee ?? amount).mul(seats); break;
        case 'BASE_PLUS_PER_USER': amount = (p.baseFee ?? amount).add((p.perSeatFee ?? amount).mul(seats)); break;
        case 'CUSTOM_CONTRACT': throw new BadRequestException('Custom-contract changes require a separately approved comparison contract');
      }
      return amount.mul(new Prisma.Decimal(100).sub(p.discountPercent ?? 0)).div(100).div(p.billingCycle === 'ANNUAL' ? 12 : 1);
    };
    const comparison = recurring(newPrice, input.seatQuantity).comparedTo(recurring(oldPrice, sub.seatQuantity));
    let upgrade = comparison > 0 || input.seatQuantity > sub.seatQuantity;
    let downgrade = comparison < 0 || input.seatQuantity < sub.seatQuantity;
    const oldModules = new Set(current.modules.map(m => m.moduleId));
    const newModules = new Set(target.modules.map(m => m.moduleId));
    upgrade ||= [...newModules].some(m => !oldModules.has(m));
    downgrade ||= [...oldModules].some(m => !newModules.has(m));
    for (const code of new Set([...current.limits, ...target.limits].map(l => l.limitCode))) {
      const before = current.limits.find(l => l.limitCode === code);
      const after = target.limits.find(l => l.limitCode === code);
      if (!before || !after || before.valueType !== after.valueType) { upgrade = true; downgrade = true; continue; }
      const limitComparison = this.compareLimits(before, after);
      upgrade ||= limitComparison > 0;
      downgrade ||= limitComparison < 0;
    }
    if (!upgrade && !downgrade && (current.id !== target.id || input.billingCycle !== sub.billingCycle)) { upgrade = true; downgrade = true; }
    if ((upgrade && !rules.allowUpgrade) || (downgrade && !rules.allowDowngrade)) {
      throw new BadRequestException('Pinned Plan does not allow this commercial change');
    }
    if (downgrade) this.commitment(sub, current, now);
  }

  private compareLimits(before: PlanLimit, after: PlanLimit): number {
    if (before.isUnlimited || after.isUnlimited) {
      return before.isUnlimited === after.isUnlimited ? 0 : after.isUnlimited ? 1 : -1;
    }
    switch (before.valueType) {
      case 'INTEGER':
        if (before.integerValue === null || after.integerValue === null) throw new BadRequestException('Integer limit value is missing');
        return after.integerValue === before.integerValue ? 0 : after.integerValue > before.integerValue ? 1 : -1;
      case 'DECIMAL':
        if (before.decimalValue === null || after.decimalValue === null) throw new BadRequestException('Decimal limit value is missing');
        return after.decimalValue.comparedTo(before.decimalValue);
      case 'BOOLEAN':
        if (before.booleanValue === null || after.booleanValue === null) throw new BadRequestException('Boolean limit value is missing');
        return after.booleanValue === before.booleanValue ? 0 : after.booleanValue ? 1 : -1;
    }
  }
}
