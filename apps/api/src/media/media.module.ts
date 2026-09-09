import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Module,
  Param,
  Post,
} from "@nestjs/common";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { JobCoreModule } from "../jobs/job-core.module";
import { MediaService } from "./media.service";

@Controller("tenant/media/assets")
@TenantAuthorized()
class MediaController {
  constructor(private readonly media: MediaService) {}
  @Post("upload-intent")
  @RequirePermissions("system.media.manage")
  @Header("Cache-Control", "no-store")
  intent(@CurrentPrincipal() actor: RequestPrincipal, @Body() body: unknown) {
    return this.media.intent(actor, body);
  }
  @Post(":id/complete")
  @RequirePermissions("system.media.manage")
  complete(
    @CurrentPrincipal() actor: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.media.complete(actor, id, body);
  }
  @Get(":id/download-url")
  @RequirePermissions("system.media.view")
  @Header("Cache-Control", "no-store")
  download(
    @CurrentPrincipal() actor: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.media.download(actor, id);
  }
  @Delete(":id")
  @RequirePermissions("system.media.manage")
  remove(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string) {
    return this.media.remove(actor, id);
  }
}
@Module({
  imports: [JobCoreModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
