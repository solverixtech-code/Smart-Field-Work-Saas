export type PlanTransactionError = 'RETRYABLE' | 'CONFLICT' | 'OTHER';

/** Prisma wraps raw PostgreSQL serialization/deadlock failures as P2010. */
export function classifyPlanTransactionError(error: unknown): PlanTransactionError {
  if (typeof error !== 'object' || error === null) return 'OTHER';
  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
  const meta = 'meta' in error ? error.meta : undefined;
  const sqlState = typeof meta === 'object' && meta !== null && 'code' in meta && typeof meta.code === 'string' ? meta.code : '';

  if (
    code === 'P2034' ||
    (code === 'P2010' && ['40001', '40P01'].includes(sqlState)) ||
    // Retain the incumbent compatibility fallback for older driver errors.
    message.includes('serialization') || message.includes('deadlock') || message.includes('write conflict')
  ) return 'RETRYABLE';
  if (code === 'P2002' || message.includes('unique constraint')) return 'CONFLICT';
  return 'OTHER';
}
