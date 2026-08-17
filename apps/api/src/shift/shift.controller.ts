import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ShiftService, CreateShiftDto, AssignShiftDto } from './shift.service';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  async getAllShifts() {
    return this.shiftService.findAll();
  }

  @Get(':id')
  async getShiftById(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Post()
  async createShift(@Body() dto: CreateShiftDto) {
    return this.shiftService.create(dto);
  }

  @Put(':id')
  async updateShift(@Param('id') id: string, @Body() dto: Partial<CreateShiftDto>) {
    return this.shiftService.update(id, dto);
  }

  @Post('assign')
  async assignShift(@Body() dto: AssignShiftDto) {
    return this.shiftService.assignShift(dto);
  }
}
