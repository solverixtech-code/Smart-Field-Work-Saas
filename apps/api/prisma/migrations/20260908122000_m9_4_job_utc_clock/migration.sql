-- Prisma DateTime uses UTC timestamp-without-time-zone values. New queue defaults
-- and comparisons must not depend on the PostgreSQL session's TimeZone.
ALTER TABLE "BackgroundJob" ALTER COLUMN "availableAt" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
ALTER TABLE "BackgroundJob" ALTER COLUMN "createdAt" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
ALTER TABLE "BackgroundJobAttempt" ALTER COLUMN "startedAt" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
ALTER TABLE "MediaAsset" ALTER COLUMN "createdAt" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
