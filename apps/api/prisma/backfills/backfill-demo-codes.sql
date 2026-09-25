WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "tenantId" ORDER BY "createdAt", "id") AS sequence
  FROM "LeadDemo"
)
UPDATE "LeadDemo" AS demo
SET "demoCode" = 'DEM-' || LPAD(ranked.sequence::TEXT, 4, '0')
FROM ranked
WHERE demo."id" = ranked."id" AND demo."demoCode" IS NULL;

ALTER TABLE "LeadDemo" ALTER COLUMN "demoCode" SET NOT NULL;
