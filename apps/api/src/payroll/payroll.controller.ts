import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CreateSalaryStructureSwaggerDto,
  GeneratePayrollSwaggerDto,
  MarkPayslipPaidSwaggerDto,
} from './dto/payroll.dto';

@ApiTags('Payroll & Incentives')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('salary-structure')
  @ApiOperation({
    summary: 'Configure Employee Salary Structure',
    description: 'Set or update base salary, HRA, TA/DA allowances, PF & tax deductions for an employee.',
  })
  @ApiBody({ type: CreateSalaryStructureSwaggerDto })
  @ApiResponse({ status: 201, description: 'Salary structure upserted successfully' })
  async createSalaryStructure(@Body() dto: CreateSalaryStructureSwaggerDto) {
    return this.payrollService.createSalaryStructure(dto);
  }

  @Get('salary-structure/:userId')
  @ApiOperation({
    summary: 'Get Employee Salary Structure',
    description: 'Fetch salary structure and gross/net pay breakdown for employee by user ID.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Salary structure returned' })
  async getSalaryStructure(@Param('userId') userId: string) {
    return this.payrollService.getSalaryStructure(userId);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Generate Monthly Payroll Run',
    description: 'Process attendance logs, calculate absence deductions & generate employee payslips for a given month and year.',
  })
  @ApiBody({ type: GeneratePayrollSwaggerDto })
  @ApiResponse({ status: 201, description: 'Monthly payroll run generated' })
  async generateMonthlyPayroll(
    @Body() dto: GeneratePayrollSwaggerDto,
  ) {
    return this.payrollService.generateMonthlyPayroll(dto.month, dto.year);
  }

  @Get('payslips')
  @ApiOperation({
    summary: 'List Employee Payslips',
    description: 'Fetch generated payslips for a specific month and year.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Month number (1-12)', example: 9 })
  @ApiQuery({ name: 'year', required: false, description: 'Year', example: 2026 })
  @ApiResponse({ status: 200, description: 'Payslips list returned' })
  async getPayslips(
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.payrollService.getPayslips(month, year);
  }

  @Post('payslips/:id/pay')
  @ApiOperation({
    summary: 'Mark Payslip as Paid',
    description: 'Update payslip status to PAID with transaction reference number.',
  })
  @ApiParam({ name: 'id', description: 'Payslip UUID' })
  @ApiBody({ type: MarkPayslipPaidSwaggerDto })
  @ApiResponse({ status: 200, description: 'Payslip marked as paid' })
  async markPayslipPaid(
    @Param('id') id: string,
    @Body() dto: MarkPayslipPaidSwaggerDto,
  ) {
    return this.payrollService.markPayslipPaid(id, dto.transactionRef);
  }
}
