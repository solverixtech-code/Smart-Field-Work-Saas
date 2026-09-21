import { ConfigService } from "@nestjs/config";
import { ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../persistence/prisma.service";
import { FcmPushService } from "./fcm-push.service";

describe("FcmPushService global gate", () => {
  const findUnique = jest.fn();
  const prisma = {
    platformNotificationSettings: { findUnique },
  } as unknown as PrismaService;
  const service = new FcmPushService(
    { get: () => undefined } as unknown as ConfigService,
    prisma,
  );

  beforeEach(() => jest.clearAllMocks());

  it("refuses a push when the master switch is disabled", async () => {
    findUnique.mockResolvedValue({ pushEnabled: false });
    await expect(
      service.sendMulticast(["registered-token"], {
        title: "Due",
        body: "Call the lead",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("does not claim delivery when Firebase is unavailable", async () => {
    findUnique.mockResolvedValue({ pushEnabled: true });
    await expect(
      service.sendMulticast(["registered-token"], {
        title: "Due",
        body: "Call the lead",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
