import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PayrollService, CreateSalaryStructureDto } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('salary-structure')
  async createSalaryStructure(@Body() dto: CreateSalaryStructureDto) {
    return this.payrollService.createSalaryStructure(dto);
  }

  @Get('salary-structure/:userId')
  async getSalaryStructure(@Param('userId') userId: string) {
    return this.payrollService.getSalaryStructure(userId);
  }

  @Post('generate')
  async generateMonthlyPayroll(
    @Body('month') month: number,
    @Body('year') year: number,
  ) {
    return this.payrollService.generateMonthlyPayroll(month, year);
  }

  @Get('payslips')
  async getPayslips(
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.payrollService.getPayslips(month, year);
  }

  @Post('payslips/:id/pay')
  async markPayslipPaid(
    @Param('id') id: string,
    @Body('transactionRef') transactionRef?: string,
  ) {
    return this.payrollService.markPayslipPaid(id, transactionRef);
  }
}
