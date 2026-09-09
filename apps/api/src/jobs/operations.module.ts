import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RequestPrincipalGuard } from "../common/guards/request-principal.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { JobService } from "./job.service";
import { JobQueryService } from "./job-query.service";
import { JobCoreModule } from "./job-core.module";

@Controller("platform/operations/jobs")
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
class JobController {
  constructor(
    private readonly jobs: JobService,
    private readonly query: JobQueryService,
  ) {}
  @Get()
  @RequirePermissions("platform.operations.jobs.view")
  list(@Query() input: unknown) {
    return this.query.list(input);
  }
  @Get(":id")
  @RequirePermissions("platform.operations.jobs.view")
  detail(@Param("id") id: string) {
    return this.query.detail(id);
  }
  @Post(":id/retry")
  @RequirePermissions("platform.operations.jobs.retry")
  retry(
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.jobs.retry(id, body, actor.userId);
  }
}
@Module({
  imports: [JobCoreModule],
  controllers: [JobController],
  providers: [JobQueryService],
})
export class OperationsModule {}
