CREATE TABLE "ExecutiveLocationSample" (
  "id" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "membershipId" UUID NOT NULL,
  "clientSampleId" UUID NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracyMeters" DOUBLE PRECISION,
  "speedKmh" DOUBLE PRECISION,
  "headingDegrees" DOUBLE PRECISION,
  "batteryPercentage" INTEGER,
  "source" TEXT NOT NULL DEFAULT 'WEB',
  "isUsable" BOOLEAN NOT NULL DEFAULT true,
  "qualityReason" TEXT,
  CONSTRAINT "ExecutiveLocationSample_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExecutiveLocationSample_coordinate_check" CHECK ("latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180),
  CONSTRAINT "ExecutiveLocationSample_accuracy_check" CHECK ("accuracyMeters" IS NULL OR "accuracyMeters" >= 0),
  CONSTRAINT "ExecutiveLocationSample_speed_check" CHECK ("speedKmh" IS NULL OR "speedKmh" >= 0),
  CONSTRAINT "ExecutiveLocationSample_heading_check" CHECK ("headingDegrees" IS NULL OR ("headingDegrees" >= 0 AND "headingDegrees" < 360)),
  CONSTRAINT "ExecutiveLocationSample_battery_check" CHECK ("batteryPercentage" IS NULL OR "batteryPercentage" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "ExecutiveLocationSample_tenantId_membershipId_clientSampleId_key" ON "ExecutiveLocationSample"("tenantId", "membershipId", "clientSampleId");
CREATE INDEX "ExecutiveLocationSample_tenantId_membershipId_capturedAt_idx" ON "ExecutiveLocationSample"("tenantId", "membershipId", "capturedAt");
CREATE INDEX "ExecutiveLocationSample_tenantId_capturedAt_idx" ON "ExecutiveLocationSample"("tenantId", "capturedAt");
CREATE INDEX "ExecutiveLocationSample_tenantId_membershipId_isUsable_capturedAt_idx" ON "ExecutiveLocationSample"("tenantId", "membershipId", "isUsable", "capturedAt");

ALTER TABLE "ExecutiveLocationSample" ADD CONSTRAINT "ExecutiveLocationSample_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExecutiveLocationSample" ADD CONSTRAINT "ExecutiveLocationSample_membershipId_tenantId_fkey"
  FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE RESTRICT;
