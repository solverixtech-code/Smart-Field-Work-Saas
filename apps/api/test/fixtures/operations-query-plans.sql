-- Disposable test-database probe only. All inserted fixtures are rolled back.
BEGIN;
DO $$ BEGIN
  IF current_database() NOT LIKE '%test%' THEN RAISE EXCEPTION 'Test database required'; END IF;
END $$;
INSERT INTO "Tenant" (id,slug,"displayName","updatedAt") VALUES
  ('00000000-0000-4000-8000-000000000010','m010-query-plan-a','Query-plan test A',CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000011','m010-query-plan-b','Query-plan test B',CURRENT_TIMESTAMP);
INSERT INTO "AuditLog" (id,action,"tenantId","eventCode","createdAt")
SELECT gen_random_uuid()::text,'QUERY_PLAN_FIXTURE',
  CASE WHEN n%100=0 THEN '00000000-0000-4000-8000-000000000010' ELSE '00000000-0000-4000-8000-000000000011' END,
  CASE WHEN n%100=0 THEN 'media.upload.intent' ELSE 'QUERY_PLAN_FIXTURE' END,
  (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')-make_interval(secs=>n)
FROM generate_series(1,20000) AS n;
INSERT INTO "BackgroundJob" (id,type,"correlationId",payload,"idempotencyKey","payloadHash","availableAt","updatedAt")
SELECT gen_random_uuid()::text,'media.delete-object',gen_random_uuid()::text,'{}'::jsonb,gen_random_uuid()::text,repeat('a',64),
  (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')+make_interval(secs=>CASE WHEN n<=20 THEN -n ELSE n END),CURRENT_TIMESTAMP
FROM generate_series(1,20000) AS n;
ANALYZE "AuditLog";
ANALYZE "BackgroundJob";
EXPLAIN (ANALYZE, BUFFERS) SELECT id,"createdAt" FROM "AuditLog"
  WHERE "tenantId"='00000000-0000-4000-8000-000000000010' AND "createdAt">=(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')-interval '30 minutes'
  ORDER BY "createdAt" DESC,id DESC LIMIT 50;
EXPLAIN (ANALYZE, BUFFERS) SELECT id,"createdAt" FROM "AuditLog"
  WHERE "eventCode"='media.upload.intent' AND "createdAt">=(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')-interval '30 minutes'
  ORDER BY "createdAt" DESC,id DESC LIMIT 50;
EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM "BackgroundJob"
  WHERE (status='PENDING' AND "availableAt"<=(statement_timestamp() AT TIME ZONE 'UTC')) OR
    (status='RUNNING' AND "leaseExpiresAt"<=(statement_timestamp() AT TIME ZONE 'UTC'))
  ORDER BY "availableAt",id LIMIT 20 FOR UPDATE SKIP LOCKED;
ROLLBACK;
