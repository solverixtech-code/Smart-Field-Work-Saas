import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlatformModulesService } from './platform-modules.service';
import { ModuleQueryDto } from './dto/module-query.dto';
import { UpdatePlatformModuleDto } from './dto/update-platform-module.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ModuleFeatureStatus } from '@prisma/client';

@ApiTags('Platform Capability Catalog')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('platform/modules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlatformModulesController {
  constructor(private readonly modulesService: PlatformModulesService) {}

  @Get()
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'List Platform Modules',
    description: 'Fetch paginated list of predefined platform capability modules with optional search and category filters.',
  })
  @ApiResponse({ status: 200, description: 'Modules list and pagination metadata returned' })
  async findAll(@Query() query: ModuleQueryDto) {
    return this.modulesService.findAll(query);
  }

  @Get('summary')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'Get Platform Catalog Summary & Health',
    description: 'Returns total modules count, active count, registered features count, and sync health status.',
  })
  @ApiResponse({ status: 200, description: 'Catalog health and total counts returned' })
  async summary() {
    return this.modulesService.summary();
  }

  @Get('dependency-graph')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'Get Global Module Dependency Graph',
    description: 'Fetch predefined modules and their prerequisite dependency nodes.',
  })
  @ApiResponse({ status: 200, description: 'Dependency graph tree returned' })
  async dependencyGraph() {
    return this.modulesService.dependencyGraph();
  }

  @Get('features')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'List Registered Code-Backed Features',
    description: 'Fetch global feature registry across all platform modules.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for feature name or code' })
  @ApiQuery({ name: 'moduleCode', required: false, description: 'Filter features by parent module code' })
  @ApiQuery({ name: 'status', required: false, enum: ModuleFeatureStatus, description: 'Filter features by status' })
  @ApiResponse({ status: 200, description: 'Feature registry list returned' })
  async findFeatures(@Query() query: { search?: string; moduleCode?: string; moduleId?: string; status?: ModuleFeatureStatus; platform?: 'web' | 'mobile' | 'api' | 'offline'; page?: number; limit?: number }) {
    return this.modulesService.findFeatures(query);
  }

  @Get('features/:featureId')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'Get Feature Details',
    description: 'Fetch single code-backed feature details by feature ID.',
  })
  @ApiParam({ name: 'featureId', description: 'Unique feature UUID' })
  @ApiResponse({ status: 200, description: 'Feature details returned' })
  async findFeature(@Param('featureId') featureId: string) {
    return this.modulesService.findFeature(featureId);
  }

  @Patch('features/:featureId')
  @RequirePermissions('platform.modules.update')
  @ApiOperation({
    summary: 'Edit Feature Metadata',
    description: 'Update presentation display name, description, status, or display order for a registered feature.',
  })
  @ApiParam({ name: 'featureId', description: 'Unique feature UUID' })
  @ApiBody({ type: UpdateModuleFeatureDto })
  @ApiResponse({ status: 200, description: 'Feature metadata updated' })
  async updateFeature(@Param('featureId') featureId: string, @Body() dto: UpdateModuleFeatureDto, @Req() req: any) {
    return this.modulesService.updateFeature(featureId, dto, req.user?.id || req.user?.sub, { ip: req.ip, userAgent: req.headers?.['user-agent'] });
  }

  @Get(':id')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'Get Module Details',
    description: 'Fetch detailed module information by ID or stable code.',
  })
  @ApiParam({ name: 'id', description: 'Module UUID or code (e.g. core_crm)' })
  @ApiResponse({ status: 200, description: 'Module details returned' })
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Get(':id/history')
  @RequirePermissions('platform.modules.view')
  @ApiOperation({
    summary: 'Get Module Audit History',
    description: 'Fetch chronological record of changes made to this module.',
  })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Audit log history array returned' })
  async history(@Param('id') id: string) {
    return this.modulesService.history(id);
  }

  @Patch(':id')
  @RequirePermissions('platform.modules.update')
  @ApiOperation({
    summary: 'Edit Module Metadata',
    description: 'Update presentation title, description, status, display order, or notes for a module.',
  })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiBody({ type: UpdatePlatformModuleDto })
  @ApiResponse({ status: 200, description: 'Module metadata updated successfully' })
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
  @ApiOperation({
    summary: 'Archive Module',
    description: 'Archive a platform module if it is not system-required.',
  })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module archived successfully' })
  async archive(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.archive(id, userId, meta);
  }

  @Post(':id/restore')
  @RequirePermissions('platform.modules.update')
  @ApiOperation({
    summary: 'Restore Archived Module',
    description: 'Restore an archived platform module back to ACTIVE state.',
  })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module restored successfully' })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const meta = { ip: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.modulesService.restore(id, userId, meta);
  }
}
