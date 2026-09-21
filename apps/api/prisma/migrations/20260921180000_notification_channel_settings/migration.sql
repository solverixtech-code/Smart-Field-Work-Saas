CREATE TABLE "PlatformNotificationSettings" (
  "id" TEXT NOT NULL,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
  "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
  "followUpAssignedPush" BOOLEAN NOT NULL DEFAULT false,
  "followUpDuePush" BOOLEAN NOT NULL DEFAULT false,
  "updatedById" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformNotificationSettings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "NotificationRecord" ADD COLUMN "sourceKey" TEXT;
CREATE UNIQUE INDEX "NotificationRecord_sourceKey_key" ON "NotificationRecord"("sourceKey");
