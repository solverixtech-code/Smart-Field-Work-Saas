import { BadRequestException } from "@nestjs/common";
import { NotificationSettingsService } from "./notification-settings.service";
import { FcmPushService } from "./fcm-push.service";
import { PrismaService } from "../persistence/prisma.service";

describe("NotificationSettingsService", () => {
  const findUnique = jest.fn();
  const upsert = jest.fn();
  const auditCreate = jest.fn();
  const database = {
    platformNotificationSettings: { findUnique, upsert },
    auditLog: { create: auditCreate },
  };
  const prisma = {
    ...database,
    $transaction: jest.fn((work) => work(database)),
  } as unknown as PrismaService;
  const fcm = { isInSimulationMode: false } as FcmPushService;
  const settings = new NotificationSettingsService(prisma, fcm);

  beforeEach(() => {
    jest.clearAllMocks();
    findUnique.mockResolvedValue(null);
  });

  it("defaults all channels and triggers to disabled", async () => {
    await expect(settings.get()).resolves.toMatchObject({
      pushEnabled: false,
      whatsappEnabled: false,
      followUpAssignedPush: false,
      followUpDuePush: false,
    });
    await expect(settings.isFollowUpPushEnabled("due")).resolves.toBe(false);
  });

  it("does not enable a trigger without the global master switch", async () => {
    findUnique.mockResolvedValue({
      pushEnabled: false,
      followUpAssignedPush: true,
      followUpDuePush: true,
    });
    await expect(settings.isFollowUpPushEnabled("assigned")).resolves.toBe(
      false,
    );
    await expect(settings.isFollowUpPushEnabled("due")).resolves.toBe(false);
  });

  it("requires configured Firebase credentials before enabling push", async () => {
    const unavailable = new NotificationSettingsService(prisma, {
      isInSimulationMode: true,
    } as FcmPushService);
    await expect(
      unavailable.update("operator", {
        pushEnabled: true,
        whatsappEnabled: false,
        followUpAssignedPush: true,
        followUpDuePush: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects an unconnected WhatsApp sender", async () => {
    await expect(
      settings.update("operator", {
        pushEnabled: false,
        whatsappEnabled: true,
        followUpAssignedPush: false,
        followUpDuePush: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("saves changes with a platform audit record", async () => {
    const input = {
      pushEnabled: true,
      whatsappEnabled: false,
      followUpAssignedPush: true,
      followUpDuePush: true,
    };
    findUnique.mockResolvedValue(input);
    upsert.mockResolvedValue(input);
    auditCreate.mockResolvedValue({ id: "audit-1" });
    await expect(settings.update("operator", input)).resolves.toMatchObject(
      input,
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining(input) }),
    );
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "notification.settings.changed",
          actorUserId: "operator",
        }),
      }),
    );
  });
});
