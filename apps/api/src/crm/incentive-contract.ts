import { z } from 'zod';

export const periodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const incentiveRuleInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  ruleType: z.enum(['Achievement', 'Performance', 'Activity', 'Ranking', 'Retention']),
  appliesTo: z.enum(['All Executives', 'Field Executives', 'Telecallers', 'Sales Managers']),
  metric: z.enum(['Total Sales (Amount)', 'New Customers (Count)', 'Total Visits (Count)', 'Demos (Count)', 'Collections (Amount)']),
  payoutMode: z.enum(['PERCENTAGE', 'SLAB', 'PER_UNIT']).optional().default('SLAB'),
  payoutRate: z.coerce.number().min(0).max(999999999999.99),
  slabStep: z.coerce.number().min(1).max(999999999999.99).optional().default(10000),
  startDate: z.string().date(),
  endDate: z.string().date(),
}).strict().refine((value) => value.endDate >= value.startDate, { message: 'End date must be on or after start date', path: ['endDate'] });

export const incentiveRulesQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']).optional(),
  ruleType: z.enum(['Achievement', 'Performance', 'Activity', 'Ranking', 'Retention']).optional(),
}).strict();

export const incentiveRuleStatusSchema = z.object({ status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']) }).strict();
export const incentivePeriodSchema = z.object({ period: periodSchema, search: z.string().trim().max(100).optional().default(''), executiveId: z.string().trim().optional() }).strict();
export const calculateIncentivesSchema = z.object({ period: periodSchema }).strict();
export const approveIncentivesSchema = z.object({ calculationIds: z.array(z.string().uuid()).min(1).max(200) }).strict();
export const payoutStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'PAID', 'FAILED']),
  paymentMode: z.string().trim().min(1).max(80).optional(),
  accountReference: z.string().trim().max(160).nullable().optional(),
  transactionReference: z.string().trim().max(160).nullable().optional(),
}).strict();
