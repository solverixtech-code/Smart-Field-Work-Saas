import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlatformModulesService } from './platform-modules.service';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CreatePlatformModuleDto } from './dto/create-platform-module.dto';
import { UpdatePlatformModuleDto } from './dto/update-platform-module.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { UpdateModuleDependenciesDto } from './dto/update-module-dependencies.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ModuleFeatureStatus } from '@prisma/client';

@Controller('platform/modules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlatformModulesController {
  constructor(private readonly modulesService: PlatformModulesService) {}

  @Get()
  @RequirePermissions('platform.modules.view')
  async findAll(@Query() query: ModuleQueryDto) {
    return this.modulesService.findAll(query);
  }

  @Get('summary')
  @RequirePermissions('platform.modules.view')
  async summary() {
    return this.modulesService.summary();
  }

  @Get('dependency-graph')
  @RequirePermissions('platform.modules.view')
  async dependencyGraph() {
    return this.modulesService.dependencyGraph();
  }

  @Get('features')
  @RequirePermissions('platform.modules.view')
  async findFeatures(@Query() query: { search?: string; moduleCode?: string; moduleId?: string; status?: ModuleFeatureStatus; platform?: 'web' | 'mobile' | 'api' | 'offline'; page?: number; limit?: number }) {
    return this.modulesService.findFeatures(query);
  }

  @Get('features/:featureId')
  @RequirePermissions('platform.modules.view')
  async findFeature(@Param('featureId') featureId: string) {
    return this.modulesService.findFeature(featureId);
  }

  @Patch('features/:featureId')
  @RequirePermissions('platform.modules.update')
  async updateFeature(@Param('featureId') featureId: string, @Body() dto: UpdateModuleFeatureDto, @Req() req: any) {
    return this.modulesService.updateFeature(featureId, dto, req.user?.id || req.user?.sub, { ip: req.ip, userAgent: req.headers?.['user-agent'] });
  }

  @Get(':id')
  @RequirePermissions('platform.modules.view')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Get(':id/history')
  @RequirePermissions('platform.modules.view')
  async history(@Param('id') id: string) {
    return this.modulesService.history(id);
  }

  @Post()
  @RequirePermissions('platform.modules.create')
  async create(@Body() dto: CreatePlatformModuleDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.create(dto, userId, meta, req.user?.role);
  }

  @Patch(':id')
  @RequirePermissions('platform.modules.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformModuleDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.update(id, dto, userId, meta, req.user?.role);
  }

  @Post(':id/archive')
  @RequirePermissions('platform.modules.archive')
  async archive(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.archive(id, userId, meta);
  }

  @Post(':id/restore')
  @RequirePermissions('platform.modules.update')
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.restore(id, userId, meta);
  }

  @Put(':id/dependencies')
  @RequirePermissions('platform.modules.update')
  async updateDependencies(
    @Param('id') moduleId: string,
    @Body() dto: UpdateModuleDependenciesDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.updateDependencies(
      moduleId,
      dto,
      userId,
      meta,
    );
  }
}
