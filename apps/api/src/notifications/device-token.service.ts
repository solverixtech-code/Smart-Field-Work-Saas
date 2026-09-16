import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { RegisterDeviceTokenDto } from './dto/register-device.dto';

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers or updates an FCM push token for a user and workspace membership
   */
  async registerToken(
    userId: string,
    membershipId: string | null,
    tenantId: string,
    dto: RegisterDeviceTokenDto,
  ) {
    try {
      const existing = await this.prisma.devicePushToken.findUnique({
        where: { token: dto.token },
      });

      if (existing) {
        return await this.prisma.devicePushToken.update({
          where: { token: dto.token },
          data: {
            userId,
            membershipId: membershipId ?? existing.membershipId,
            tenantId,
            platform: dto.platform,
            deviceModel: dto.deviceModel ?? existing.deviceModel,
            appVersion: dto.appVersion ?? existing.appVersion,
            isActive: true,
            lastSeenAt: new Date(),
          },
        });
      }

      return await this.prisma.devicePushToken.create({
        data: {
          token: dto.token,
          userId,
          membershipId,
          tenantId,
          platform: dto.platform,
          deviceModel: dto.deviceModel,
          appVersion: dto.appVersion,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error registering device push token: ${err?.message}`);
      throw err;
    }
  }

  /**
   * Unregisters / deactivates a device push token
   */
  async unregisterToken(token: string) {
    try {
      return await this.prisma.devicePushToken.updateMany({
        where: { token },
        data: { isActive: false },
      });
    } catch (err: any) {
      this.logger.warn(`Could not deactivate token: ${err?.message}`);
    }
  }

  /**
   * Deactivates multiple invalid tokens identified by FCM multicast response
   */
  async deactivateInvalidTokens(tokens: string[]) {
    if (!tokens || tokens.length === 0) return;
    try {
      await this.prisma.devicePushToken.updateMany({
        where: { token: { in: tokens } },
        data: { isActive: false },
      });
      this.logger.log(`Deactivated ${tokens.length} invalid FCM push token(s).`);
    } catch (err: any) {
      this.logger.error(`Failed to deactivate invalid tokens: ${err?.message}`);
    }
  }

  /**
   * Gets push tokens list for Push Notifications management screen with stats
   */
  async getPushTokensOverview(tenantId: string) {
    const [totalTokens, activeTokens, tokensList] = await Promise.all([
      this.prisma.devicePushToken.count({ where: { tenantId } }),
      this.prisma.devicePushToken.count({ where: { tenantId, isActive: true } }),
      this.prisma.devicePushToken.findMany({
        where: { tenantId },
        orderBy: { lastSeenAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, mobile: true },
          },
        },
      }),
    ]);

    return {
      totalTokens,
      activeTokens,
      inactiveTokens: totalTokens - activeTokens,
      tokens: tokensList.map((t) => ({
        id: t.id,
        token: t.token,
        maskedToken: `${t.token.slice(0, 12)}...${t.token.slice(-8)}`,
        platform: t.platform,
        deviceModel: t.deviceModel ?? 'Unknown Device',
        appVersion: t.appVersion ?? '1.0.0',
        isActive: t.isActive,
        lastSeenAt: t.lastSeenAt,
        createdAt: t.createdAt,
        user: t.user
          ? {
              name: t.user.fullName,
              email: t.user.email,
              phone: t.user.mobile,
            }
          : null,
      })),
    };
  }
}
