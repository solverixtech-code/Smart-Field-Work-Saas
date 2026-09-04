import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { TenantService } from './tenant.service';
import { TenantMembershipService } from './tenant-membership.service';
import { TenantQueryDto } from './dto/tenant-query.dto';
import {
  TenantDetailDto,
  PaginatedTenantResponseDto,
} from './dto/tenant-response.dto';
import { TenantMembershipSummaryDto } from './dto/membership-response.dto';

@ApiTags('Platform Tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('platform/tenants')
export class PlatformTenantsController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantMembershipService: TenantMembershipService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('platform.tenants.view')
  @ApiOperation({
    summary: 'List platform tenants',
    description: 'Retrieves a bounded paginated list of platform tenants with search and status filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of platform tenants.',
  })
  async getTenants(@Query() query: TenantQueryDto): Promise<PaginatedTenantResponseDto> {
    return this.tenantService.getTenants(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('platform.tenants.view')
  @ApiOperation({
    summary: 'Get platform tenant details',
    description: 'Retrieves complete foundation details for a single platform tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant detail object.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  async getTenantById(@Param('id') id: string): Promise<TenantDetailDto> {
    return this.tenantService.getTenantById(id);
  }

  @Get(':id/memberships')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('platform.tenants.view')
  @ApiOperation({
    summary: 'List tenant memberships',
    description: 'Retrieves all membership records associated with a given tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tenant memberships.',
  })
  async getTenantMemberships(
    @Param('id') tenantId: string,
  ): Promise<TenantMembershipSummaryDto[]> {
    return this.tenantMembershipService.getMembershipsByTenantId(tenantId);
  }
}
