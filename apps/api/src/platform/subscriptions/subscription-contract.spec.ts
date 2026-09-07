import { addMonths, commercialRulesSchema, readRules, subscriptionAccess } from './subscription-contract';
import { SubscriptionStatus } from '@prisma/client';

const rawRules = {
  trialEnabled: true, trialDurationDays: 14, trialModulePolicy: 'USE_PLAN_MODULES', autoConvertAfterTrial: false,
  autoRenew: true, allowUpgrade: true, allowDowngrade: true, changeEffectiveTiming: 'IMMEDIATE',
  minimumCommitmentMonths: '0', availableForNewTenants: true, availableForExistingTenants: true,
  cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY',
};

describe('Subscription access contract', () => {
  const now = new Date('2026-09-07T12:00:00Z');
  const future = new Date('2026-09-08T12:00:00Z');
  const past = new Date('2026-09-06T12:00:00Z');
  const cases: Array<[SubscriptionStatus, Date | null, Date | null, string]> = [
    ['ACTIVE', null, null, 'FULL'], ['TRIALING', future, null, 'FULL'],
    ['TRIALING', now, null, 'READ_ONLY'], ['TRIALING', past, null, 'READ_ONLY'],
    ['PAST_DUE', null, null, 'READ_ONLY'], ['GRACE', null, future, 'FULL'],
    ['GRACE', null, now, 'READ_ONLY'], ['GRACE', null, past, 'READ_ONLY'],
    ['SUSPENDED', future, future, 'BLOCKED'], ['CANCELLED', future, future, 'BLOCKED'],
  ];
  it.each(cases)('%s evaluates time boundaries', (status, trialEndsAt, graceEndsAt, expected) => {
    expect(subscriptionAccess({ status, trialEndsAt, graceEndsAt }, commercialRulesSchema.parse(rawRules), now)).toBe(expected);
  });
  it('honors BLOCKED expiry policy', () => {
    expect(subscriptionAccess({ status: 'PAST_DUE', trialEndsAt: null, graceEndsAt: null }, commercialRulesSchema.parse({ ...rawRules, accessAfterExpiry: 'BLOCKED' }), now)).toBe('BLOCKED');
  });
  it('fails closed for unknown rules, versions and trial policy', () => {
    for (const rule of [null, { schemaVersion: 2, rules: rawRules }, { schemaVersion: 1, rules: { ...rawRules, trialModulePolicy: 'ALL_MODULES' } }, { schemaVersion: 1, rules: { ...rawRules, minimumCommitmentMonths: 'negotiable' } }]) {
      expect(() => readRules(rule)).toThrow();
    }
  });
  it('clamps month and leap-year boundaries without overflowing', () => {
    expect(addMonths(new Date('2024-01-31T12:45:00Z'), 1).toISOString()).toBe('2024-02-29T12:45:00.000Z');
    expect(addMonths(new Date('2024-02-29T12:45:00Z'), 12).toISOString()).toBe('2025-02-28T12:45:00.000Z');
  });
});
