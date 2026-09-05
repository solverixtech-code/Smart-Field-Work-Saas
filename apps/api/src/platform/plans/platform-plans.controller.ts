import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../../common/guards/request-principal.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../../common/security/request-principal.interface';
import { PlatformPlansService } from './platform-plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanMetadataDto, UpdatePlanDraftDto, PublishPlanDto } from './dto/update-plan.dto';
import { PlanStatus } from '@prisma/client';

@Controller('platform/plans')
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class PlatformPlansController {
  constructor(private readonly plansService: PlatformPlansService) {}

  @Get()
  @RequirePermissions('platform.plans.view')
  async getAllPlans(
    @Query('status') status?: PlanStatus,
    @Query('visibility') visibility?: string,
    @Query('search') search?: string,
  ) {
    return this.plansService.getAllPlans(status, visibility, search);
  }

  @Get(':planId')
  @RequirePermissions('platform.plans.view')
  async getPlanById(@Param('planId') planId: string) {
    return this.plansService.getPlanById(planId);
  }

  @Post()
  @RequirePermissions('platform.plans.create')
  @HttpCode(HttpStatus.CREATED)
  async createPlan(
    @Body() dto: CreatePlanDto,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.createPlan(dto, principal.userId);
  }

  @Patch(':planId')
  @RequirePermissions('platform.plans.update')
  async updatePlanMetadata(
    @Param('planId') planId: string,
    @Body() dto: UpdatePlanMetadataDto,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.updatePlanMetadata(planId, dto, principal.userId);
  }

  @Get(':planId/versions')
  @RequirePermissions('platform.plans.view')
  async getVersionHistory(@Param('planId') planId: string) {
    return this.plansService.getVersionHistory(planId);
  }

  @Post(':planId/versions/draft')
  @RequirePermissions('platform.plans.update')
  @HttpCode(HttpStatus.CREATED)
  async createNextDraft(
    @Param('planId') planId: string,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.createNextDraft(planId, principal.userId);
  }

  @Patch(':planId/versions/:versionId')
  @RequirePermissions('platform.plans.update')
  async updateDraft(
    @Param('planId') planId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdatePlanDraftDto,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.updateDraft(planId, versionId, dto, principal.userId);
  }

  @Post(':planId/versions/:versionId/publish')
  @RequirePermissions('platform.plans.publish')
  @HttpCode(HttpStatus.OK)
  async publishPlanVersion(
    @Param('planId') planId: string,
    @Param('versionId') versionId: string,
    @Body() publishDto: PublishPlanDto,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.publishPlanVersion(planId, versionId, publishDto, principal.userId);
  }

  @Post(':planId/archive')
  @RequirePermissions('platform.plans.archive')
  @HttpCode(HttpStatus.OK)
  async archivePlan(
    @Param('planId') planId: string,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.plansService.archivePlan(planId, principal.userId);
  }
}
