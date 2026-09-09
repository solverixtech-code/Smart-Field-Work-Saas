import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { ObservabilityModule } from "../observability/observability.module";
import { S3StorageProvider, StorageProvider } from "../media/storage-provider";
import { JobService } from "./job.service";
import { JobWorkerService } from "./job-worker.service";

@Module({
  imports: [PersistenceModule, ObservabilityModule],
  providers: [
    JobService,
    JobWorkerService,
    { provide: StorageProvider, useClass: S3StorageProvider },
  ],
  exports: [JobService, JobWorkerService, StorageProvider],
})
export class JobCoreModule {}
