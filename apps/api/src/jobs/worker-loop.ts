import { setTimeout as delay } from 'node:timers/promises';
import { JobWorkerService } from './job-worker.service';
import { StructuredLogger } from '../observability/structured-logger.service';

/** Stop new claims immediately; let the current bounded handler finish. */
export async function runWorkerLoop(worker: Pick<JobWorkerService, 'tick'>, logger: Pick<StructuredLogger, 'write'>, signal: AbortSignal): Promise<void> {
  while (!signal.aborted) {
    let waitMs = 0;
    try { if (!(await worker.tick())) waitMs = 500; }
    catch { logger.write('worker.poll.failed', { errorCode: 'POLL_FAILED' }, 'error'); waitMs = 1000; }
    if (waitMs && !signal.aborted) {
      try { await delay(waitMs, undefined, { signal }); }
      catch (error) { if (!signal.aborted) throw error; }
    }
  }
}
