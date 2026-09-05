import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyM5Triggers() {
  console.log('Applying M5 Plan Immutability triggers and partial unique index...');

  const sqlStatements = [
    `CREATE UNIQUE INDEX IF NOT EXISTS "PlanVersion_planId_draft_key" ON "PlanVersion"("planId") WHERE status = 'DRAFT';`,

    `CREATE OR REPLACE FUNCTION prevent_published_plan_version_modification()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.status = 'DRAFT' AND NEW.status = 'PUBLISHED' THEN
            RETURN NEW;
        END IF;

        IF OLD.status = 'PUBLISHED' OR OLD."publishedAt" IS NOT NULL THEN
            RAISE EXCEPTION 'Immutable error: Published PlanVersion % cannot be updated or deleted.', OLD.id;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,

    `DROP TRIGGER IF EXISTS enforce_plan_version_immutability ON "PlanVersion";`,
    `CREATE TRIGGER enforce_plan_version_immutability
    BEFORE UPDATE OR DELETE ON "PlanVersion"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_plan_version_modification();`,

    `CREATE OR REPLACE FUNCTION prevent_published_plan_child_modification()
    RETURNS TRIGGER AS $$
    DECLARE
        target_plan_version_id TEXT;
        target_status "PlanVersionStatus";
    BEGIN
        IF TG_OP = 'DELETE' THEN
            target_plan_version_id := OLD."planVersionId";
        ELSE
            target_plan_version_id := NEW."planVersionId";
        END IF;

        SELECT status INTO target_status FROM "PlanVersion" WHERE id = target_plan_version_id;

        IF target_status = 'PUBLISHED' THEN
            RAISE EXCEPTION 'Immutable error: Cannot insert, update, or delete child records for published PlanVersion %.', target_plan_version_id;
        END IF;

        IF TG_OP = 'UPDATE' AND OLD."planVersionId" <> NEW."planVersionId" THEN
            SELECT status INTO target_status FROM "PlanVersion" WHERE id = OLD."planVersionId";
            IF target_status = 'PUBLISHED' THEN
                RAISE EXCEPTION 'Immutable error: Cannot move child records out of published PlanVersion %.', OLD."planVersionId";
            END IF;
        END IF;

        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;`,

    `DROP TRIGGER IF EXISTS enforce_plan_pricing_immutability ON "PlanPricing";`,
    `CREATE TRIGGER enforce_plan_pricing_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON "PlanPricing"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_plan_child_modification();`,

    `DROP TRIGGER IF EXISTS enforce_plan_limit_immutability ON "PlanLimit";`,
    `CREATE TRIGGER enforce_plan_limit_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON "PlanLimit"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_plan_child_modification();`,

    `DROP TRIGGER IF EXISTS enforce_plan_module_immutability ON "PlanModule";`,
    `CREATE TRIGGER enforce_plan_module_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON "PlanModule"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_plan_child_modification();`,

    `DROP TRIGGER IF EXISTS enforce_plan_commercial_rule_immutability ON "PlanCommercialRule";`,
    `CREATE TRIGGER enforce_plan_commercial_rule_immutability
    BEFORE INSERT OR UPDATE OR DELETE ON "PlanCommercialRule"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_published_plan_child_modification();`,
  ];

  for (const statement of sqlStatements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log('✅ M5 triggers and indexes applied successfully.');
}

applyM5Triggers()
  .catch((err) => {
    console.error('❌ Failed to apply M5 triggers:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
