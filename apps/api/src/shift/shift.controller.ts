import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { TenantScopeFactory } from '../common/tenancy/tenant-scope';
import { CreateShiftSwaggerDto, UpdateShiftSwaggerDto, AssignShiftSwaggerDto } from './dto/shift.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Shift Management')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('shifts')
@TenantAuthorized()
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  @RequirePermissions('workforce.shifts.view')
  @ApiOperation({
    summary: 'List All Shifts',
    description: 'Fetch list of configured shifts for the current tenant.',
  })
  @ApiResponse({ status: 200, description: 'Shifts array returned' })
  async getAllShifts(@CurrentPrincipal() principal: RequestPrincipal) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.shiftService.findAll(scope);
  }

  @Get(':id')
  @RequirePermissions('workforce.shifts.view')
  @ApiOperation({
    summary: 'Get Shift Details',
    description: 'Fetch shift details and assigned employees by shift ID in current tenant.',
  })
  @ApiParam({ name: 'id', description: 'Shift UUID' })
  @ApiResponse({ status: 200, description: 'Shift details returned' })
  async getShiftById(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.shiftService.findOne(scope, id);
  }

  @Post()
  @RequirePermissions('workforce.shifts.create')
  @ApiOperation({
    summary: 'Create New Shift',
    description: 'Configure a new shift timing for current tenant.',
  })
  @ApiBody({ type: CreateShiftSwaggerDto })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  async createShift(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: CreateShiftSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.shiftService.create(scope, dto);
  }

  @Put(':id')
  @RequirePermissions('workforce.shifts.update')
  @ApiOperation({
    summary: 'Update Shift',
    description: 'Update shift timing rules by shift ID in current tenant.',
  })
  @ApiParam({ name: 'id', description: 'Shift UUID' })
  @ApiBody({ type: UpdateShiftSwaggerDto })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  async updateShift(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateShiftSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.shiftService.update(scope, id, dto);
  }

  @Post('assign')
  @RequirePermissions('workforce.shifts.assign')
  @ApiOperation({
    summary: 'Assign Shift to Employee',
    description: 'Map a shift to an employee within current tenant.',
  })
  @ApiBody({ type: AssignShiftSwaggerDto })
  @ApiResponse({ status: 201, description: 'Shift assigned successfully' })
  async assignShift(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: AssignShiftSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.shiftService.assignShift(scope, dto);
  }
}
