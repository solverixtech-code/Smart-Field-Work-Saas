import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { TenantScopeFactory } from '../common/tenancy/tenant-scope';
import {
  CreateSalaryStructureSwaggerDto,
  GeneratePayrollSwaggerDto,
  MarkPayslipPaidSwaggerDto,
} from './dto/payroll.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Payroll & Incentives')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('payroll')
@TenantAuthorized()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('salary-structure')
  @RequirePermissions('payroll.salary_structure.manage')
  @ApiOperation({
    summary: 'Configure Employee Salary Structure',
    description: 'Set or update base salary, HRA, TA/DA allowances, PF & tax deductions for an employee in current tenant.',
  })
  @ApiBody({ type: CreateSalaryStructureSwaggerDto })
  @ApiResponse({ status: 201, description: 'Salary structure upserted successfully' })
  async createSalaryStructure(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: CreateSalaryStructureSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.payrollService.createSalaryStructure(scope, dto);
  }

  @Get('salary-structure/:membershipId')
  @RequirePermissions('payroll.salary_structure.view')
  @ApiOperation({
    summary: 'Get Employee Salary Structure',
    description: 'Fetch salary structure and gross/net pay breakdown for employee membership in current tenant.',
  })
  @ApiParam({ name: 'membershipId', description: 'TenantMembership UUID' })
  @ApiResponse({ status: 200, description: 'Salary structure returned' })
  async getSalaryStructure(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('membershipId') membershipId: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.payrollService.getSalaryStructure(scope, membershipId);
  }

  @Post('generate')
  @RequirePermissions('payroll.runs.generate')
  @ApiOperation({
    summary: 'Generate Monthly Payroll Run',
    description: 'Process attendance logs, calculate absence deductions & generate employee payslips for current tenant.',
  })
  @ApiBody({ type: GeneratePayrollSwaggerDto })
  @ApiResponse({ status: 201, description: 'Monthly payroll run generated' })
  async generateMonthlyPayroll(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: GeneratePayrollSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.payrollService.generateMonthlyPayroll(scope, dto.month, dto.year);
  }

  @Get('payslips')
  @RequirePermissions('payroll.payslips.view')
  @ApiOperation({
    summary: 'List Employee Payslips',
    description: 'Fetch generated payslips for current tenant.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Month number (1-12)', example: 9 })
  @ApiQuery({ name: 'year', required: false, description: 'Year', example: 2026 })
  @ApiResponse({ status: 200, description: 'Payslips list returned' })
  async getPayslips(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.payrollService.getPayslips(scope, month, year);
  }

  @Post('payslips/:id/pay')
  @RequirePermissions('payroll.payslips.pay')
  @ApiOperation({
    summary: 'Mark Payslip as Paid',
    description: 'Update payslip status to PAID with transaction reference number in current tenant.',
  })
  @ApiParam({ name: 'id', description: 'Payslip UUID' })
  @ApiBody({ type: MarkPayslipPaidSwaggerDto })
  @ApiResponse({ status: 200, description: 'Payslip marked as paid' })
  async markPayslipPaid(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
    @Body() dto: MarkPayslipPaidSwaggerDto,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.payrollService.markPayslipPaid(scope, id, dto.transactionRef);
  }
}
