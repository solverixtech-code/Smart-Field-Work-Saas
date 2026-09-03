import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
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
import { CreateModuleFeatureDto } from './dto/create-module-feature.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { UpdateModuleDependenciesDto } from './dto/update-module-dependencies.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('platform/modules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlatformModulesController {
  constructor(private readonly modulesService: PlatformModulesService) {}

  @Get()
  @RequirePermissions('platform.modules.view')
  async findAll(@Query() query: ModuleQueryDto) {
    return this.modulesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('platform.modules.view')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Post()
  @RequirePermissions('platform.modules.create')
  async create(@Body() dto: CreatePlatformModuleDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.create(dto, userId, meta);
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
    return this.modulesService.update(id, dto, userId, meta);
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

  @Post(':id/features')
  @RequirePermissions('platform.modules.update')
  async createFeature(
    @Param('id') moduleId: string,
    @Body() dto: CreateModuleFeatureDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.createFeature(moduleId, dto, userId, meta);
  }

  @Patch(':id/features/:featureId')
  @RequirePermissions('platform.modules.update')
  async updateFeature(
    @Param('id') moduleId: string,
    @Param('featureId') featureId: string,
    @Body() dto: UpdateModuleFeatureDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.updateFeature(
      moduleId,
      featureId,
      dto,
      userId,
      meta,
    );
  }

  @Delete(':id/features/:featureId')
  @RequirePermissions('platform.modules.update')
  async deleteFeature(
    @Param('id') moduleId: string,
    @Param('featureId') featureId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.deleteFeature(moduleId, featureId, userId, meta);
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
