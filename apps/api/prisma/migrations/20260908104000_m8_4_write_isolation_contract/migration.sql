-- Cross-scope checks reload after symmetric locks under READ COMMITTED.
-- REPEATABLE READ retains an earlier snapshot even after waiting, so it cannot
-- safely perform these writes. SERIALIZABLE retains PostgreSQL's SSI protection.
-- Read-only resolution remains REPEATABLE READ and never fires these triggers.
CREATE FUNCTION m8_write_isolation_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('transaction_isolation') = 'repeatable read' THEN
    RAISE EXCEPTION 'MASTER_WRITE_ISOLATION_UNSUPPORTED' USING ERRCODE='23514';
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER "M8_write_isolation_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterDefinition" FOR EACH STATEMENT EXECUTE FUNCTION m8_write_isolation_guard();
CREATE TRIGGER "M8_write_isolation_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterValue" FOR EACH STATEMENT EXECUTE FUNCTION m8_write_isolation_guard();
CREATE TRIGGER "M8_write_isolation_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterValueOverride" FOR EACH STATEMENT EXECUTE FUNCTION m8_write_isolation_guard();
CREATE TRIGGER "M8_write_isolation_guard" BEFORE INSERT OR UPDATE OR DELETE ON "TenantIndustryTemplateAssignment" FOR EACH STATEMENT EXECUTE FUNCTION m8_write_isolation_guard();
