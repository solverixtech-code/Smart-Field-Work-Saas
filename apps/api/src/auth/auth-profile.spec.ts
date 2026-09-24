import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { PrismaService } from '../persistence/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService dynamic profile', () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const tenantId = randomUUID();
  const membershipId = randomUUID();
  const principal: RequestPrincipal = {
    userId,
    sessionId,
    tenantId,
    membershipId,
    tenantRoleCode: 'field_executive',
    tenantPermissions: ['crm.leads.view', 'crm.followups.view'],
    platformRoleCodes: [],
    platformPermissions: [],
    permissions: ['crm.leads.view', 'crm.followups.view'],
    dataScope: 'SELF_AND_ASSIGNED_LEADS',
    contextVersion: 1,
    permissionVersion: { tenant: '1', platform: null },
    isPlatformOnly: false,
  };

  const user = {
    id: userId,
    employeeCode: 'VIS-FE-001',
    fullName: 'Vikram Singh',
    email: 'vikram@example.com',
    mobile: '+919876543210',
    dateOfBirth: new Date('1992-06-18T00:00:00.000Z'),
    officeAddress: null,
    emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
    role: 'FIELD_EXECUTIVE',
    dataScope: 'ALL',
    team: null,
    defaultTerritoryId: null,
    avatarUrl: 'https://example.test/vikram.jpg',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    joinedAt: new Date('2026-01-01T00:00:00.000Z'),
    lastLoginAt: new Date('2026-09-24T05:00:00.000Z'),
    lastPasswordChangeAt: null,
    twoFactorEnabled: true,
  };
  const membership = {
    employeeCode: 'WEST-042',
    designation: 'Field Executive',
    department: 'Sales',
    dataScope: 'SELF_AND_ASSIGNED_LEADS',
    updatedAt: new Date('2026-09-20T00:00:00.000Z'),
    team: { name: 'West Team' },
    tenantRole: {
      code: 'field_executive',
      name: 'Field Executive',
      updatedAt: new Date('2026-09-20T00:00:00.000Z'),
    },
    tenant: {
      settings: { timezone: 'Asia/Kolkata' },
      addresses: [{
        type: 'OFFICE',
        line1: 'Andheri East',
        line2: null,
        city: 'Mumbai',
        stateOrRegion: 'Maharashtra',
        postalCode: '400069',
        countryCode: 'IN',
        isPrimary: true,
      }],
    },
  };
  const database = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue(user),
    },
    userSession: {
      findFirst: jest.fn().mockResolvedValue({
        ip: '127.0.0.1',
        lastSeenAt: new Date('2026-09-24T05:00:00.000Z'),
      }),
    },
    tenantMembership: {
      findFirst: jest.fn().mockResolvedValue(membership),
      update: jest.fn(),
    },
    platformUserRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) },
    auditLog: {
      findMany: jest.fn().mockResolvedValue([{
        id: randomUUID(),
        action: 'LOGIN_SUCCESS',
        createdAt: new Date('2026-09-24T05:00:00.000Z'),
        ip: null,
      }]),
      create: jest.fn().mockResolvedValue({ id: randomUUID() }),
    },
  };
  const prisma = {
    ...database,
    $transaction: jest.fn((work: (tx: Prisma.TransactionClient) => unknown) => work(database as unknown as Prisma.TransactionClient)),
  } as unknown as PrismaService;
  const service = new AuthService(
    prisma,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('projects user, active membership, session, permission, and activity data', async () => {
    await expect(service.getProfile(principal)).resolves.toMatchObject({
      fullName: 'Vikram Singh',
      employeeCode: 'WEST-042',
      dateOfBirth: '1992-06-18',
      officeAddress: 'Andheri East, Mumbai, Maharashtra, 400069, IN',
      designation: 'Field Executive',
      roleName: 'Field Executive',
      dataScope: 'SELF_AND_ASSIGNED_LEADS',
      teamAccess: 'West Team',
      timezone: 'Asia/Kolkata',
      loginIp: '127.0.0.1',
      permissionsCount: 2,
      emailVerified: true,
      recentActivity: [{ action: 'LOGIN_SUCCESS', ip: '127.0.0.1' }],
    });
  });
});
