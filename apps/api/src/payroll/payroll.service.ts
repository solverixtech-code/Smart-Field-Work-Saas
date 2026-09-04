import { Injectable, BadRequestException } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { TenantScope } from '../common/tenancy/tenant-scope';

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
  constructor(private readonly payrollRepository: PayrollRepository) {}

  async createSalaryStructure(scope: TenantScope, dto: CreateSalaryStructureDto) {
    if (!dto.membershipId) {
      throw new BadRequestException('Target membershipId is required.');
    }

    return this.payrollRepository.upsertSalaryStructure(scope, dto.membershipId, dto);
  }

  async getSalaryStructure(scope: TenantScope, membershipId: string) {
    return this.payrollRepository.getSalaryStructure(scope, membershipId);
  }

  async generateMonthlyPayroll(scope: TenantScope, month: number, year: number) {
    return this.payrollRepository.generateMonthlyPayroll(scope, month, year);
  }

  async getPayslips(scope: TenantScope, month?: number, year?: number) {
    return this.payrollRepository.getPayslips(scope, month, year);
  }

  async markPayslipPaid(scope: TenantScope, payslipId: string, transactionRef?: string) {
    return this.payrollRepository.payPayslip(scope, payslipId, transactionRef);
  }
}
