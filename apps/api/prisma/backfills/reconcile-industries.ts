import { readFile } from 'fs/promises';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { EffectivePermissionService } from '../../src/common/security/effective-permission.service';
import { PrismaService } from '../../src/persistence/prisma.service';
import { IndustryAssignmentService } from '../../src/platform/industries/industry-assignment.service';
import { IndustryImportService } from '../../src/platform/industries/industry-import.service';
import { INDUSTRY_CANDIDATES } from '../../src/platform/industries/industry-candidates';

async function main() {
  const [source, actorUserId, mode, approvedHash] = process.argv.slice(2);
  if (
    !source ||
    !actorUserId ||
    !['--dry-run', '--apply'].includes(mode) ||
    (mode === '--apply' && !approvedHash)
  ) {
    throw new Error(
      'Usage: npm run db:reconcile:industries -- mapping.json|--candidates actorUserId --dry-run|--apply reviewedHash',
    );
  }
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const actor = await app.get(PrismaService).user.findUnique({
      where: { id: actorUserId },
      select: { status: true },
    });
    const permissions = await app
      .get(EffectivePermissionService)
      .resolvePlatformPermissions(actorUserId);
    const required =
      mode === '--apply'
        ? 'platform.industries.manage'
        : 'platform.industries.view';
    if (actor?.status !== 'ACTIVE' || !permissions.includes(required))
      throw new Error(
        'Active platform actor with required Industry permission is mandatory',
      );
    const hash = mode === '--apply' ? approvedHash : undefined;
    const result =
      source === '--candidates'
        ? await app
            .get(IndustryImportService)
            .run(INDUSTRY_CANDIDATES, actorUserId, hash)
        : await app
            .get(IndustryAssignmentService)
            .reconcile(
              JSON.parse(await readFile(source, 'utf8')),
              actorUserId,
              hash,
            );
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await app.close();
  }
}
void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Industry reconciliation failed'}\n`,
  );
  process.exitCode = 1;
});
