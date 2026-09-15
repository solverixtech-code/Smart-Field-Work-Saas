-- CreateEnum
CREATE TYPE "CrmRecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessTypeValueId" TEXT,
    "sourceValueId" TEXT,
    "categoryLabel" TEXT,
    "status" "CrmRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerMembershipId" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "website" TEXT,
    "gstin" TEXT,
    "establishedYear" INTEGER,
    "description" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdByMembershipId" TEXT NOT NULL,
    "updatedByMembershipId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "roleValueId" TEXT,
    "status" "CrmRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerMembershipId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdByMembershipId" TEXT NOT NULL,
    "updatedByMembershipId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_tenantId_deletedAt_createdAt_id_idx" ON "Account"("tenantId", "deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Account_tenantId_ownerMembershipId_deletedAt_idx" ON "Account"("tenantId", "ownerMembershipId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_key" ON "Account"("id", "tenantId");

-- CreateIndex
CREATE INDEX "Contact_tenantId_accountId_deletedAt_createdAt_id_idx" ON "Contact"("tenantId", "accountId", "deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Contact_tenantId_ownerMembershipId_deletedAt_idx" ON "Contact"("tenantId", "ownerMembershipId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_tenantId_key" ON "Contact"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_businessTypeValueId_fkey" FOREIGN KEY ("businessTypeValueId") REFERENCES "MasterValue"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_sourceValueId_fkey" FOREIGN KEY ("sourceValueId") REFERENCES "MasterValue"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerMembershipId_tenantId_fkey" FOREIGN KEY ("ownerMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_createdByMembershipId_tenantId_fkey" FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_updatedByMembershipId_tenantId_fkey" FOREIGN KEY ("updatedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_accountId_tenantId_fkey" FOREIGN KEY ("accountId", "tenantId") REFERENCES "Account"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_roleValueId_fkey" FOREIGN KEY ("roleValueId") REFERENCES "MasterValue"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerMembershipId_tenantId_fkey" FOREIGN KEY ("ownerMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_createdByMembershipId_tenantId_fkey" FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_updatedByMembershipId_tenantId_fkey" FOREIGN KEY ("updatedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- Keep every Phase 0 audit invariant; admit the registered CRM category only.
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_v2_shape";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_v2_shape" CHECK (
  "schemaVersion" IN (1,2) AND scope IN ('TENANT','PLATFORM','SYSTEM','LEGACY') AND
  ("schemaVersion"=1 OR (
    scope <> 'LEGACY' AND ("tenantId" IS NULL OR scope='TENANT') AND
    "eventCode" IS NOT NULL AND length("eventCode") BETWEEN 1 AND 100 AND
    category IS NOT NULL AND category IN ('AUTH','RBAC','CATALOG','PLAN','SUBSCRIPTION','PROVISIONING','INDUSTRY','MASTER','MEDIA','JOB','CRM') AND
    outcome IS NOT NULL AND outcome IN ('SUCCESS','FAILURE','DENIED') AND
    "actorType" IN ('USER','SYSTEM','ANONYMOUS') AND "redactionVersion" IS NOT NULL AND "redactionVersion"=1 AND
    ("requestId" IS NULL OR length("requestId")<=100) AND
    ("correlationId" IS NULL OR length("correlationId")<=100) AND
    ("originRequestId" IS NULL OR length("originRequestId")<=100) AND
    ("beforeJson" IS NULL OR octet_length("beforeJson"::text)<=32768) AND
    ("afterJson" IS NULL OR octet_length("afterJson"::text)<=32768) AND
    (metadata IS NULL OR octet_length(metadata::text)<=32768)
  ))
);

ALTER TABLE "Account" ADD CONSTRAINT "Account_revision_positive" CHECK (revision > 0);
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_revision_positive" CHECK (revision > 0),
 ADD CONSTRAINT "Contact_ownership" CHECK (
 ("accountId" IS NOT NULL AND "ownerMembershipId" IS NULL) OR
 ("accountId" IS NULL AND "ownerMembershipId" IS NOT NULL)),
 ADD CONSTRAINT "Contact_primary_valid" CHECK (NOT "isPrimary" OR
 ("accountId" IS NOT NULL AND status='ACTIVE' AND "deletedAt" IS NULL));
CREATE UNIQUE INDEX "Contact_one_primary_per_account" ON "Contact" ("tenantId", "accountId")
 WHERE "isPrimary" AND "deletedAt" IS NULL;

-- Source identity is immutable in the Master foundation. Shared SYSTEM/INDUSTRY
-- values cannot use a tenantId composite FK; verify definition and source here.
CREATE FUNCTION crm_check_master(value_id text, tenant_id text, definition_code text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF value_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM "MasterValue" v JOIN "MasterDefinition" d ON d.id=v."definitionId"
  WHERE v.id=value_id AND d.code=definition_code AND
   (v.source='SYSTEM' OR (v.source='TENANT' AND v."tenantId"=tenant_id) OR
    (v.source='INDUSTRY' AND EXISTS (
     SELECT 1 FROM "TenantIndustryTemplateChange" c
     WHERE c."tenantId"=tenant_id AND c."toVersionId"=v."industryTemplateVersionId")))) THEN
  RAISE EXCEPTION 'CRM_MASTER_REFERENCE_INVALID' USING ERRCODE='23514';
 END IF;
END $$;
CREATE FUNCTION crm_account_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW."tenantId" IS DISTINCT FROM OLD."tenantId" THEN
   RAISE EXCEPTION 'CRM_TENANT_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF OLD."deletedAt" IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN
   RAISE EXCEPTION 'CRM_DELETED_IMMUTABLE' USING ERRCODE='23514';
  END IF;
 END IF;
 IF NEW."deletedAt" IS NOT NULL AND EXISTS (
  SELECT 1 FROM "Contact" WHERE "accountId"=NEW.id AND "tenantId"=NEW."tenantId" AND "deletedAt" IS NULL) THEN
  RAISE EXCEPTION 'CRM_ACCOUNT_HAS_CONTACTS' USING ERRCODE='23514';
 END IF;
 PERFORM crm_check_master(NEW."businessTypeValueId",NEW."tenantId",'business_type');
 PERFORM crm_check_master(NEW."sourceValueId",NEW."tenantId",'lead_source');
 RETURN NEW;
END $$;
CREATE TRIGGER crm_account_integrity BEFORE INSERT OR UPDATE ON "Account" FOR EACH ROW EXECUTE FUNCTION crm_account_integrity();
CREATE FUNCTION crm_contact_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_deleted timestamp;
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW."tenantId" IS DISTINCT FROM OLD."tenantId" OR NEW."accountId" IS DISTINCT FROM OLD."accountId" THEN
   RAISE EXCEPTION 'CRM_CONTACT_LINK_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF OLD."deletedAt" IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN
   RAISE EXCEPTION 'CRM_DELETED_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF OLD."isPrimary" AND (NEW."deletedAt" IS NOT NULL OR NEW.status<>'ACTIVE') THEN
   RAISE EXCEPTION 'CRM_PRIMARY_CONTACT_REQUIRED_CHANGE' USING ERRCODE='23514';
  END IF;
 END IF;
 IF NEW."accountId" IS NOT NULL THEN
  SELECT "deletedAt" INTO parent_deleted FROM "Account"
   WHERE id=NEW."accountId" AND "tenantId"=NEW."tenantId" FOR UPDATE;
  IF FOUND AND parent_deleted IS NOT NULL AND NEW."deletedAt" IS NULL THEN
   RAISE EXCEPTION 'CRM_ACCOUNT_DELETED' USING ERRCODE='23514';
  END IF;
 END IF;
 PERFORM crm_check_master(NEW."roleValueId",NEW."tenantId",'contact_role');
 RETURN NEW;
END $$;
CREATE TRIGGER crm_contact_integrity BEFORE INSERT OR UPDATE ON "Contact" FOR EACH ROW EXECUTE FUNCTION crm_contact_integrity();

-- CRM records are retained through soft deletion, including direct SQL access.
CREATE FUNCTION crm_reject_hard_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'CRM_SOFT_DELETE_ONLY' USING ERRCODE='23514';
END $$;
CREATE TRIGGER crm_account_soft_delete_only BEFORE DELETE ON "Account" FOR EACH ROW EXECUTE FUNCTION crm_reject_hard_delete();
CREATE TRIGGER crm_contact_soft_delete_only BEFORE DELETE ON "Contact" FOR EACH ROW EXECUTE FUNCTION crm_reject_hard_delete();
