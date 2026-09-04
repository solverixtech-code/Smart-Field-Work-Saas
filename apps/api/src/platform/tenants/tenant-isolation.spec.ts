import { RequestPrincipalService } from '../../common/security/request-principal.service';
import { MembershipContextGuard } from '../../common/guards/membership-context.guard';
import { ShiftRepository } from '../../repositories/shift.repository';
import { AttendanceRepository } from '../../repositories/attendance.repository';
import { PayrollRepository } from '../../repositories/payroll.repository';
import { TenantScopeFactory, TenantScope } from '../../common/tenancy/tenant-scope';
import { ExecutionContext, ForbiddenException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Phase 0.3 — Scoped RequestPrincipal & Tenant Isolation Security Suite', () => {
  let mockPrisma: any;
  let principalService: RequestPrincipalService;
  let membershipContextGuard: MembershipContextGuard;
  let shiftRepository: ShiftRepository;
  let attendanceRepository: AttendanceRepository;
  let payrollRepository: PayrollRepository;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      userSession: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      platformUserRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      tenantMembership: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      tenantRolePermission: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      shift: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userShift: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      attendance: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
      },
      punchLog: {
        create: jest.fn(),
      },
      salaryStructure: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
      },
      payrollPeriod: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payslip: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(mockPrisma)),
    };

    principalService = new RequestPrincipalService(mockPrisma);
    membershipContextGuard = new MembershipContextGuard();
    shiftRepository = new ShiftRepository(mockPrisma);
    attendanceRepository = new AttendanceRepository(mockPrisma);
    payrollRepository = new PayrollRepository(mockPrisma);
  });

  describe('RequestPrincipal & Guard Context Isolation', () => {
    it('should reject resolution if contextVersion in JWT payload mismatches session contextVersion', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });
      mockPrisma.userSession.findUnique.mockResolvedValue({
        id: 'sess-1',
        userId: 'user-1',
        status: 'ACTIVE',
        contextVersion: 5,
        selectedMembershipId: 'mem-1',
      });

      const oldPayload = {
        sub: 'user-1',
        sid: 'sess-1',
        mid: 'mem-1',
        ctxv: 4, // Stale token context version!
      };

      await expect(principalService.resolvePrincipal(oldPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject resolution if session is REVOKED', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', status: 'ACTIVE' });
      mockPrisma.userSession.findUnique.mockResolvedValue({
        id: 'sess-1',
        userId: 'user-1',
        status: 'REVOKED',
        contextVersion: 1,
      });

      const payload = { sub: 'user-1', sid: 'sess-1', mid: 'mem-1', ctxv: 1 };

      await expect(principalService.resolvePrincipal(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should block tenant routes via MembershipContextGuard when principal has null tenantId', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            principal: {
              userId: 'user-platform',
              sessionId: 'sess-1',
              tenantId: null,
              membershipId: null,
              isPlatformOnly: true,
            },
          }),
        }),
      } as ExecutionContext;

      expect(() => membershipContextGuard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('Adversarial Cross-Tenant Data Isolation Tests', () => {
    const scopeTenantA: TenantScope = {
      tenantId: 'tenant-A',
      membershipId: 'mem-A1',
      userId: 'user-A1',
    };

    it('ShiftRepository: should return 404 when querying Tenant B shift ID under Tenant A scope', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue(null);

      await expect(shiftRepository.findShiftById(scopeTenantA, 'shift-tenant-B-uuid')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.shift.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'shift-tenant-B-uuid',
          tenantId: 'tenant-A',
        },
      });
    });

    it('ShiftRepository: should reject shift assignment if target membership belongs to Tenant B', async () => {
      mockPrisma.shift.findFirst.mockResolvedValue({ id: 'shift-A1', tenantId: 'tenant-A' });
      mockPrisma.tenantMembership.findFirst.mockResolvedValue(null); // Membership B not found in Tenant A

      await expect(
        shiftRepository.assignShift(scopeTenantA, 'shift-A1', 'mem-tenant-B-uuid', new Date()),
      ).rejects.toThrow(BadRequestException);
    });

    it('AttendanceRepository: should perform self-punch strictly bound to TenantScope actor', async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue({ id: 'att-1', punchInTime: new Date() });
      mockPrisma.punchLog.create.mockResolvedValue({ id: 'punch-1' });

      await attendanceRepository.punchIn(scopeTenantA, {
        latitude: 19.076,
        longitude: 72.8777,
      });

      expect(mockPrisma.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenant: { connect: { id: 'tenant-A' } },
          tenantMembership: { connect: { id: 'mem-A1' } },
          user: { connect: { id: 'user-A1' } },
        }),
      });
    });

    it('PayrollRepository: should reject salary configuration for a membership in Tenant B', async () => {
      mockPrisma.tenantMembership.findFirst.mockResolvedValue(null); // Not found in Tenant A

      await expect(
        payrollRepository.upsertSalaryStructure(scopeTenantA, 'mem-tenant-B-uuid', {
          baseSalary: 50000,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('PayrollRepository: should return 404 when Tenant A attempts to mark Tenant B payslip as paid', async () => {
      mockPrisma.payslip.findFirst.mockResolvedValue(null);

      await expect(
        payrollRepository.payPayslip(scopeTenantA, 'payslip-tenant-B-uuid', 'TXN-123'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.payslip.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'payslip-tenant-B-uuid',
          tenantId: 'tenant-A',
        },
      });
    });
  });
});
