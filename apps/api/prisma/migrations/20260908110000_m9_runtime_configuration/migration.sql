-- Runtime bookkeeping only. Published commercial/configuration authority is unchanged.
CREATE TYPE "RuntimeConfigScope" AS ENUM ('SYSTEM', 'INDUSTRY', 'TENANT');
CREATE TABLE "RuntimeConfigEpoch" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scope "RuntimeConfigScope" NOT NULL,
  "tenantId" TEXT UNIQUE REFERENCES "Tenant"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "industryTemplateVersionId" TEXT UNIQUE REFERENCES "IndustryTemplateVersion"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  CONSTRAINT "RuntimeConfigEpoch_scope_check" CHECK (
    (scope = 'SYSTEM' AND "tenantId" IS NULL AND "industryTemplateVersionId" IS NULL) OR
    (scope = 'TENANT' AND "tenantId" IS NOT NULL AND "industryTemplateVersionId" IS NULL) OR
    (scope = 'INDUSTRY' AND "tenantId" IS NULL AND "industryTemplateVersionId" IS NOT NULL)
  )
);
CREATE UNIQUE INDEX "RuntimeConfigEpoch_system_unique" ON "RuntimeConfigEpoch"(scope) WHERE scope = 'SYSTEM';
INSERT INTO "RuntimeConfigEpoch"(scope) VALUES ('SYSTEM');
INSERT INTO "RuntimeConfigEpoch"(scope, "tenantId") SELECT 'TENANT', id FROM "Tenant" ORDER BY id;
INSERT INTO "RuntimeConfigEpoch"(scope, "industryTemplateVersionId") SELECT 'INDUSTRY', id FROM "IndustryTemplateVersion" ORDER BY id;

CREATE FUNCTION m9_epoch_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Preserve frozen parent deletion/cascade behavior. A recreated parent gets a new
    -- random epoch identity; identity AND version are hashed, so old keys never revive.
    IF (OLD.scope = 'TENANT' AND NOT EXISTS (SELECT 1 FROM "Tenant" WHERE id=OLD."tenantId")) OR
       (OLD.scope = 'INDUSTRY' AND NOT EXISTS (SELECT 1 FROM "IndustryTemplateVersion" WHERE id=OLD."industryTemplateVersionId")) THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'RUNTIME_EPOCH_RETAINED' USING ERRCODE='23514';
  END IF;
  IF TG_OP = 'UPDATE' AND ((NEW.id, NEW.scope, NEW."tenantId", NEW."industryTemplateVersionId") IS DISTINCT FROM
    (OLD.id, OLD.scope, OLD."tenantId", OLD."industryTemplateVersionId") OR NEW.version <> OLD.version + 1) THEN
    RAISE EXCEPTION 'RUNTIME_EPOCH_MONOTONIC' USING ERRCODE='23514';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.version <> 1 THEN RAISE EXCEPTION 'RUNTIME_EPOCH_INITIAL' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER m9_epoch_guard BEFORE INSERT OR UPDATE OR DELETE ON "RuntimeConfigEpoch" FOR EACH ROW EXECUTE FUNCTION m9_epoch_guard();

CREATE FUNCTION m9_bump(p_scope "RuntimeConfigScope", p_owner TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "RuntimeConfigEpoch" SET version=version+1 WHERE scope=p_scope AND
    ((p_scope='SYSTEM') OR (p_scope='TENANT' AND "tenantId"=p_owner) OR (p_scope='INDUSTRY' AND "industryTemplateVersionId"=p_owner));
  IF NOT FOUND THEN
    -- Parent cascades need not recreate version state for a deleted authority.
    IF p_scope='TENANT' AND NOT EXISTS (SELECT 1 FROM "Tenant" WHERE id=p_owner) THEN RETURN; END IF;
    IF p_scope='INDUSTRY' AND NOT EXISTS (SELECT 1 FROM "IndustryTemplateVersion" WHERE id=p_owner) THEN RETURN; END IF;
    RAISE EXCEPTION 'RUNTIME_EPOCH_MISSING' USING ERRCODE='23514';
  END IF;
END $$;

CREATE FUNCTION m9_parent_epoch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME='Tenant' THEN
    IF TG_OP='INSERT' THEN INSERT INTO "RuntimeConfigEpoch"(scope,"tenantId") VALUES ('TENANT',NEW.id);
    ELSE PERFORM m9_bump('TENANT',NEW.id); END IF;
  ELSE
    IF TG_OP='INSERT' THEN INSERT INTO "RuntimeConfigEpoch"(scope,"industryTemplateVersionId") VALUES ('INDUSTRY',NEW.id);
    ELSE PERFORM m9_bump('INDUSTRY',NEW.id); END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER m9_tenant_epoch AFTER INSERT OR UPDATE ON "Tenant" FOR EACH ROW EXECUTE FUNCTION m9_parent_epoch();
CREATE TRIGGER m9_industry_epoch AFTER INSERT OR UPDATE ON "IndustryTemplateVersion" FOR EACH ROW EXECUTE FUNCTION m9_parent_epoch();

CREATE FUNCTION m9_source_epoch() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE before_row JSONB; after_row JSONB; item JSONB; scopes TEXT[] := '{}'; owners TEXT[] := '{}'; s TEXT; owner_id TEXT; entry RECORD;
BEGIN
  IF TG_OP <> 'INSERT' THEN before_row=to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN after_row=to_jsonb(NEW); END IF;
  IF TG_OP='UPDATE' AND before_row=after_row THEN RETURN NEW; END IF;
  FOREACH item IN ARRAY ARRAY[before_row,after_row] LOOP
    IF item IS NULL THEN CONTINUE; END IF;
    IF TG_TABLE_NAME IN ('PlatformModule','Permission','MasterDefinition') THEN s='SYSTEM'; owner_id='';
    ELSIF TG_TABLE_NAME='TenantRolePermission' THEN
      s='TENANT'; SELECT "tenantId" INTO owner_id FROM "TenantRole" WHERE id=item->>'tenantRoleId';
      -- Cascading deletion of a role also invalidates via TenantRole's own trigger.
      IF owner_id IS NULL THEN CONTINUE; END IF;
    ELSIF TG_TABLE_NAME IN ('MasterValue','MasterValueOverride') THEN
      s=COALESCE(item->>'source',item->>'scope');
      owner_id=CASE s WHEN 'TENANT' THEN item->>'tenantId' WHEN 'INDUSTRY' THEN item->>'industryTemplateVersionId' ELSE '' END;
    ELSE s='TENANT'; owner_id=item->>'tenantId'; END IF;
    scopes=array_append(scopes,s); owners=array_append(owners,owner_id);
  END LOOP;
  -- Canonical order within a reparent/multi-scope row. Source locks precede epoch
  -- locks; bootstrap never takes write locks. Multi-row writers may need retries.
  FOR entry IN SELECT DISTINCT scope, owner FROM unnest(scopes,owners) AS x(scope,owner) ORDER BY scope,owner LOOP
    PERFORM m9_bump(entry.scope::"RuntimeConfigScope",entry.owner);
  END LOOP;
  RETURN COALESCE(NEW,OLD);
END $$;
CREATE TRIGGER m9_module_source AFTER INSERT OR UPDATE OR DELETE ON "PlatformModule" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_permission_source AFTER INSERT OR UPDATE OR DELETE ON "Permission" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_settings_source AFTER INSERT OR UPDATE OR DELETE ON "TenantSettings" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_membership_source AFTER INSERT OR UPDATE OR DELETE ON "TenantMembership" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_role_source AFTER INSERT OR UPDATE OR DELETE ON "TenantRole" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_grant_source AFTER INSERT OR UPDATE OR DELETE ON "TenantRolePermission" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_assignment_source AFTER INSERT OR UPDATE OR DELETE ON "TenantIndustryTemplateAssignment" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_master_definition_source AFTER INSERT OR UPDATE OR DELETE ON "MasterDefinition" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_master_value_source AFTER INSERT OR UPDATE OR DELETE ON "MasterValue" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
CREATE TRIGGER m9_master_override_source AFTER INSERT OR UPDATE OR DELETE ON "MasterValueOverride" FOR EACH ROW EXECUTE FUNCTION m9_source_epoch();
