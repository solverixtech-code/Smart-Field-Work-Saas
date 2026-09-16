-- CreateEnum
CREATE TYPE "LeadLifecycle" AS ENUM ('OPEN', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LeadKind" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kind" "LeadKind" NOT NULL DEFAULT 'BUSINESS',
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" TEXT,
    "description" TEXT,
    "sourceValueId" TEXT,
    "status" "LeadLifecycle" NOT NULL DEFAULT 'OPEN',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "ownerMembershipId" TEXT NOT NULL,
    "assignedMembershipId" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "convertedAccountId" TEXT,
    "convertedContactId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedByMembershipId" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdByMembershipId" TEXT NOT NULL,
    "updatedByMembershipId" TEXT NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadConversionCommand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "resultRevision" INTEGER NOT NULL,
    "accountId" TEXT,
    "contactId" TEXT,
    "actorMembershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadConversionCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_tenantId_deletedAt_createdAt_id_idx" ON "Lead"("tenantId", "deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Lead_tenantId_ownerMembershipId_deletedAt_idx" ON "Lead"("tenantId", "ownerMembershipId", "deletedAt");

-- CreateIndex
CREATE INDEX "Lead_tenantId_assignedMembershipId_deletedAt_idx" ON "Lead"("tenantId", "assignedMembershipId", "deletedAt");

-- CreateIndex
CREATE INDEX "Lead_tenantId_status_priority_deletedAt_idx" ON "Lead"("tenantId", "status", "priority", "deletedAt");

-- CreateIndex
CREATE INDEX "Lead_tenantId_accountId_idx" ON "Lead"("tenantId", "accountId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_contactId_idx" ON "Lead"("tenantId", "contactId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_convertedAccountId_idx" ON "Lead"("tenantId", "convertedAccountId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_convertedContactId_idx" ON "Lead"("tenantId", "convertedContactId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_tenantId_key" ON "Lead"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversionCommand_id_tenantId_key" ON "LeadConversionCommand"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversionCommand_leadId_tenantId_key" ON "LeadConversionCommand"("leadId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversionCommand_tenantId_leadId_idempotencyKey_key" ON "LeadConversionCommand"("tenantId", "leadId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceValueId_fkey" FOREIGN KEY ("sourceValueId") REFERENCES "MasterValue"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerMembershipId_tenantId_fkey" FOREIGN KEY ("ownerMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedMembershipId_tenantId_fkey" FOREIGN KEY ("assignedMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_accountId_tenantId_fkey" FOREIGN KEY ("accountId", "tenantId") REFERENCES "Account"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_contactId_tenantId_fkey" FOREIGN KEY ("contactId", "tenantId") REFERENCES "Contact"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedAccountId_tenantId_fkey" FOREIGN KEY ("convertedAccountId", "tenantId") REFERENCES "Account"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedContactId_tenantId_fkey" FOREIGN KEY ("convertedContactId", "tenantId") REFERENCES "Contact"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedByMembershipId_tenantId_fkey" FOREIGN KEY ("convertedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdByMembershipId_tenantId_fkey" FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedByMembershipId_tenantId_fkey" FOREIGN KEY ("updatedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "LeadConversionCommand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "LeadConversionCommand_leadId_tenantId_fkey" FOREIGN KEY ("leadId", "tenantId") REFERENCES "Lead"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "LeadConversionCommand_accountId_tenantId_fkey" FOREIGN KEY ("accountId", "tenantId") REFERENCES "Account"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "LeadConversionCommand_contactId_tenantId_fkey" FOREIGN KEY ("contactId", "tenantId") REFERENCES "Contact"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "LeadConversionCommand_actorMembershipId_tenantId_fkey" FOREIGN KEY ("actorMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;


ALTER TABLE "Lead" ADD CONSTRAINT "Lead_revision_positive" CHECK (revision > 0),
 ADD CONSTRAINT "Lead_conversion_shape" CHECK (
  (status='CONVERTED' AND "convertedAt" IS NOT NULL AND "convertedByMembershipId" IS NOT NULL AND "deletedAt" IS NULL
   AND ((kind='BUSINESS' AND "convertedAccountId" IS NOT NULL) OR (kind='INDIVIDUAL' AND "convertedAccountId" IS NULL AND "convertedContactId" IS NOT NULL)))
  OR (status<>'CONVERTED' AND "convertedAt" IS NULL AND "convertedByMembershipId" IS NULL AND "convertedAccountId" IS NULL AND "convertedContactId" IS NULL));
ALTER TABLE "LeadConversionCommand" ADD CONSTRAINT "Lead_command_shape" CHECK (
 length("idempotencyKey") BETWEEN 1 AND 100 AND "payloadHash" ~ '^[a-f0-9]{64}$' AND "resultRevision">0 AND ("accountId" IS NOT NULL OR "contactId" IS NOT NULL));
CREATE FUNCTION crm_lead_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW."tenantId" IS DISTINCT FROM OLD."tenantId" OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt" OR NEW."createdByMembershipId" IS DISTINCT FROM OLD."createdByMembershipId" THEN
   RAISE EXCEPTION 'CRM_TENANT_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF (OLD.status='CONVERTED' OR OLD."deletedAt" IS NOT NULL) AND NEW IS DISTINCT FROM OLD THEN
   RAISE EXCEPTION 'CRM_LEAD_IMMUTABLE' USING ERRCODE='23514';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT
   ((OLD.status='OPEN' AND NEW.status IN ('QUALIFIED','DISQUALIFIED','DUPLICATE')) OR
    (OLD.status='QUALIFIED' AND NEW.status IN ('CONVERTED','DISQUALIFIED','DUPLICATE'))) THEN
   RAISE EXCEPTION 'CRM_LEAD_TRANSITION_INVALID' USING ERRCODE='23514';
  END IF;
 END IF;
 PERFORM crm_check_master(NEW."sourceValueId",NEW."tenantId",'lead_source');
 IF NEW."accountId" IS NOT NULL THEN
  PERFORM id FROM "Account" WHERE id=NEW."accountId" AND "tenantId"=NEW."tenantId" AND "deletedAt" IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CRM_ACCOUNT_DELETED' USING ERRCODE='23514'; END IF;
 END IF;
 IF NEW."contactId" IS NOT NULL THEN
  PERFORM id FROM "Contact" WHERE id=NEW."contactId" AND "tenantId"=NEW."tenantId" AND "deletedAt" IS NULL AND "accountId" IS NOT DISTINCT FROM NEW."accountId" FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CRM_LEAD_LINK_MISMATCH' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER crm_lead_integrity BEFORE INSERT OR UPDATE ON "Lead" FOR EACH ROW EXECUTE FUNCTION crm_lead_integrity();
CREATE TRIGGER crm_lead_no_delete BEFORE DELETE ON "Lead" FOR EACH ROW EXECUTE FUNCTION crm_reject_hard_delete();
CREATE FUNCTION crm_lead_command_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 RAISE EXCEPTION 'CRM_CONVERSION_IMMUTABLE' USING ERRCODE='23514'; END $$;
CREATE TRIGGER crm_lead_command_immutable BEFORE UPDATE OR DELETE ON "LeadConversionCommand" FOR EACH ROW EXECUTE FUNCTION crm_lead_command_immutable();
CREATE FUNCTION crm_lead_conversion_consistency() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_id text; tenant_id text;
BEGIN
 IF TG_TABLE_NAME='Lead' THEN target_id:=NEW.id; tenant_id:=NEW."tenantId"; ELSE target_id:=NEW."leadId"; tenant_id:=NEW."tenantId"; END IF;
 IF EXISTS (SELECT 1 FROM "Lead" l WHERE l.id=target_id AND l."tenantId"=tenant_id AND l.status='CONVERTED') THEN
  IF NOT EXISTS (SELECT 1 FROM "Lead" l JOIN "LeadConversionCommand" c ON c."leadId"=l.id AND c."tenantId"=l."tenantId"
   WHERE l.id=target_id AND l."tenantId"=tenant_id AND c."resultRevision"=l.revision AND c."accountId" IS NOT DISTINCT FROM l."convertedAccountId"
    AND c."contactId" IS NOT DISTINCT FROM l."convertedContactId" AND c."actorMembershipId"=l."convertedByMembershipId" AND c."createdAt"=l."convertedAt"
    AND (c."contactId" IS NULL OR EXISTS (SELECT 1 FROM "Contact" ct WHERE ct.id=c."contactId" AND ct."tenantId"=tenant_id AND ct."accountId" IS NOT DISTINCT FROM c."accountId" AND ct."deletedAt" IS NULL))
    AND (c."accountId" IS NULL OR EXISTS (SELECT 1 FROM "Account" a WHERE a.id=c."accountId" AND a."tenantId"=tenant_id AND a."deletedAt" IS NULL))) THEN
   RAISE EXCEPTION 'CRM_CONVERSION_INCONSISTENT' USING ERRCODE='23514';
  END IF;
 ELSIF EXISTS (SELECT 1 FROM "LeadConversionCommand" c WHERE c."leadId"=target_id AND c."tenantId"=tenant_id) THEN
  RAISE EXCEPTION 'CRM_CONVERSION_INCONSISTENT' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER crm_lead_conversion_consistency AFTER INSERT OR UPDATE ON "Lead" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION crm_lead_conversion_consistency();
CREATE CONSTRAINT TRIGGER crm_command_conversion_consistency AFTER INSERT ON "LeadConversionCommand" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION crm_lead_conversion_consistency();
CREATE FUNCTION crm_lead_target_delete_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."deletedAt" IS NOT NULL AND OLD."deletedAt" IS NULL AND EXISTS (
  SELECT 1 FROM "Lead" l WHERE l."tenantId"=NEW."tenantId" AND
   ((TG_TABLE_NAME='Account' AND ((l."accountId"=NEW.id AND l."deletedAt" IS NULL) OR l."convertedAccountId"=NEW.id)) OR
    (TG_TABLE_NAME='Contact' AND ((l."contactId"=NEW.id AND l."deletedAt" IS NULL) OR l."convertedContactId"=NEW.id)))) THEN
  RAISE EXCEPTION 'CRM_TARGET_HAS_LEADS' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER crm_lead_account_delete_guard BEFORE UPDATE ON "Account" FOR EACH ROW EXECUTE FUNCTION crm_lead_target_delete_guard();
CREATE TRIGGER crm_lead_contact_delete_guard BEFORE UPDATE ON "Contact" FOR EACH ROW EXECUTE FUNCTION crm_lead_target_delete_guard();
