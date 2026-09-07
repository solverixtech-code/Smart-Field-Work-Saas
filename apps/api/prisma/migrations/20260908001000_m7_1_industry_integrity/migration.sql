-- M7 invariants are additive. Existing classification/subscription contracts remain intact.
CREATE UNIQUE INDEX "IndustryTemplate_one_draft" ON "IndustryTemplateVersion" ("industryTemplateId") WHERE status = 'DRAFT';
ALTER TABLE "IndustryTemplate" ADD CONSTRAINT "IndustryTemplate_identity_check"
  CHECK (code ~ '^[A-Z][A-Z0-9_]{1,63}$' AND revision > 0 AND length(trim(name)) > 0
    AND ((status = 'ARCHIVED') = ("archivedAt" IS NOT NULL)));
-- No reviewed product keys exist yet. Fail closed until a separately reviewed schema version exists.
ALTER TABLE "IndustryTemplateVersion" ADD CONSTRAINT "IndustryVersion_snapshot_check"
  CHECK (version > 0 AND revision > 0 AND "schemaVersion" = 1 AND terminology = '{}'::jsonb AND "masterDefaults" = '[]'::jsonb
    AND ((status = 'DRAFT' AND "publishedAt" IS NULL AND "publishedByUserId" IS NULL AND "approvalReference" IS NULL)
      OR (status = 'PUBLISHED' AND "publishedAt" IS NOT NULL AND "publishedByUserId" IS NOT NULL AND length(trim("approvalReference")) > 0)));

CREATE FUNCTION m7_template_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Industry templates are retained' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'DRAFT' OR NEW.revision <> 1 OR NEW."currentPublishedVersionId" IS NOT NULL THEN
      RAISE EXCEPTION 'Industry template must start as draft' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.id <> OLD.id OR NEW.code <> OLD.code OR NEW."createdAt" <> OLD."createdAt" OR OLD.status = 'ARCHIVED'
      OR NEW.revision <> OLD.revision + 1 OR (OLD.status = 'ACTIVE' AND NEW.status = 'DRAFT') THEN
      RAISE EXCEPTION 'Invalid industry template transition' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW."currentPublishedVersionId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "IndustryTemplateVersion" v WHERE v.id = NEW."currentPublishedVersionId"
      AND v."industryTemplateId" = NEW.id AND v.status = 'PUBLISHED'
  ) THEN RAISE EXCEPTION 'Industry pointer requires same-parent published version' USING ERRCODE = '23514'; END IF;
  IF NEW.status = 'ACTIVE' AND NEW."currentPublishedVersionId" IS NULL THEN
    RAISE EXCEPTION 'Active industry requires published pointer' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_template_guard" BEFORE INSERT OR UPDATE OR DELETE ON "IndustryTemplate" FOR EACH ROW EXECUTE FUNCTION m7_template_guard();

CREATE FUNCTION m7_version_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_status "IndustryTemplateStatus"; next_version integer;
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Industry versions are retained' USING ERRCODE = '23514'; END IF;
  SELECT status INTO parent_status FROM "IndustryTemplate" WHERE id = NEW."industryTemplateId" FOR UPDATE;
  IF parent_status = 'ARCHIVED' THEN RAISE EXCEPTION 'Industry is archived' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version FROM "IndustryTemplateVersion" WHERE "industryTemplateId" = NEW."industryTemplateId";
    IF NEW.status <> 'DRAFT' OR NEW.version <> next_version OR NEW.revision <> 1 THEN
      RAISE EXCEPTION 'Industry draft numbering is monotonic' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF OLD.status = 'PUBLISHED' OR NEW.id <> OLD.id OR NEW."industryTemplateId" <> OLD."industryTemplateId"
      OR NEW.version <> OLD.version OR NEW."createdAt" <> OLD."createdAt" OR NEW.revision <> OLD.revision + 1
      OR NEW."sourceFixtureId" IS DISTINCT FROM OLD."sourceFixtureId" OR NEW."sourceHash" IS DISTINCT FROM OLD."sourceHash" THEN
      RAISE EXCEPTION 'Industry version identity or published snapshot is immutable' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_version_guard" BEFORE INSERT OR UPDATE OR DELETE ON "IndustryTemplateVersion" FOR EACH ROW EXECUTE FUNCTION m7_version_guard();

CREATE FUNCTION m7_recommendation_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE version_id text; version_status "IndustryTemplateVersionStatus"; parent_status "IndustryTemplateStatus";
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.id <> OLD.id OR NEW."industryTemplateVersionId" <> OLD."industryTemplateVersionId") THEN
    RAISE EXCEPTION 'Recommendation identity cannot change' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN version_id := OLD."industryTemplateVersionId"; ELSE version_id := NEW."industryTemplateVersionId"; END IF;
  -- Same parent/aggregate lock as publication, including direct SQL child mutations.
  SELECT t.status INTO parent_status FROM "IndustryTemplate" t JOIN "IndustryTemplateVersion" v ON v."industryTemplateId" = t.id
    WHERE v.id = version_id FOR UPDATE OF t;
  SELECT status INTO version_status FROM "IndustryTemplateVersion" WHERE id = version_id FOR UPDATE;
  IF version_status = 'PUBLISHED' OR parent_status = 'ARCHIVED' THEN
    RAISE EXCEPTION 'Published or archived recommendations are immutable' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF NOT EXISTS (SELECT 1 FROM "PlatformModule" WHERE id = NEW."moduleId" AND status IN ('ACTIVE', 'BETA')) THEN
    RAISE EXCEPTION 'Recommendation requires available registered module' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_recommendation_guard" BEFORE INSERT OR UPDATE OR DELETE ON "IndustryTemplateModuleRecommendation" FOR EACH ROW EXECUTE FUNCTION m7_recommendation_guard();

CREATE FUNCTION m7_assignment_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE tenant_code text; template_code text; template_id text; template_status "IndustryTemplateStatus"; version_status "IndustryTemplateVersionStatus"; previous_template text;
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Industry assignments are retained' USING ERRCODE = '23514'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('industry-assignment:' || NEW."tenantId", 0));
  SELECT "industryCode" INTO tenant_code FROM "Tenant" WHERE id = NEW."tenantId" FOR UPDATE;
  SELECT t.id, t.code, t.status, v.status INTO template_id, template_code, template_status, version_status
    FROM "IndustryTemplate" t JOIN "IndustryTemplateVersion" v ON v."industryTemplateId" = t.id
    WHERE v.id = NEW."industryTemplateVersionId" FOR UPDATE OF t;
  IF tenant_code IS NULL OR template_code IS DISTINCT FROM tenant_code OR template_status <> 'ACTIVE' OR version_status <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'Assignment requires matching active published industry' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN RAISE EXCEPTION 'Initial industry assignment revision must be one' USING ERRCODE = '23514'; END IF;
  ELSE
    SELECT "industryTemplateId" INTO previous_template FROM "IndustryTemplateVersion" WHERE id = OLD."industryTemplateVersionId";
    IF NEW.id <> OLD.id OR NEW."tenantId" <> OLD."tenantId" OR NEW."createdAt" <> OLD."createdAt"
      OR NEW.revision <> OLD.revision + 1 OR NEW."industryTemplateVersionId" = OLD."industryTemplateVersionId" OR previous_template <> template_id THEN
      RAISE EXCEPTION 'Invalid same-template assignment migration' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_assignment_guard" BEFORE INSERT OR UPDATE OR DELETE ON "TenantIndustryTemplateAssignment" FOR EACH ROW EXECUTE FUNCTION m7_assignment_guard();

CREATE FUNCTION m7_assignment_evidence() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE previous_id text;
BEGIN
  IF TG_OP = 'UPDATE' THEN previous_id := OLD."industryTemplateVersionId"; END IF;
  IF NOT EXISTS (SELECT 1 FROM "TenantIndustryTemplateChange" c WHERE c."tenantId" = NEW."tenantId" AND c.revision = NEW.revision
    AND c."fromVersionId" IS NOT DISTINCT FROM previous_id AND c."toVersionId" = NEW."industryTemplateVersionId" AND c."actorUserId" = NEW."assignedByUserId") THEN
    RAISE EXCEPTION 'Industry assignment requires matching transition evidence' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER "M7_assignment_evidence" AFTER INSERT OR UPDATE ON "TenantIndustryTemplateAssignment"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION m7_assignment_evidence();

CREATE FUNCTION m7_change_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Industry transition evidence is append only' USING ERRCODE = '23514'; END IF;
  IF length(trim(NEW.reason)) = 0 OR NEW.revision < 1 THEN RAISE EXCEPTION 'Industry transition reason required' USING ERRCODE = '23514'; END IF;
  IF NOT EXISTS (SELECT 1 FROM "TenantIndustryTemplateAssignment" a WHERE a."tenantId" = NEW."tenantId" AND a.revision = NEW.revision
    AND a."industryTemplateVersionId" = NEW."toVersionId" AND a."assignedByUserId" = NEW."actorUserId")
    OR (NEW.revision = 1 AND NEW."fromVersionId" IS NOT NULL)
    OR (NEW.revision > 1 AND NOT EXISTS (SELECT 1 FROM "TenantIndustryTemplateChange" c WHERE c."tenantId" = NEW."tenantId"
      AND c.revision = NEW.revision - 1 AND c."toVersionId" = NEW."fromVersionId")) THEN
    RAISE EXCEPTION 'Industry transition evidence must match actual assignment' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_change_guard" BEFORE INSERT OR UPDATE OR DELETE ON "TenantIndustryTemplateChange" FOR EACH ROW EXECUTE FUNCTION m7_change_guard();

CREATE FUNCTION m7_classification_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."industryCode" IS DISTINCT FROM OLD."industryCode" AND EXISTS (SELECT 1 FROM "TenantIndustryTemplateAssignment" WHERE "tenantId" = OLD.id) THEN
    RAISE EXCEPTION 'Pinned industry classification cannot be changed' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M7_classification_guard" BEFORE UPDATE OF "industryCode" ON "Tenant" FOR EACH ROW EXECUTE FUNCTION m7_classification_guard();
