import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { runWorkerLoop } from './jobs/worker-loop';
import { JobCoreModule } from "./jobs/job-core.module";
import { JobWorkerService } from "./jobs/job-worker.service";
import { StructuredLogger } from "./observability/structured-logger.service";
import { SafeNestLogger } from "./observability/safe-nest-logger";

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), JobCoreModule] })
class WorkerModule {}

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: new SafeNestLogger(),
  });
  const worker = app.get(JobWorkerService);
  const logger = app.get(StructuredLogger);
  const shutdown = new AbortController();
  let shutdownTimer: NodeJS.Timeout | undefined;
  const stop = () => {
    if (shutdown.signal.aborted) return;
    shutdown.abort();
    // Last-resort process bound; unacknowledged work is recovered by its DB lease.
    shutdownTimer = setTimeout(() => process.exit(1), 30000);
    shutdownTimer.unref();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    await runWorkerLoop(worker, logger, shutdown.signal);
  } finally {
    await app.close();
    if (shutdownTimer) clearTimeout(shutdownTimer);
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
  }
}
if (require.main === module)
  void main().catch(() => {
    process.stderr.write("Worker startup failed\n");
    process.exitCode = 1;
  });
