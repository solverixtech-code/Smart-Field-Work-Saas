import { BadRequestException } from '@nestjs/common';
import { BillingCycle, Prisma, TenantSubscription } from '@prisma/client';
import { createHash } from 'crypto';
import { z } from 'zod';

const text = z.string().trim().min(1).max(200);
export const commandBase = z.object({
  idempotencyKey: text.refine(value => !value.startsWith('internal:'), 'Reserved idempotency namespace'),
  expectedRevision: z.number().int().positive(),
  reason: z.string().trim().min(1).max(1000),
  requestId: text.optional(),
});
export const selectionSchema = z.object({
  planVersionId: text,
  billingCycle: z.nativeEnum(BillingCycle),
  seatQuantity: z.number().int().positive().max(2147483647),
});
export const subscriptionCommandSchema = z.discriminatedUnion('action', [
  commandBase.extend({ action: z.literal('CHANGE_PLAN'), ...selectionSchema.shape }).strict(),
  commandBase.extend({ action: z.enum(['ACTIVATE', 'PAST_DUE', 'GRACE', 'SUSPEND', 'RESUME', 'CANCEL', 'APPLY_DUE']) }).strict(),
]);
export type SubscriptionCommand = z.infer<typeof subscriptionCommandSchema>;
export type Selection = z.infer<typeof selectionSchema>;
export interface CommandActor { readonly userId: string; }

export const commercialRulesSchema = z.object({
  trialEnabled: z.boolean(),
  trialDurationDays: z.number().int().positive().max(36500).optional(),
  trialSeatLimit: z.number().int().positive().optional(),
  trialModulePolicy: z.literal('USE_PLAN_MODULES'),
  autoConvertAfterTrial: z.boolean(),
  autoRenew: z.boolean(),
  allowUpgrade: z.boolean(),
  allowDowngrade: z.boolean(),
  changeEffectiveTiming: z.enum(['IMMEDIATE', 'NEXT_BILLING_CYCLE']),
  minimumCommitmentMonths: z.string().regex(/^(0|[1-9]\d{0,3})$/).transform(Number),
  availableForNewTenants: z.boolean(),
  availableForExistingTenants: z.boolean(),
  cancellationAllowed: z.boolean(),
  gracePeriodDays: z.number().int().min(0).max(365),
  accessAfterExpiry: z.enum(['READ_ONLY', 'BLOCKED']),
}).strict();
export type CommercialRules = z.infer<typeof commercialRulesSchema>;
export function readRules(rule: { schemaVersion: number; rules: Prisma.JsonValue } | null): CommercialRules {
  const parsed = commercialRulesSchema.safeParse(rule?.rules);
  if (rule?.schemaVersion !== 1 || !parsed.success || (parsed.data.trialEnabled && !parsed.data.trialDurationDays)) {
    throw new BadRequestException('Unsupported or incomplete pinned commercial rules');
  }
  return parsed.data;
}

// Stable key ordering; callers normalize semantic values before hashing.
export function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}
export function payloadHash(value: unknown): string {
  const canonical = (item: unknown): string => {
    if (Array.isArray(item)) return `[${item.map(canonical).join(',')}]`;
    if (item !== null && typeof item === 'object') {
      return `{${Object.entries(item).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
    }
    return JSON.stringify(item);
  };
  return createHash('sha256').update(canonical(value)).digest('hex');
}
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result;
}
export function periodEnd(date: Date, cycle: BillingCycle): Date {
  return addMonths(date, cycle === 'MONTHLY' ? 1 : 12);
}
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}
export function subscriptionAccess(sub: Pick<TenantSubscription, 'status' | 'trialEndsAt' | 'graceEndsAt'>, rules: CommercialRules, now: Date): 'FULL' | 'READ_ONLY' | 'BLOCKED' {
  switch (sub.status) {
    case 'ACTIVE': return 'FULL';
    case 'TRIALING': return sub.trialEndsAt && sub.trialEndsAt > now ? 'FULL' : rules.accessAfterExpiry;
    case 'GRACE': return sub.graceEndsAt && sub.graceEndsAt > now ? 'FULL' : rules.accessAfterExpiry;
    case 'PAST_DUE': return rules.accessAfterExpiry;
    case 'SUSPENDED':
    case 'CANCELLED': return 'BLOCKED';
  }
}
