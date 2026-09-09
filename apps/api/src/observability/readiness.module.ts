import {
  Controller,
  Get,
  Module,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../persistence/prisma.service";
import { JobCoreModule } from "../jobs/job-core.module";
import { StorageProvider } from "../media/storage-provider";

@Controller("health")
class ReadinessController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
  ) {}
  @Get("ready") async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const media = await this.storage.readiness();
      return { status: "ready", database: "ready", media };
    } catch {
      throw new ServiceUnavailableException("READINESS_FAILED");
    }
  }
}
@Module({ imports: [JobCoreModule], controllers: [ReadinessController] })
export class ReadinessModule {}
