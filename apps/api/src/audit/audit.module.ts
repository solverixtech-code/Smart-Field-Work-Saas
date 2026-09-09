import {
  Controller,
  Get,
  Module,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RequestPrincipalGuard } from "../common/guards/request-principal.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { AuditQueryService } from "./audit-query.service";

@Controller("platform/audit")
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
@RequirePermissions("platform.audit.view")
class AuditController {
  constructor(private readonly audit: AuditQueryService) {}
  @Get() list(@Query() query: unknown) {
    return this.audit.list(query);
  }
  @Get(":id") detail(@Param("id") id: string) {
    return this.audit.detail(id);
  }
}
@Module({ controllers: [AuditController], providers: [AuditQueryService] })
export class AuditModule {}
