import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { DeviceTokenService } from './device-token.service';
import { DevicePlatform } from './notifications.contract';

describe('DeviceTokenService', () => {
  const membershipFind = jest.fn();
  const tokenFind = jest.fn();
  const tokenCreate = jest.fn();
  const tokenUpdate = jest.fn();
  const tokenUpdateMany = jest.fn();
  const prisma = {
    tenantMembership: { findFirst: membershipFind },
    devicePushToken: {
      findUnique: tokenFind, create: tokenCreate,
      update: tokenUpdate, updateMany: tokenUpdateMany,
    },
  } as unknown as PrismaService;
  const service = new DeviceTokenService(prisma);
  const registration = { token: 'valid-fcm-token', platform: DevicePlatform.ANDROID };

  beforeEach(() => jest.clearAllMocks());

  it('rejects registration without an active membership in the selected workspace', async () => {
    membershipFind.mockResolvedValue(null);
    await expect(service.registerToken('user-1', 'member-1', 'tenant-1', registration))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(membershipFind).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'member-1', userId: 'user-1', tenantId: 'tenant-1', status: 'ACTIVE' },
    }));
    expect(tokenCreate).not.toHaveBeenCalled();
  });

  it('moves a reused device token to the current workspace membership', async () => {
    membershipFind.mockResolvedValue({ id: 'member-2' });
    tokenFind.mockResolvedValue({ membershipId: 'old-member', platform: 'IOS' });
    tokenUpdate.mockResolvedValue({ id: 'token-1' });
    await service.registerToken('user-2', 'member-2', 'tenant-2', registration);
    expect(tokenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'user-2', membershipId: 'member-2', tenantId: 'tenant-2', isActive: true }),
    }));
  });

  it('only unregisters the requesting user’s token in the current workspace', async () => {
    tokenUpdateMany.mockResolvedValue({ count: 1 });
    await service.unregisterToken('valid-fcm-token', 'user-1', 'tenant-1');
    expect(tokenUpdateMany).toHaveBeenCalledWith({
      where: { token: 'valid-fcm-token', userId: 'user-1', tenantId: 'tenant-1' },
      data: { isActive: false },
    });
  });
});
