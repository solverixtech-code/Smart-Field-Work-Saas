import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateShiftSwaggerDto, AssignShiftSwaggerDto } from './dto/shift.dto';

@ApiTags('Shift Management')
@ApiBearerAuth('JWT-auth')
@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  @ApiOperation({
    summary: 'List All Shifts',
    description: 'Fetch list of configured shifts with assigned user counts.',
  })
  @ApiResponse({ status: 200, description: 'Shifts array returned' })
  async getAllShifts() {
    return this.shiftService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Shift Details',
    description: 'Fetch shift details and assigned employees by shift ID.',
  })
  @ApiParam({ name: 'id', description: 'Shift UUID' })
  @ApiResponse({ status: 200, description: 'Shift details returned' })
  async getShiftById(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create New Shift',
    description: 'Configure a new shift timing, grace period, and break duration.',
  })
  @ApiBody({ type: CreateShiftSwaggerDto })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  async createShift(@Body() dto: CreateShiftSwaggerDto) {
    return this.shiftService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Shift',
    description: 'Update shift timing rules by shift ID.',
  })
  @ApiParam({ name: 'id', description: 'Shift UUID' })
  @ApiBody({ type: CreateShiftSwaggerDto })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  async updateShift(@Param('id') id: string, @Body() dto: Partial<CreateShiftSwaggerDto>) {
    return this.shiftService.update(id, dto);
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Assign Shift to Employee',
    description: 'Map a shift to an employee with start date and optional end date.',
  })
  @ApiBody({ type: AssignShiftSwaggerDto })
  @ApiResponse({ status: 201, description: 'Shift assigned successfully' })
  async assignShift(@Body() dto: AssignShiftSwaggerDto) {
    return this.shiftService.assignShift(dto);
  }
}
