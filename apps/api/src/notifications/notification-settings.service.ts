import { BadRequestException, Injectable } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../persistence/prisma.service";
import { auditEvents } from "../audit/audit-event-writer";
import { FcmPushService } from "./fcm-push.service";

const settingsInput = z
  .object({
    pushEnabled: z.boolean(),
    whatsappEnabled: z.boolean(),
    followUpAssignedPush: z.boolean(),
    followUpDuePush: z.boolean(),
  })
  .strict();

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcm: FcmPushService,
  ) {}

  async get() {
    const settings = await this.prisma.platformNotificationSettings.findUnique({
      where: { id: "global" },
      select: {
        pushEnabled: true,
        whatsappEnabled: true,
        followUpAssignedPush: true,
        followUpDuePush: true,
        updatedAt: true,
      },
    });
    return {
      pushEnabled: settings?.pushEnabled ?? false,
      whatsappEnabled: settings?.whatsappEnabled ?? false,
      followUpAssignedPush: settings?.followUpAssignedPush ?? false,
      followUpDuePush: settings?.followUpDuePush ?? false,
      updatedAt: settings?.updatedAt ?? null,
      fcmConfigured: !this.fcm.isInSimulationMode,
      whatsappConfigured: false,
    };
  }

  async update(actorUserId: string, raw: unknown) {
    const parsed = settingsInput.safeParse(raw);
    if (!parsed.success)
      throw new BadRequestException(
        "Provide valid notification channel and trigger settings.",
      );
    const input = parsed.data;
    if (input.pushEnabled && this.fcm.isInSimulationMode) {
      throw new BadRequestException(
        "Configure Firebase credentials before enabling mobile push.",
      );
    }
    if (input.whatsappEnabled) {
      throw new BadRequestException(
        "Connect a WhatsApp Business API sender before enabling this channel.",
      );
    }
    await this.prisma.$transaction(async (tx) => {
      const before = await tx.platformNotificationSettings.findUnique({
        where: { id: "global" },
        select: {
          pushEnabled: true,
          whatsappEnabled: true,
          followUpAssignedPush: true,
          followUpDuePush: true,
        },
      });
      await tx.platformNotificationSettings.upsert({
        where: { id: "global" },
        create: { id: "global", ...input, updatedById: actorUserId },
        update: { ...input, updatedById: actorUserId },
      });
      await auditEvents.write(tx, {
        action: "notification.settings.changed",
        scope: "PLATFORM",
        actorUserId,
        entityType: "PlatformNotificationSettings",
        entityId: "global",
        beforeJson: before,
        afterJson: input,
      });
    });
    return this.get();
  }

  async isFollowUpPushEnabled(trigger: "assigned" | "due") {
    const settings = await this.prisma.platformNotificationSettings.findUnique({
      where: { id: "global" },
      select: {
        pushEnabled: true,
        followUpAssignedPush: true,
        followUpDuePush: true,
      },
    });
    return Boolean(
      settings?.pushEnabled &&
      (trigger === "assigned"
        ? settings.followUpAssignedPush
        : settings.followUpDuePush),
    );
  }
}
