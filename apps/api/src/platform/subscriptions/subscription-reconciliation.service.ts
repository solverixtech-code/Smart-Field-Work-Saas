import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CommandActor, payloadHash, selectionSchema } from './subscription-contract';
import { SubscriptionPolicyService } from './subscription-policy.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTransactionService } from './subscription-transaction.service';

export const reconciliationSchema = z.array(selectionSchema.extend({
  tenantId: z.string().min(1), industryCode: z.string().trim().toUpperCase().min(1),
  startedAt: z.string().datetime(), reason: z.string().trim().min(1).max(1000),
}).strict()).min(1).max(100);

@Injectable()
export class SubscriptionReconciliationService {
  constructor(private readonly transactions: SubscriptionTransactionService, private readonly policy: SubscriptionPolicyService, private readonly subscriptions: SubscriptionService) {}

  async run(raw: unknown, actor: CommandActor, approvedHash?: string) {
    const mappings = reconciliationSchema.parse(raw).sort((a, b) => a.tenantId.localeCompare(b.tenantId));
    if (new Set(mappings.map(m => m.tenantId)).size !== mappings.length) throw new BadRequestException('Duplicate Tenant mapping');
    const hash = payloadHash(mappings);
    if (approvedHash !== undefined && approvedHash !== hash) throw new ConflictException('Mapping differs from the reviewed dry run');
    return this.transactions.run('subscription:reconciliation', async tx => {
      const results: Array<{ tenantId: string; status: 'ALREADY_MAPPED' | 'WOULD_CREATE' | 'CREATED' }> = [];
      for (const mapping of mappings) {
        await this.transactions.lock(tx, `subscription:${mapping.tenantId}`);
        await tx.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${mapping.tenantId} FOR UPDATE`;
        const tenant = await tx.tenant.findUnique({ where: { id: mapping.tenantId }, select: { status: true, industryCode: true, subscription: { select: { planVersionId: true, billingCycle: true, seatQuantity: true, startedAt: true } } } });
        if (!tenant || tenant.status !== 'ACTIVE') throw new BadRequestException('Reconciliation requires an explicitly mapped ACTIVE legacy Tenant');
        if (new Date(mapping.startedAt) > new Date()) throw new BadRequestException('Subscription start cannot be in the future');
        if (tenant.industryCode && tenant.industryCode !== mapping.industryCode) throw new ConflictException('Existing Industry assignment differs');
        const industry = await tx.industryClassification.findUnique({ where: { code: mapping.industryCode }, select: { isActive: true } });
        if (!industry?.isActive) throw new BadRequestException('Unknown or inactive Industry classification');
        if (tenant.subscription) {
          const old = tenant.subscription;
          if (old.planVersionId !== mapping.planVersionId || old.billingCycle !== mapping.billingCycle || old.seatQuantity !== mapping.seatQuantity || old.startedAt.toISOString() !== new Date(mapping.startedAt).toISOString()) throw new ConflictException('Existing Subscription differs from mapping');
          results.push({ tenantId: mapping.tenantId, status: 'ALREADY_MAPPED' });
          continue;
        }
        await this.policy.select(tx, mapping, 'EXISTING');
        const occupied = await tx.tenantMembership.count({ where: { tenantId: mapping.tenantId, status: { in: ['ACTIVE', 'INVITED', 'SUSPENDED'] } } });
        if (mapping.seatQuantity < occupied) throw new BadRequestException('Mapped seats are below occupied memberships');
        if (approvedHash) {
          await tx.tenant.update({ where: { id: mapping.tenantId }, data: { industryCode: mapping.industryCode } });
          await this.subscriptions.create(tx, mapping.tenantId, selectionSchema.parse(mapping), false, actor, `reconcile:${hash}`, mapping.reason, new Date(mapping.startedAt), undefined, 'EXISTING');
        }
        results.push({ tenantId: mapping.tenantId, status: approvedHash ? 'CREATED' : 'WOULD_CREATE' });
      }
      return { mode: approvedHash ? 'APPLY' : 'DRY_RUN', mappingHash: hash, results };
    });
  }
}
