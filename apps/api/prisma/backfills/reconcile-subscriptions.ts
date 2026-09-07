import { readFile } from 'fs/promises';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { EffectivePermissionService } from '../../src/common/security/effective-permission.service';
import { PrismaService } from '../../src/persistence/prisma.service';
import { SubscriptionReconciliationService } from '../../src/platform/subscriptions/subscription-reconciliation.service';

async function main() {
  const [file, actorUserId, mode, approvedHash] = process.argv.slice(2);
  if (!file || !actorUserId || !['--dry-run', '--apply'].includes(mode) || (mode === '--apply' && !approvedHash)) throw new Error('Usage: npm run db:reconcile:subscriptions -- mapping.json actorUserId --dry-run | --apply reviewedMappingHash');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const actor = await app.get(PrismaService).user.findUnique({ where: { id: actorUserId }, select: { status: true } });
    const permissions = await app.get(EffectivePermissionService).resolvePlatformPermissions(actorUserId);
    const required = mode === '--apply' ? 'platform.subscriptions.manage' : 'platform.subscriptions.view';
    if (actor?.status !== 'ACTIVE' || !permissions.includes(required)) throw new Error('Active platform actor with required subscription permission is mandatory');
    const mappings: unknown = JSON.parse(await readFile(file, 'utf8'));
    const result = await app.get(SubscriptionReconciliationService).run(mappings, { userId: actorUserId }, mode === '--apply' ? approvedHash : undefined);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { await app.close(); }
}
void main().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : 'Reconciliation failed'}\n`); process.exitCode = 1; });
