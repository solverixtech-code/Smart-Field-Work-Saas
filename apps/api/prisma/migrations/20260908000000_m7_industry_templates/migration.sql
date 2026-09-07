-- CreateEnum
CREATE TYPE "IndustryTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IndustryTemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "IndustryTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IndustryTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "currentPublishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "IndustryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTemplateVersion" (
    "id" TEXT NOT NULL,
    "industryTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "status" "IndustryTemplateVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "terminology" JSONB NOT NULL,
    "masterDefaults" JSONB NOT NULL,
    "sourceFixtureId" TEXT,
    "sourceHash" TEXT,
    "approvalReference" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTemplateModuleRecommendation" (
    "id" TEXT NOT NULL,
    "industryTemplateVersionId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "IndustryTemplateModuleRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantIndustryTemplateAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "industryTemplateVersionId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantIndustryTemplateAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantIndustryTemplateChange" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromVersionId" TEXT,
    "toVersionId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantIndustryTemplateChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplate_code_key" ON "IndustryTemplate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplate_currentPublishedVersionId_key" ON "IndustryTemplate"("currentPublishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplateVersion_industryTemplateId_version_key" ON "IndustryTemplateVersion"("industryTemplateId", "version");

-- CreateIndex
CREATE INDEX "IndustryTemplateModuleRecommendation_moduleId_idx" ON "IndustryTemplateModuleRecommendation"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplateModuleRecommendation_industryTemplateVersio_key" ON "IndustryTemplateModuleRecommendation"("industryTemplateVersionId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantIndustryTemplateAssignment_tenantId_key" ON "TenantIndustryTemplateAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "TenantIndustryTemplateAssignment_industryTemplateVersionId_idx" ON "TenantIndustryTemplateAssignment"("industryTemplateVersionId");

-- CreateIndex
CREATE INDEX "TenantIndustryTemplateChange_fromVersionId_idx" ON "TenantIndustryTemplateChange"("fromVersionId");

-- CreateIndex
CREATE INDEX "TenantIndustryTemplateChange_toVersionId_idx" ON "TenantIndustryTemplateChange"("toVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantIndustryTemplateChange_tenantId_revision_key" ON "TenantIndustryTemplateChange"("tenantId", "revision");

-- AddForeignKey
ALTER TABLE "IndustryTemplate" ADD CONSTRAINT "IndustryTemplate_code_fkey" FOREIGN KEY ("code") REFERENCES "IndustryClassification"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTemplate" ADD CONSTRAINT "IndustryTemplate_currentPublishedVersionId_fkey" FOREIGN KEY ("currentPublishedVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTemplateVersion" ADD CONSTRAINT "IndustryTemplateVersion_industryTemplateId_fkey" FOREIGN KEY ("industryTemplateId") REFERENCES "IndustryTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTemplateVersion" ADD CONSTRAINT "IndustryTemplateVersion_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTemplateModuleRecommendation" ADD CONSTRAINT "IndustryTemplateModuleRecommendation_industryTemplateVersi_fkey" FOREIGN KEY ("industryTemplateVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTemplateModuleRecommendation" ADD CONSTRAINT "IndustryTemplateModuleRecommendation_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "PlatformModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateAssignment" ADD CONSTRAINT "TenantIndustryTemplateAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateAssignment" ADD CONSTRAINT "TenantIndustryTemplateAssignment_industryTemplateVersionId_fkey" FOREIGN KEY ("industryTemplateVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateAssignment" ADD CONSTRAINT "TenantIndustryTemplateAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateChange" ADD CONSTRAINT "TenantIndustryTemplateChange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateChange" ADD CONSTRAINT "TenantIndustryTemplateChange_fromVersionId_fkey" FOREIGN KEY ("fromVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateChange" ADD CONSTRAINT "TenantIndustryTemplateChange_toVersionId_fkey" FOREIGN KEY ("toVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIndustryTemplateChange" ADD CONSTRAINT "TenantIndustryTemplateChange_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
