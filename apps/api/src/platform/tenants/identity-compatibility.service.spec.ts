import { Test, TestingModule } from '@nestjs/testing';
import { IdentityCompatibilityService } from './identity-compatibility.service';
import { User, TenantMembership, Role, DataScope, TenantMembershipStatus } from '@prisma/client';

describe('IdentityCompatibilityService (Phase 0.2 Foundation)', () => {
  let service: IdentityCompatibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentityCompatibilityService],
    }).compile();

    service = module.get<IdentityCompatibilityService>(IdentityCompatibilityService);
  });

  const mockUser: User = {
    id: 'usr-111',
    employeeCode: 'EMP-LEGACY',
    fullName: 'Legacy User',
    email: 'legacy@example.com',
    mobile: null,
    passwordHash: 'hash',
    avatarUrl: null,
    role: Role.SALES_MANAGER,
    dataScope: DataScope.ALL,
    teamId: 'team-99',
    managerId: 'usr-mgr-999',
    defaultTerritoryId: null,
    status: 'ACTIVE',
    preferredLanguage: 'en',
    twoFactorEnabled: false,
    lastLoginAt: null,
    lastPasswordChangeAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should resolve legacy identity context when membership is absent', () => {
    const res = service.resolveIdentityContext(mockUser);

    expect(res.isLegacyFallback).toBe(true);
    expect(res.userId).toBe('usr-111');
    expect(res.tenantId).toBeNull();
    expect(res.membershipId).toBeNull();
    expect(res.roleCode).toBe('SALES_MANAGER');
    expect(res.tenantRoleCode).toBeNull();
    expect(res.legacyManagerUserId).toBe('usr-mgr-999');
    expect(res.managerMembershipId).toBeNull();
  });

  it('should resolve membership identity context with explicit tenantRole code and managerMembershipId', () => {
    const mockMembership: any = {
      id: 'mem-222',
      tenantId: 't-333',
      userId: 'usr-111',
      tenantRoleId: 'tr-role-id-uuid',
      tenantRole: {
        id: 'tr-role-id-uuid',
        code: 'sales_manager',
        name: 'Sales Manager',
      },
      status: TenantMembershipStatus.ACTIVE,
      isPrimary: true,
      employeeCode: 'PH-101',
      designation: 'District Manager',
      department: 'Pharma',
      dataScope: DataScope.ASSIGNED_TEAM,
      teamId: 'team-777',
      managerMembershipId: 'mem-mgr-555',
      invitedByUserId: null,
      invitedAt: null,
      joinedAt: new Date(),
      activatedAt: new Date(),
      deactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = service.resolveIdentityContext(mockUser, mockMembership);

    expect(res.isLegacyFallback).toBe(false);
    expect(res.userId).toBe('usr-111');
    expect(res.tenantId).toBe('t-333');
    expect(res.membershipId).toBe('mem-222');
    expect(res.roleCode).toBe('sales_manager'); // Resolves string code, NOT UUID!
    expect(res.tenantRoleCode).toBe('sales_manager');
    expect(res.employeeCode).toBe('PH-101');
    expect(res.managerMembershipId).toBe('mem-mgr-555');
    expect(res.legacyManagerUserId).toBeNull();
  });
});
