-- CreateEnum
CREATE TYPE "AttendanceMobilityMode" AS ENUM ('INHERIT', 'OFFICE_ONLY', 'FIELD_REMOTE');

-- CreateEnum
CREATE TYPE "AttendanceDeviceStatus" AS ENUM ('ACTIVE', 'PENDING', 'REVOKED');

-- CreateEnum
CREATE TYPE "AttendanceLocationKind" AS ENUM ('OFFICE', 'ASSIGNED_VISIT', 'FIELD_REMOTE');

-- CreateEnum
CREATE TYPE "AttendanceGeofenceResult" AS ENUM ('INSIDE', 'OUTSIDE_ALLOWED', 'OUTSIDE_EXCEPTION');

-- CreateEnum
CREATE TYPE "AttendanceEvidenceStatus" AS ENUM ('NOT_REQUIRED', 'CAPTURED');

-- CreateEnum
CREATE TYPE "AttendanceExceptionType" AS ENUM ('OUTSIDE_GEOFENCE_PUNCH_OUT', 'CALENDAR_CONFLICT');

-- Existing attendance evidence must already have an owning tenant membership.
-- Fail explicitly rather than attaching historical rows to the wrong tenant.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Attendance" WHERE "tenantId" IS NULL OR "tenantMembershipId" IS NULL) THEN
    RAISE EXCEPTION 'Attendance ownership reconciliation required before migration';
  END IF;
  IF EXISTS (SELECT 1 FROM "PunchLog" WHERE "tenantId" IS NULL OR "tenantMembershipId" IS NULL) THEN
    RAISE EXCEPTION 'PunchLog ownership reconciliation required before migration';
  END IF;
END $$;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_tenantMembershipId_fkey";
ALTER TABLE "PunchLog" DROP CONSTRAINT IF EXISTS "PunchLog_tenantMembershipId_fkey";
ALTER TABLE "Attendance" ALTER COLUMN "tenantId" SET NOT NULL, ALTER COLUMN "tenantMembershipId" SET NOT NULL;
ALTER TABLE "PunchLog" ALTER COLUMN "tenantId" SET NOT NULL, ALTER COLUMN "tenantMembershipId" SET NOT NULL;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantMembershipId_tenantId_fkey" FOREIGN KEY ("tenantMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_tenantMembershipId_tenantId_fkey" FOREIGN KEY ("tenantMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "PunchLog" ADD COLUMN     "accuracyMeters" DOUBLE PRECISION,
ADD COLUMN     "attendanceDeviceId" TEXT,
ADD COLUMN     "attendanceSiteId" TEXT,
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "clientCommandId" TEXT,
ADD COLUMN     "evidenceStatus" "AttendanceEvidenceStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "exceptionCode" TEXT,
ADD COLUMN     "geofenceDistanceMeters" DOUBLE PRECISION,
ADD COLUMN     "geofenceRadiusMeters" INTEGER,
ADD COLUMN     "geofenceResult" "AttendanceGeofenceResult",
ADD COLUMN     "installationId" TEXT,
ADD COLUMN     "locationKind" "AttendanceLocationKind",
ADD COLUMN     "selfieAssetId" TEXT,
ADD COLUMN     "visitId" TEXT;

-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "workingWeekdays" TEXT[] DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']::TEXT[];

-- CreateTable
CREATE TABLE "AttendancePolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enforcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maximumAccuracyMeters" INTEGER NOT NULL DEFAULT 100,
    "maximumLocationAgeSeconds" INTEGER NOT NULL DEFAULT 120,
    "requirePunchInSelfie" BOOLEAN NOT NULL DEFAULT true,
    "requirePunchOutSelfie" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceMembershipOverride" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "mobilityMode" "AttendanceMobilityMode" NOT NULL DEFAULT 'INHERIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceMembershipOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceDevice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "status" "AttendanceDeviceStatus" NOT NULL DEFAULT 'PENDING',
    "label" TEXT,
    "platform" TEXT,
    "userAgent" TEXT,
    "approvedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceHoliday" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLeave" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceException" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "punchLogId" TEXT,
    "type" "AttendanceExceptionType" NOT NULL,
    "details" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendancePolicy_tenantId_key" ON "AttendancePolicy"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceSite_tenantId_isActive_idx" ON "AttendanceSite"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSite_tenantId_code_key" ON "AttendanceSite"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceMembershipOverride_tenantId_membershipId_key" ON "AttendanceMembershipOverride"("tenantId", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceMembershipOverride_membershipId_tenantId_key" ON "AttendanceMembershipOverride"("membershipId", "tenantId");

-- CreateIndex
CREATE INDEX "AttendanceDevice_tenantId_membershipId_status_idx" ON "AttendanceDevice"("tenantId", "membershipId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDevice_tenantId_membershipId_installationId_key" ON "AttendanceDevice"("tenantId", "membershipId", "installationId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceHoliday_tenantId_date_key" ON "AttendanceHoliday"("tenantId", "date");

-- CreateIndex
CREATE INDEX "AttendanceLeave_tenantId_membershipId_startDate_endDate_idx" ON "AttendanceLeave"("tenantId", "membershipId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AttendanceException_tenantId_createdAt_idx" ON "AttendanceException"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AttendanceException_tenantId_membershipId_createdAt_idx" ON "AttendanceException"("tenantId", "membershipId", "createdAt");

-- CreateIndex
CREATE INDEX "PunchLog_tenantId_timestamp_id_idx" ON "PunchLog"("tenantId", "timestamp", "id");

-- CreateIndex
CREATE INDEX "PunchLog_attendanceDeviceId_idx" ON "PunchLog"("attendanceDeviceId");

-- CreateIndex
CREATE INDEX "PunchLog_attendanceSiteId_idx" ON "PunchLog"("attendanceSiteId");

-- CreateIndex
CREATE INDEX "PunchLog_visitId_idx" ON "PunchLog"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "PunchLog_tenantId_tenantMembershipId_clientCommandId_key" ON "PunchLog"("tenantId", "tenantMembershipId", "clientCommandId");

-- AddForeignKey
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_selfieAssetId_fkey" FOREIGN KEY ("selfieAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_attendanceDeviceId_fkey" FOREIGN KEY ("attendanceDeviceId") REFERENCES "AttendanceDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_attendanceSiteId_fkey" FOREIGN KEY ("attendanceSiteId") REFERENCES "AttendanceSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "LeadVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendancePolicy" ADD CONSTRAINT "AttendancePolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSite" ADD CONSTRAINT "AttendanceSite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMembershipOverride" ADD CONSTRAINT "AttendanceMembershipOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceMembershipOverride" ADD CONSTRAINT "AttendanceMembershipOverride_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDevice" ADD CONSTRAINT "AttendanceDevice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDevice" ADD CONSTRAINT "AttendanceDevice_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceHoliday" ADD CONSTRAINT "AttendanceHoliday_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLeave" ADD CONSTRAINT "AttendanceLeave_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLeave" ADD CONSTRAINT "AttendanceLeave_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_punchLogId_fkey" FOREIGN KEY ("punchLogId") REFERENCES "PunchLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
