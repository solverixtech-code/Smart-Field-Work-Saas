import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistence/prisma.service';
import { DeviceTokenService } from './device-token.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto/template.dto';
import { SendTestPushDto } from './dto/test-push.dto';
import { FcmPushService } from './fcm-push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmPushService: FcmPushService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  /**
   * Retrieves summary metrics for the notification dashboard
   */
  async getOverviewMetrics(tenantId: string) {
    const [
      totalRecords,
      sentRecords,
      scheduledRecords,
      activeTokensCount,
      recentRecords,
    ] = await Promise.all([
      this.prisma.notificationRecord.count({ where: { tenantId } }),
      this.prisma.notificationRecord.count({
        where: { tenantId, status: 'SENT' },
      }),
      this.prisma.notificationRecord.count({
        where: { tenantId, status: 'SCHEDULED' },
      }),
      this.prisma.devicePushToken.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.notificationRecord.findMany({
        where: { tenantId },
        select: {
          totalRecipients: true,
          successCount: true,
          failureCount: true,
        },
      }),
    ]);

    const totalRecipients = recentRecords.reduce(
      (sum, r) => sum + r.totalRecipients,
      0,
    );
    const totalDelivered = recentRecords.reduce(
      (sum, r) => sum + r.successCount,
      0,
    );

    const deliveryRate =
      totalRecipients > 0
        ? Math.round((totalDelivered / totalRecipients) * 100)
        : 98;

    return {
      totalCampaigns: totalRecords,
      sentCampaigns: sentRecords,
      scheduledCampaigns: scheduledRecords,
      activePushDevices: activeTokensCount,
      deliverySuccessRate: deliveryRate,
      simulationMode: this.fcmPushService.isInSimulationMode,
    };
  }

  /**
   * Lists campaigns with filters and pagination
   */
  async listCampaigns(tenantId: string, query: NotificationQueryDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationRecordWhereInput = {
      tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { type: query.category } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.channel ? { channels: { has: query.channel } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.notificationRecord.count({ where }),
      this.prisma.notificationRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: items.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.description,
        type: r.type,
        channels: r.channels,
        targetAudience: r.targetAudience,
        targetFilter: r.targetFilter,
        priority: r.priority,
        status: r.status,
        scheduledAt: r.scheduledAt,
        sentAt: r.sentAt,
        totalRecipients: r.totalRecipients,
        successCount: r.successCount,
        failureCount: r.failureCount,
        actionUrl: (r.dataPayload as any)?.actionUrl ?? null,
        dataPayload: r.dataPayload,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
        createdBy: r.createdBy
          ? {
              id: r.createdBy.id,
              name: r.createdBy.fullName,
              email: r.createdBy.email,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Resolves target user memberships for delivery
   */
  private async resolveAudienceUsers(
    tenantId: string,
    targetAudience: string,
    targetRoles?: string[],
    targetMembershipIds?: string[],
  ): Promise<{ userId: string; membershipId: string }[]> {
    if (
      targetAudience === 'INDIVIDUAL' ||
      targetAudience === 'SPECIFIC_EXECUTIVES'
    ) {
      if (targetMembershipIds && targetMembershipIds.length > 0) {
        const memberships = await this.prisma.tenantMembership.findMany({
          where: {
            tenantId,
            id: { in: targetMembershipIds },
            status: 'ACTIVE',
          },
          select: { id: true, userId: true },
        });
        return memberships.map((m) => ({ userId: m.userId, membershipId: m.id }));
      }
    }

    const where: Prisma.TenantMembershipWhereInput = {
      tenantId,
      status: 'ACTIVE',
    };

    const memberships = await this.prisma.tenantMembership.findMany({
      where,
      select: { id: true, userId: true },
    });

    return memberships.map((m) => ({ userId: m.userId, membershipId: m.id }));
  }

  /**
   * Creates and optionally broadcasts a notification
   */
  async createNotification(
    tenantId: string,
    createdById: string,
    dto: CreateNotificationDto,
  ) {
    const isScheduled =
      dto.scheduledAt && new Date(dto.scheduledAt) > new Date();

    const targetUsers = await this.resolveAudienceUsers(
      tenantId,
      dto.audienceType,
      dto.targetRoles,
      dto.targetMembershipIds,
    );

    const record = await this.prisma.notificationRecord.create({
      data: {
        tenantId,
        createdById,
        title: dto.title,
        description: dto.body,
        type: dto.category,
        channels: dto.channels,
        targetAudience: dto.audienceType,
        priority: dto.priority ?? 'NORMAL',
        status: isScheduled ? 'SCHEDULED' : 'SENDING',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        totalRecipients: targetUsers.length,
        targetFilter: {
          roles: dto.targetRoles ?? [],
          territories: dto.targetTerritories ?? [],
          membershipIds: dto.targetMembershipIds ?? [],
        },
        dataPayload: {
          actionUrl: dto.actionUrl ?? null,
          ...(dto.dataPayload ?? {}),
        },
      },
    });

    if (!isScheduled) {
      await this.dispatchNotification(record.id, targetUsers);
    }

    return this.prisma.notificationRecord.findUnique({
      where: { id: record.id },
      include: {
        recipients: { take: 10 },
      },
    });
  }

  /**
   * Dispatches a notification across specified channels
   */
  async dispatchNotification(
    notificationId: string,
    preResolvedUsers?: { userId: string; membershipId: string }[],
  ) {
    const notification = await this.prisma.notificationRecord.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    try {
      const users =
        preResolvedUsers ??
        (await this.resolveAudienceUsers(
          notification.tenantId,
          notification.targetAudience,
        ));

      const userIds = users.map((u) => u.userId);

      // Find active device push tokens for these users in this workspace
      const tokens = await this.prisma.devicePushToken.findMany({
        where: {
          tenantId: notification.tenantId,
          userId: { in: userIds },
          isActive: true,
        },
      });

      let delivered = 0;
      let failed = 0;

      // 1. In-App delivery
      if (notification.channels.includes('IN_APP')) {
        const inAppLogs = users.map((u) => ({
          notificationId: notification.id,
          userId: u.userId,
          channel: 'IN_APP',
          status: 'DELIVERED',
          deliveredAt: new Date(),
        }));

        if (inAppLogs.length > 0) {
          await this.prisma.notificationRecipientLog.createMany({
            data: inAppLogs,
          });
        }
      }

      // 2. FCM Push delivery
      if (notification.channels.includes('PUSH')) {
        if (tokens.length > 0) {
          const actionUrl =
            (notification.dataPayload as any)?.actionUrl ?? undefined;

          const pushResult = await this.fcmPushService.sendMulticast(
            tokens.map((t) => t.token),
            {
              title: notification.title,
              body: notification.description,
              actionUrl,
              data: {
                notificationId: notification.id,
                type: notification.type,
                priority: notification.priority,
              },
            },
          );

          delivered += pushResult.successCount;
          failed += pushResult.failureCount;

          if (pushResult.invalidTokens.length > 0) {
            await this.deviceTokenService.deactivateInvalidTokens(
              pushResult.invalidTokens,
            );
          }

          const pushLogs = tokens.map((t) => {
            const err = pushResult.errors.find((e) => e.token === t.token);
            return {
              notificationId: notification.id,
              userId: t.userId,
              deviceTokenId: t.id,
              channel: 'PUSH',
              status: err ? 'FAILED' : 'DELIVERED',
              errorMessage: err?.error ?? null,
              deliveredAt: err ? null : new Date(),
            };
          });

          if (pushLogs.length > 0) {
            await this.prisma.notificationRecipientLog.createMany({
              data: pushLogs,
            });
          }
        } else {
          delivered = users.length;
        }
      } else {
        delivered = users.length;
      }

      await this.prisma.notificationRecord.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          successCount: delivered,
          failureCount: failed,
        },
      });

      return { success: true, delivered, failed };
    } catch (err: any) {
      this.logger.error(
        `Failed to dispatch notification ${notification.id}: ${err?.message}`,
      );
      await this.prisma.notificationRecord.update({
        where: { id: notification.id },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }

  /**
   * Dispatches a test push notification to verify FCM setup
   */
  async sendTestPush(
    tenantId: string,
    currentUserId: string,
    dto: SendTestPushDto,
  ) {
    let targetTokens: string[] = [];

    if (dto.fcmToken) {
      targetTokens = [dto.fcmToken];
    } else if (dto.targetMembershipId) {
      const tokens = await this.prisma.devicePushToken.findMany({
        where: {
          tenantId,
          membershipId: dto.targetMembershipId,
          isActive: true,
        },
      });
      targetTokens = tokens.map((t) => t.token);
    } else {
      const tokens = await this.prisma.devicePushToken.findMany({
        where: {
          tenantId,
          userId: currentUserId,
          isActive: true,
        },
      });
      targetTokens = tokens.map((t) => t.token);
    }

    if (targetTokens.length === 0) {
      if (this.fcmPushService.isInSimulationMode) {
        targetTokens = [`sim-fcm-token-${currentUserId.slice(0, 8)}`];
      } else {
        throw new BadRequestException(
          'No active device tokens found. Please specify a valid FCM token or register a device.',
        );
      }
    }

    const result = await this.fcmPushService.sendMulticast(targetTokens, {
      title: dto.title,
      body: dto.body,
      actionUrl: dto.actionUrl ?? '/admin/notifications/push-tokens',
      data: {
        type: 'TEST_PUSH',
        sentAt: new Date().toISOString(),
      },
    });

    return {
      message: 'Test push notification triggered successfully',
      targetedTokensCount: targetTokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      simulationMode: result.simulationMode,
      errors: result.errors,
    };
  }

  /**
   * High-priority executive alert broadcast
   */
  async sendExecutiveAlert(
    tenantId: string,
    currentUserId: string,
    dto: {
      title: string;
      message: string;
      priority: 'HIGH' | 'URGENT';
      targetRoles?: string[];
      actionUrl?: string;
    },
  ) {
    return this.createNotification(tenantId, currentUserId, {
      title: dto.title,
      body: dto.message,
      channels: ['PUSH' as any, 'IN_APP' as any],
      category: 'EMERGENCY_ALERT' as any,
      priority: (dto.priority === 'URGENT' ? 'URGENT' : 'HIGH') as any,
      audienceType:
        dto.targetRoles && dto.targetRoles.length > 0
          ? ('BY_ROLE' as any)
          : ('ALL_EXECUTIVES' as any),
      targetRoles: dto.targetRoles,
      actionUrl: dto.actionUrl,
    });
  }

  /**
   * Retrieves in-app notification feed for current user (Header bell icon)
   */
  async getUserInAppNotifications(userId: string, tenantId: string) {
    const logs = await this.prisma.notificationRecipientLog.findMany({
      where: {
        userId,
        channel: 'IN_APP',
        notification: { tenantId },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            priority: true,
            dataPayload: true,
            createdAt: true,
          },
        },
      },
    });

    const unreadCount = logs.filter((l) => !l.readAt).length;

    return {
      unreadCount,
      notifications: logs.map((l) => ({
        id: l.id,
        notificationId: l.notification.id,
        title: l.notification.title,
        body: l.notification.description,
        category: l.notification.type,
        priority: l.notification.priority,
        actionUrl: (l.notification.dataPayload as any)?.actionUrl ?? null,
        createdAt: l.notification.createdAt,
        isRead: Boolean(l.readAt),
      })),
    };
  }

  /**
   * Marks a specific in-app notification log as read
   */
  async markNotificationAsRead(logId: string, userId: string) {
    return this.prisma.notificationRecipientLog.updateMany({
      where: { id: logId, userId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Marks all in-app notifications as read for current user
   */
  async markAllNotificationsAsRead(userId: string, tenantId: string) {
    return this.prisma.notificationRecipientLog.updateMany({
      where: {
        userId,
        readAt: null,
        notification: { tenantId },
      },
      data: { readAt: new Date() },
    });
  }

  // ----------------------------------------------------
  // TEMPLATES MANAGEMENT
  // ----------------------------------------------------

  async listTemplates(tenantId: string) {
    let templates = await this.prisma.notificationTemplate.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (templates.length === 0) {
      await this.seedDefaultTemplates(tenantId);
      templates = await this.prisma.notificationTemplate.findMany({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    return templates;
  }

  async createTemplate(tenantId: string, dto: CreateNotificationTemplateDto) {
    const code =
      dto.name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_') +
      '_' +
      Date.now().toString(36);

    return this.prisma.notificationTemplate.create({
      data: {
        tenantId,
        code,
        name: dto.name,
        category: dto.category,
        subject: dto.titleTemplate,
        body: dto.bodyTemplate,
        channels: dto.defaultChannels ?? ['PUSH', 'IN_APP'],
        isActive: true,
      },
    });
  }

  async updateTemplate(
    tenantId: string,
    templateId: string,
    dto: UpdateNotificationTemplateDto,
  ) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id: templateId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.category ? { category: dto.category } : {}),
        ...(dto.titleTemplate ? { subject: dto.titleTemplate } : {}),
        ...(dto.bodyTemplate ? { body: dto.bodyTemplate } : {}),
        ...(dto.defaultChannels ? { channels: dto.defaultChannels } : {}),
        ...(typeof dto.isActive === 'boolean' ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteTemplate(tenantId: string, templateId: string) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id: templateId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });
  }

  private async seedDefaultTemplates(tenantId: string) {
    const defaults = [
      {
        tenantId,
        code: 'SHIFT_PUNCH_REMINDER',
        name: 'Daily Shift Punch-In Reminder',
        category: 'Operations',
        subject: 'Shift Reminder: {{executive_name}}',
        body: 'Your shift starts at {{shift_start_time}}. Please ensure geolocation punch-in is completed.',
        channels: ['PUSH', 'IN_APP'],
        isActive: true,
      },
      {
        tenantId,
        code: 'ROUTE_OPTIMIZATION_ALERT',
        name: 'Urgent Route Optimization Alert',
        category: 'Alerts',
        subject: 'Route Updated: {{territory_name}}',
        body: 'Traffic or urgent re-assignment on {{territory_name}}. Check your updated visit sequence immediately.',
        channels: ['PUSH', 'IN_APP'],
        isActive: true,
      },
      {
        tenantId,
        code: 'TARGET_MILESTONE_REACHED',
        name: 'Monthly Target Milestone Achieved',
        category: 'Sales',
        subject: 'Congratulations! {{target_percent}}% Target Reached',
        body: 'Great job, {{executive_name}}! You have completed {{leads_count}} customer onboardings this week.',
        channels: ['PUSH', 'IN_APP'],
        isActive: true,
      },
      {
        tenantId,
        code: 'NEW_LEAD_ASSIGNED',
        name: 'New Lead Auto-Assigned',
        category: 'Leads',
        subject: 'New Lead: {{business_name}}',
        body: 'A new high-intent lead in {{business_city}} has been assigned to you. Schedule visit within 24 hours.',
        channels: ['PUSH', 'IN_APP'],
        isActive: true,
      },
    ];

    for (const d of defaults) {
      await this.prisma.notificationTemplate.upsert({
        where: {
          tenantId_code: {
            tenantId,
            code: d.code,
          },
        },
        update: {},
        create: d,
      });
    }
  }
}
