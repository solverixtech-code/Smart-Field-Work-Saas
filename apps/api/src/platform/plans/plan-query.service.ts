import { Injectable } from '@nestjs/common';
import { Plan, PlanVersion, PlanPricing, PlanLimit, PlanModule, PlanCommercialRule, PlatformModule } from '@prisma/client';

export interface FormattedPlanPricingDto {
  id: string;
  planVersionId: string;
  model: string;
  billingCycle: string;
  currency: string;
  baseFee: string | null;
  perSeatFee: string | null;
  flatFee: string | null;
  setupFee: string | null;
  minimumCommitmentAmount: string | null;
  discountPercent: string | null;
  taxMode: string;
  prorationPolicy: string;
}

export interface FormattedPlanLimitDto {
  id: string;
  planVersionId: string;
  limitCode: string;
  valueType: string;
  integerValue: number | null;
  decimalValue: string | null;
  booleanValue: boolean | null;
  isUnlimited: boolean;
  unit: string | null;
}

export interface FormattedPlanVersionDto {
  id: string;
  planId: string;
  version: number;
  status: string; // DRAFT | PUBLISHED
  displayStatus: 'DRAFT' | 'CURRENT' | 'REPLACED';
  publishedAt: string | null;
  publishedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  pricing: FormattedPlanPricingDto[];
  limits: FormattedPlanLimitDto[];
  includedModuleCodes: string[];
  commercialRule: Record<string, any> | null;
}

export interface FormattedPlanDto {
  id: string;
  code: string;
  name: string;
  description: string;
  internalDescription: string | null;
  status: string; // DRAFT | ACTIVE | ARCHIVED
  visibility: string; // PUBLIC | INTERNAL | INVITE_ONLY
  tier: string | null;
  badge: string | null;
  recommendedFor: string | null;
  displayOrder: number;
  color: string | null;
  currentPublishedVersionId: string | null;
  currentPublishedVersion: FormattedPlanVersionDto | null;
  currentDraftVersion: FormattedPlanVersionDto | null;
  versionsCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

@Injectable()
export class PlanQueryService {
  formatDecimal(val: any): string | null {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' && val.toFixed ? val.toFixed(2) : String(val);
  }

  formatPricing(pricing: PlanPricing[]): FormattedPlanPricingDto[] {
    return pricing.map((p) => ({
      id: p.id,
      planVersionId: p.planVersionId,
      model: (p as any).model || 'PER_USER',
      billingCycle: p.billingCycle,
      currency: p.currency,
      baseFee: this.formatDecimal(p.baseFee),
      perSeatFee: this.formatDecimal(p.perSeatFee),
      flatFee: this.formatDecimal(p.flatFee),
      setupFee: this.formatDecimal(p.setupFee),
      minimumCommitmentAmount: this.formatDecimal(p.minimumCommitmentAmount),
      discountPercent: p.discountPercent ? String(p.discountPercent) : null,
      taxMode: p.taxMode,
      prorationPolicy: p.prorationPolicy,
    }));
  }

  formatLimits(limits: PlanLimit[]): FormattedPlanLimitDto[] {
    return limits.map((l) => ({
      id: l.id,
      planVersionId: l.planVersionId,
      limitCode: l.limitCode,
      valueType: l.valueType,
      integerValue: l.integerValue,
      decimalValue: this.formatDecimal(l.decimalValue),
      booleanValue: l.booleanValue,
      isUnlimited: l.isUnlimited,
      unit: l.unit,
    }));
  }

  formatVersion(
    version: PlanVersion & {
      pricing?: PlanPricing[];
      limits?: PlanLimit[];
      modules?: (PlanModule & { module?: PlatformModule })[];
      commercialRule?: PlanCommercialRule | null;
    },
    currentPublishedVersionId: string | null,
  ): FormattedPlanVersionDto {
    let displayStatus: 'DRAFT' | 'CURRENT' | 'REPLACED' = 'DRAFT';
    if (version.status === 'PUBLISHED') {
      displayStatus = version.id === currentPublishedVersionId ? 'CURRENT' : 'REPLACED';
    }

    const includedModuleCodes = (version.modules || []).map(
      (m) => m.module?.code || (m as any).moduleCode || ''
    ).filter(Boolean);

    return {
      id: version.id,
      planId: version.planId,
      version: version.version,
      status: version.status,
      displayStatus,
      publishedAt: version.publishedAt ? version.publishedAt.toISOString() : null,
      publishedByUserId: version.publishedByUserId,
      createdAt: version.createdAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
      pricing: this.formatPricing(version.pricing || []),
      limits: this.formatLimits(version.limits || []),
      includedModuleCodes,
      commercialRule: version.commercialRule ? (version.commercialRule.rules as any) : null,
    };
  }

  formatPlan(
    plan: Plan & {
      versions?: Array<
        PlanVersion & {
          pricing?: PlanPricing[];
          limits?: PlanLimit[];
          modules?: (PlanModule & { module?: PlatformModule })[];
          commercialRule?: PlanCommercialRule | null;
        }
      >;
      currentPublishedVersion?: (
        PlanVersion & {
          pricing?: PlanPricing[];
          limits?: PlanLimit[];
          modules?: (PlanModule & { module?: PlatformModule })[];
          commercialRule?: PlanCommercialRule | null;
        }
      ) | null;
    },
  ): FormattedPlanDto {
    const versions = plan.versions || [];
    const currentPublished = plan.currentPublishedVersion
      ? this.formatVersion(plan.currentPublishedVersion, plan.currentPublishedVersionId)
      : null;

    const draftVersionRaw = versions.find((v) => v.status === 'DRAFT');
    const currentDraft = draftVersionRaw
      ? this.formatVersion(draftVersionRaw, plan.currentPublishedVersionId)
      : null;

    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      internalDescription: plan.internalDescription,
      status: plan.status,
      visibility: plan.visibility,
      tier: plan.tier,
      badge: plan.badge,
      recommendedFor: plan.recommendedFor,
      displayOrder: plan.displayOrder,
      color: plan.color,
      currentPublishedVersionId: plan.currentPublishedVersionId,
      currentPublishedVersion: currentPublished,
      currentDraftVersion: currentDraft,
      versionsCount: versions.length,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      archivedAt: plan.archivedAt ? plan.archivedAt.toISOString() : null,
    };
  }
}
