import { readFile } from "fs/promises";
import { NestFactory } from "@nestjs/core";
import { MasterCoreModule } from "../../src/platform/masters/master-core.module";
import { MasterSeedService } from "../../src/platform/masters/master-seed.service";
import { MasterReconciliationService } from "../../src/platform/masters/master-reconciliation.service";

async function main() {
  const [source, actorId, mode, reviewOrPage, extra] = process.argv.slice(2);
  if (
    !source ||
    !actorId ||
    !["--dry-run", "--apply"].includes(mode) ||
    extra ||
    (mode === "--apply" && !reviewOrPage) ||
    (source === "--legacy-report" && mode !== "--dry-run")
  )
    throw new Error(
      "Usage: db:reconcile:masters -- --seed|--legacy-report|mapping.json actorId --dry-run|--apply [reviewedHash; report page number]",
    );
  const app = await NestFactory.createApplicationContext(MasterCoreModule, {
    logger: ["error", "warn"],
  });
  try {
    const approvedHash = mode === "--apply" ? reviewOrPage : undefined;
    const result =
      source === "--seed"
        ? await app.get(MasterSeedService).run(actorId, approvedHash)
        : source === "--legacy-report"
          ? await app
              .get(MasterReconciliationService)
              .report(actorId, { page: reviewOrPage ?? 1, limit: 100 })
          : await app
              .get(MasterReconciliationService)
              .run(
                JSON.parse(await readFile(source, "utf8")),
                actorId,
                approvedHash,
              );
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await app.close();
  }
}
void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Master reconciliation failed"}\n`,
  );
  process.exitCode = 1;
});
