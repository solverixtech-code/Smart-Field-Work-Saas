import { Controller, Get, Headers, Query, Res } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { z } from "zod";
import { TenantAuthenticated } from "../common/decorators/tenant-authenticated.decorator";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { RuntimeConfigService } from "./runtime-config.service";
import { RUNTIME_OPENAPI_SCHEMA } from "./runtime-openapi";

@ApiTags("Tenant runtime")
@ApiBearerAuth("JWT-auth")
@TenantAuthenticated()
@Controller("tenant/runtime")
export class RuntimeController {
  constructor(private readonly runtime: RuntimeConfigService) {}

  @Get("bootstrap")
  @ApiOperation({
    summary: "Resolve selected-membership runtime configuration",
    description:
      "Server-issued schema v1. Exact Subscription/PlanVersion and Industry pins, concrete settings, Tenant permissions and a bounded Master manifest. No Tenant selector. BLOCKED subscriptions return 403. Conditional requests revalidate DB authority and commercial time boundaries before 304. Industry scalar settings are empty; full Master values remain on /tenant/masters.",
  })
  @ApiResponse({ status: 200, schema: RUNTIME_OPENAPI_SCHEMA })
  @ApiResponse({
    status: 304,
    description: "Current authoritative configVersion matches If-None-Match",
  })
  @ApiResponse({ status: 400, description: "Unsupported query input" })
  @ApiResponse({
    status: 401,
    description: "Unauthenticated, revoked session or changed session context",
  })
  @ApiResponse({
    status: 403,
    description: "No active selected membership or blocked commercial access",
  })
  @ApiResponse({
    status: 503,
    description:
      "RUNTIME_CONFIG_UNSTABLE, RUNTIME_CONFIG_SOURCE_INVALID or RUNTIME_CONFIG_LIMIT_EXCEEDED",
  })
  async bootstrap(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query() query: unknown,
    @Headers("if-none-match") ifNoneMatch: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    z.object({}).strict().parse(query);
    const result = await this.runtime.bootstrap(principal);
    const etag = `"${result.configVersion}"`;
    response.setHeader("Cache-Control", "private, no-cache, max-age=0");
    response.setHeader("Vary", "Authorization, Cookie");
    // generatedAt varies; this validator promises semantic, not byte identity.
    response.setHeader("ETag", `W/${etag}`);
    if (
      ifNoneMatch
        ?.split(",")
        .some((value) => value.trim().replace(/^W\//, "") === etag)
    ) {
      response.status(304);
      return;
    }
    return result;
  }
}
