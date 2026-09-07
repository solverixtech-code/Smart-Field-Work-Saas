-- CreateEnum
CREATE TYPE "MasterSource" AS ENUM ('SYSTEM', 'INDUSTRY', 'TENANT');

-- CreateEnum
CREATE TYPE "MasterOverrideScope" AS ENUM ('INDUSTRY', 'TENANT');

-- CreateEnum
CREATE TYPE "MasterSystemValuePolicy" AS ENUM ('OVERRIDABLE_LABEL', 'LOCKED_IDENTITY');

-- CreateEnum
CREATE TYPE "MasterDefinitionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "MasterDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "moduleCode" TEXT,
    "valueType" TEXT NOT NULL DEFAULT 'LABEL',
    "metadataSchema" TEXT NOT NULL DEFAULT 'NONE',
    "allowTenantCreate" BOOLEAN NOT NULL,
    "allowTenantEdit" BOOLEAN NOT NULL,
    "allowTenantDeactivate" BOOLEAN NOT NULL,
    "allowIndustryDefaults" BOOLEAN NOT NULL,
    "systemValuePolicy" "MasterSystemValuePolicy" NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "status" "MasterDefinitionStatus" NOT NULL DEFAULT 'ACTIVE',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterValue" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "source" "MasterSource" NOT NULL,
    "tenantId" TEXT,
    "industryTemplateVersionId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayColor" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterValueOverride" (
    "id" TEXT NOT NULL,
    "inheritedMasterValueId" TEXT NOT NULL,
    "scope" "MasterOverrideScope" NOT NULL,
    "tenantId" TEXT,
    "industryTemplateVersionId" TEXT,
    "displayName" TEXT,
    "displayColor" TEXT,
    "sortOrder" INTEGER,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterValueOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterDefinition_code_key" ON "MasterDefinition"("code");

-- CreateIndex
CREATE INDEX "MasterDefinition_moduleCode_idx" ON "MasterDefinition"("moduleCode");

-- CreateIndex
CREATE INDEX "MasterValue_definitionId_source_idx" ON "MasterValue"("definitionId", "source");

-- CreateIndex
CREATE INDEX "MasterValue_tenantId_definitionId_idx" ON "MasterValue"("tenantId", "definitionId");

-- CreateIndex
CREATE INDEX "MasterValue_industryTemplateVersionId_definitionId_idx" ON "MasterValue"("industryTemplateVersionId", "definitionId");

-- CreateIndex
CREATE INDEX "MasterValueOverride_inheritedMasterValueId_idx" ON "MasterValueOverride"("inheritedMasterValueId");

-- CreateIndex
CREATE INDEX "MasterValueOverride_tenantId_idx" ON "MasterValueOverride"("tenantId");

-- CreateIndex
CREATE INDEX "MasterValueOverride_industryTemplateVersionId_idx" ON "MasterValueOverride"("industryTemplateVersionId");

-- AddForeignKey
ALTER TABLE "MasterDefinition" ADD CONSTRAINT "MasterDefinition_moduleCode_fkey" FOREIGN KEY ("moduleCode") REFERENCES "PlatformModule"("code") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "MasterDefinition"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_industryTemplateVersionId_fkey" FOREIGN KEY ("industryTemplateVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterValueOverride_inheritedMasterValueId_fkey" FOREIGN KEY ("inheritedMasterValueId") REFERENCES "MasterValue"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterValueOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterValueOverride_industryTemplateVersionId_fkey" FOREIGN KEY ("industryTemplateVersionId") REFERENCES "IndustryTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterValueOverride_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;


