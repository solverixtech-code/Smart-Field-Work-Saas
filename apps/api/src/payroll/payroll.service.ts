import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollRepository, SalaryStructureInputDto } from '../repositories/payroll.repository';
import { TenantScope } from '../common/tenancy/tenant-scope';
import { PrismaService } from '../persistence/prisma.service';
import { TenantMembershipStatus } from '@prisma/client';

export interface CreateSalaryStructureDto {
  membershipId: string;
  baseSalary: number;
  hra?: number;
  conveyance?: number;
  allowances?: number;
  pfDeduction?: number;
  esiDeduction?: number;
  tds?: number;
  currency?: string;
}

@Injectable()
export class PayrollService {
  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createSalaryStructure(scope: TenantScope, dto: CreateSalaryStructureDto) {
    if (!dto.membershipId) {
      throw new BadRequestException('Target membershipId is required.');
    }

    return this.payrollRepository.upsertSalaryStructure(scope, dto.membershipId, dto);
  }

  async getSalaryStructure(scope: TenantScope, targetMembershipIdOrUserId: string) {
    return this.payrollRepository.getSalaryStructure(scope, targetMembershipIdOrUserId);
  }

  async generateMonthlyPayroll(scope: TenantScope, month: number, year: number) {
    return this.payrollRepository.generateMonthlyPayroll(scope, month, year);
  }

  async getPayslips(scope: TenantScope, _month?: number, _year?: number) {
    return this.payrollRepository.getPayslips(scope);
  }

  async markPayslipPaid(scope: TenantScope, payslipId: string, transactionRef?: string) {
    return this.payrollRepository.payPayslip(scope, payslipId, transactionRef);
  }
}
