import { z } from 'zod';

export const targetMetricSchema = z.enum([
  'sales_amount',
  'deals_count',
  'leads_count',
  'win_rate',
  'average_deal_value',
  'calls_count',
  'meetings_count',
  'demos_count',
  'visits_count',
  'collections_amount',
]);

export const targetDashboardQuery = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  comparePeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
}).strict();

export const setSalesTargetSchema = z.object({
  targetType: z.enum(['team', 'individual']),
  scopeId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  metric: targetMetricSchema,
  targetValue: z.coerce.number().positive().max(999999999999.99),
  thresholdPct: z.coerce.number().min(0).max(100).default(80),
}).strict();

export type TargetMetric = z.infer<typeof targetMetricSchema>;
