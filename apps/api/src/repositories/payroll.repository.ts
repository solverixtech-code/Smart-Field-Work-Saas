import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { TenantScope } from '../common/tenancy/tenant-scope';
import {
  SalaryStructure,
  PayrollPeriod,
  Payslip,
  PayrollStatus,
  PaymentStatus,
  TenantMembershipStatus,
} from '@prisma/client';

export interface SalaryStructureInputDto {
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
export class PayrollRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSalaryStructure(
    scope: TenantScope,
    targetMembershipId: string,
    dto: SalaryStructureInputDto,
  ): Promise<SalaryStructure> {
    // 1. Verify target membership belongs to current Tenant and is ACTIVE
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        id: targetMembershipId,
        tenantId: scope.tenantId,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new BadRequestException(
        `Target membership ${targetMembershipId} not found or inactive in current tenant.`,
      );
    }

    const hra = dto.hra ?? 0;
    const conveyance = dto.conveyance ?? 0;
    const allowances = dto.allowances ?? 0;
    const pfDeduction = dto.pfDeduction ?? 0;
    const esiDeduction = dto.esiDeduction ?? 0;
    const tds = dto.tds ?? 0;
    const netSalary =
      dto.baseSalary + hra + conveyance + allowances - pfDeduction - esiDeduction - tds;

    const existing = await this.prisma.salaryStructure.findFirst({
      where: {
        tenantId: scope.tenantId,
        tenantMembershipId: membership.id,
      },
    });

    if (existing) {
      return this.prisma.salaryStructure.update({
        where: { id: existing.id },
        data: {
          baseSalary: dto.baseSalary,
          hra,
          conveyance,
          allowances,
          pfDeduction,
          esiDeduction,
          tds,
          netSalary,
          currency: dto.currency ?? 'INR',
        },
      });
    }

    return this.prisma.salaryStructure.create({
      data: {
        tenant: { connect: { id: scope.tenantId } },
        tenantMembership: { connect: { id: membership.id } },
        user: { connect: { id: membership.userId } },
        baseSalary: dto.baseSalary,
        hra,
        conveyance,
        allowances,
        pfDeduction,
        esiDeduction,
        tds,
        netSalary,
        currency: dto.currency ?? 'INR',
      },
    });
  }

  async getSalaryStructure(
    scope: TenantScope,
    targetMembershipIdOrUserId: string,
  ): Promise<SalaryStructure> {
    const structure = await this.prisma.salaryStructure.findFirst({
      where: {
        tenantId: scope.tenantId,
        OR: [
          { tenantMembershipId: targetMembershipIdOrUserId },
          { userId: targetMembershipIdOrUserId },
        ],
      },
    });

    if (!structure) {
      throw new NotFoundException(
        `Salary structure for ${targetMembershipIdOrUserId} not found in current tenant.`,
      );
    }

    return structure;
  }

  async generateMonthlyPayroll(
    scope: TenantScope,
    month: number,
    year: number,
  ): Promise<{ period: PayrollPeriod; payslipsCount: number }> {
    if (isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Month must be an integer between 1 and 12');
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be a valid four-digit year');
    }

    // 1. Get or create PayrollPeriod for current tenant
    let period = await this.prisma.payrollPeriod.findFirst({
      where: {
        tenantId: scope.tenantId,
        month,
        year,
      },
    });

    if (!period) {
      period = await this.prisma.payrollPeriod.create({
        data: {
          tenant: { connect: { id: scope.tenantId } },
          month,
          year,
          status: PayrollStatus.DRAFT,
        },
      });
    }

    // 2. Fetch salary structures for current tenant only
    const structures = await this.prisma.salaryStructure.findMany({
      where: { tenantId: scope.tenantId },
      include: { tenantMembership: true },
    });

    let payslipsCount = 0;

    for (const struct of structures) {
      if (!struct.tenantMembershipId) continue;

      const existingPayslip = await this.prisma.payslip.findFirst({
        where: {
          tenantId: scope.tenantId,
          tenantMembershipId: struct.tenantMembershipId,
          payrollPeriodId: period.id,
        },
      });

      if (!existingPayslip) {
        await this.prisma.payslip.create({
          data: {
            tenant: { connect: { id: scope.tenantId } },
            tenantMembership: { connect: { id: struct.tenantMembershipId } },
            user: { connect: { id: struct.userId } },
            payrollPeriod: { connect: { id: period.id } },
            baseSalary: struct.baseSalary,
            totalAllowances: struct.hra + struct.conveyance + struct.allowances,
            totalDeductions: struct.pfDeduction + struct.esiDeduction + struct.tds,
            netPay: struct.netSalary,
            paymentStatus: PaymentStatus.PENDING,
          },
        });
        payslipsCount++;
      }
    }

    const updatedPeriod = await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: {
        status: PayrollStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return { period: updatedPeriod, payslipsCount };
  }

  async getPayslips(scope: TenantScope): Promise<Payslip[]> {
    return this.prisma.payslip.findMany({
      where: { tenantId: scope.tenantId },
      include: {
        payrollPeriod: true,
        user: true,
        tenantMembership: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payPayslip(
    scope: TenantScope,
    payslipId: string,
    transactionRef?: string,
  ): Promise<Payslip> {
    const payslip = await this.prisma.payslip.findFirst({
      where: {
        id: payslipId,
        tenantId: scope.tenantId,
      },
    });

    if (!payslip) {
      throw new NotFoundException(`Payslip ${payslipId} not found in current tenant.`);
    }

    return this.prisma.payslip.update({
      where: { id: payslipId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentDate: new Date(),
        transactionRef: transactionRef ?? `TXN-${Date.now()}`,
      },
    });
  }
}
