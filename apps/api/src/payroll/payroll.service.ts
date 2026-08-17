import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { PaymentStatus, PayrollStatus, AttendanceStatus } from '@prisma/client';

export interface CreateSalaryStructureDto {
  userId: string;
  baseSalary: number;
  hra?: number;
  conveyance?: number;
  allowances?: number;
  pfDeduction?: number;
  esiDeduction?: number;
  tds?: number;
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async createSalaryStructure(dto: CreateSalaryStructureDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    const hra = dto.hra ?? dto.baseSalary * 0.4;
    const conveyance = dto.conveyance ?? 2000;
    const allowances = dto.allowances ?? 5000;
    const pfDeduction = dto.pfDeduction ?? dto.baseSalary * 0.12;
    const esiDeduction = dto.esiDeduction ?? 0;
    const tds = dto.tds ?? 0;

    const gross = dto.baseSalary + hra + conveyance + allowances;
    const deductions = pfDeduction + esiDeduction + tds;
    const netSalary = Math.max(0, gross - deductions);

    return this.prisma.salaryStructure.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        baseSalary: dto.baseSalary,
        hra,
        conveyance,
        allowances,
        pfDeduction,
        esiDeduction,
        tds,
        netSalary,
      },
      update: {
        baseSalary: dto.baseSalary,
        hra,
        conveyance,
        allowances,
        pfDeduction,
        esiDeduction,
        tds,
        netSalary,
      },
    });
  }

  async getSalaryStructure(userId: string) {
    return this.prisma.salaryStructure.findUnique({ where: { userId } });
  }

  async generateMonthlyPayroll(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const totalDaysInMonth = endDate.getDate();

    let period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });

    if (!period) {
      period = await this.prisma.payrollPeriod.create({
        data: {
          month,
          year,
          status: PayrollStatus.PROCESSED,
          processedAt: new Date(),
        },
      });
    }

    const usersWithSalary = await this.prisma.salaryStructure.findMany({
      include: {
        user: { select: { id: true, fullName: true, employeeCode: true } },
      },
    });

    const payslips: any[] = [];

    for (const struct of usersWithSalary) {
      const attendances = await this.prisma.attendance.findMany({
        where: {
          userId: struct.userId,
          date: { gte: startDate, lte: endDate },
        },
      });

      const presentCount = attendances.filter(
        (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE,
      ).length;

      const lateCount = attendances.filter((a) => a.status === AttendanceStatus.LATE).length;
      const absentCount = attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
      const totalWorkMins = attendances.reduce((acc, a) => acc + a.totalWorkMinutes, 0);
      const totalOvertimeMins = attendances.reduce((acc, a) => acc + a.overtimeMinutes, 0);

      const perDaySalary = struct.baseSalary / totalDaysInMonth;
      const absenceDeduction = absentCount * perDaySalary;
      const totalDeductions = struct.pfDeduction + struct.esiDeduction + struct.tds + absenceDeduction;
      const totalAllowances = struct.hra + struct.conveyance + struct.allowances;
      const netPay = Math.max(0, struct.baseSalary + totalAllowances - totalDeductions);

      const payslip = await this.prisma.payslip.upsert({
        where: {
          userId_payrollPeriodId: {
            userId: struct.userId,
            payrollPeriodId: period.id,
          },
        },
        create: {
          userId: struct.userId,
          payrollPeriodId: period.id,
          baseSalary: struct.baseSalary,
          totalAllowances,
          totalDeductions,
          netPay,
          presentDays: presentCount,
          absentDays: absentCount,
          lateDays: lateCount,
          overtimeHours: parseFloat((totalOvertimeMins / 60).toFixed(1)),
          paymentStatus: PaymentStatus.PENDING,
        },
        update: {
          baseSalary: struct.baseSalary,
          totalAllowances,
          totalDeductions,
          netPay,
          presentDays: presentCount,
          absentDays: absentCount,
          lateDays: lateCount,
          overtimeHours: parseFloat((totalOvertimeMins / 60).toFixed(1)),
        },
      });

      payslips.push(payslip);
    }

    return {
      period,
      count: payslips.length,
      payslips,
    };
  }

  async getPayslips(month: number, year: number) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });

    if (!period) return [];

    return this.prisma.payslip.findMany({
      where: { payrollPeriodId: period.id },
      include: {
        user: { select: { id: true, fullName: true, employeeCode: true, email: true } },
      },
    });
  }

  async markPayslipPaid(payslipId: string, transactionRef?: string) {
    const payslip = await this.prisma.payslip.findUnique({ where: { id: payslipId } });
    if (!payslip) throw new NotFoundException(`Payslip ${payslipId} not found`);

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
