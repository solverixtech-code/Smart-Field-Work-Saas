import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../persistence/prisma.service';
import { addDays, CommandActor, jsonValue, payloadHash, periodEnd, readRules, Selection, selectionSchema, subscriptionAccess, subscriptionCommandSchema } from './subscription-contract';
import { commercialVersionSelect, SubscriptionPolicyService } from './subscription-policy.service';
import { SubscriptionTransactionService } from './subscription-transaction.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService, private readonly transactions: SubscriptionTransactionService, private readonly policy: SubscriptionPolicyService) {}

  async get(tenantId: string) {
    const sub = await this.prisma.tenantSubscription.findUnique({ where: { tenantId }, include: { planVersion: { select: commercialVersionSelect } } });
    if (!sub) throw new NotFoundException('Subscription not found; legacy Tenant requires explicit reconciliation');
    const { planVersion, ...subscription } = sub;
    return { ...subscription, access: subscriptionAccess(sub, readRules(planVersion.commercialRule), new Date()), moduleCodes: planVersion.modules.filter(m => m.module.status === 'ACTIVE' || m.module.status === 'BETA').map(m => m.module.code) };
  }

  async history(tenantId: string, page = 1, limit = 25) {
    const where = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.subscriptionChange.findMany({ where, orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
      this.prisma.subscriptionChange.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(tx: Prisma.TransactionClient, tenantId: string, input: Selection, trial: boolean, actor: CommandActor, key: string, reason: string, now: Date, requestId?: string, audience: 'NEW' | 'EXISTING' = 'NEW') {
    const { rules } = await this.policy.select(tx, input, audience, trial);
    const sub = await tx.tenantSubscription.create({ data: {
      tenantId, ...input, status: trial ? 'TRIALING' : 'ACTIVE', startedAt: now,
      currentPeriodStart: now, currentPeriodEnd: periodEnd(now, input.billingCycle),
      trialEndsAt: trial ? addDays(now, rules.trialDurationDays ?? 0) : null,
    } });
    await tx.subscriptionChange.create({ data: {
      subscriptionId: sub.id, tenantId, idempotencyKey: key, payloadHash: payloadHash(input), kind: 'CREATE', reason,
      fromPlanVersionId: sub.planVersionId, toPlanVersionId: sub.planVersionId, fromStatus: sub.status, toStatus: sub.status,
      status: 'APPLIED', effectiveAt: now, appliedAt: now, actorUserId: actor.userId, requestId, revision: sub.revision,
      requestData: jsonValue(input), result: jsonValue(sub),
    } });
    return sub;
  }

  async command(tenantId: string, raw: unknown, actor: CommandActor) {
    const input = subscriptionCommandSchema.parse(raw);
    const hash = payloadHash({ ...input, requestId: undefined, actorUserId: actor.userId });
    return this.transactions.run(`subscription:${tenantId}`, async tx => {
      // Also lock the actual row against non-cooperating writers.
      await tx.$queryRaw`SELECT id FROM "TenantSubscription" WHERE "tenantId" = ${tenantId} FOR UPDATE`;
      const sub = await tx.tenantSubscription.findUnique({ where: { tenantId }, include: { planVersion: { select: commercialVersionSelect } } });
      if (!sub) throw new NotFoundException('Subscription not found');
      const replay = await tx.subscriptionChange.findUnique({ where: { subscriptionId_idempotencyKey: { subscriptionId: sub.id, idempotencyKey: input.idempotencyKey } } });
      if (replay) {
        if (replay.payloadHash !== hash) throw new ConflictException('Idempotency key belongs to a different command');
        return replay.result;
      }
      if (sub.revision !== input.expectedRevision) throw new ConflictException('Subscription revision changed');
      if (sub.status === 'CANCELLED') throw new ConflictException('Cancelled subscription is terminal');
      const now = new Date();
      const rules = readRules(sub.planVersion.commercialRule);
      let update: Prisma.TenantSubscriptionUncheckedUpdateInput = {};
      let scheduled = false;
      let effectiveAt = now;
      let transitionEffectiveAt = now;
      const pending = await tx.subscriptionChange.findFirst({ where: { subscriptionId: sub.id, status: 'SCHEDULED' } });
      switch (input.action) {
        case 'CHANGE_PLAN': {
          if (!['ACTIVE', 'TRIALING'].includes(sub.status)) throw new BadRequestException('Commercial changes require an active or trialing subscription');
          if (pending) throw new ConflictException('A scheduled change already exists');
          if (sub.planVersionId === input.planVersionId && sub.billingCycle === input.billingCycle && sub.seatQuantity === input.seatQuantity) throw new BadRequestException('Commercial selection is unchanged');
          const { version } = await this.policy.select(tx, input, 'EXISTING', sub.status === 'TRIALING');
          this.policy.change(sub, sub.planVersion, version, input, now);
          const occupied = await tx.tenantMembership.count({ where: { tenantId, status: { in: ['ACTIVE', 'INVITED', 'SUSPENDED'] } } });
          if (input.seatQuantity < occupied) throw new BadRequestException('Seat quantity is below occupied memberships');
          scheduled = rules.changeEffectiveTiming === 'NEXT_BILLING_CYCLE';
          if (scheduled && sub.status !== 'ACTIVE') throw new BadRequestException('Activate the trial before scheduling a billing-cycle Plan change');
          effectiveAt = scheduled ? sub.currentPeriodEnd : now;
          if (!scheduled) update = { planVersionId: input.planVersionId, billingCycle: input.billingCycle, seatQuantity: input.seatQuantity, currentPeriodStart: now, currentPeriodEnd: periodEnd(now, input.billingCycle) };
          break;
        }
        case 'SUSPEND':
          if (sub.status === 'SUSPENDED') throw new BadRequestException('Already suspended');
          update = { status: 'SUSPENDED', suspendedFromStatus: sub.status };
          break;
        case 'RESUME':
          if (sub.status !== 'SUSPENDED' || !sub.suspendedFromStatus) throw new BadRequestException('No suspended state to resume');
          update = { status: sub.suspendedFromStatus, suspendedFromStatus: null };
          break;
        case 'CANCEL':
          if (!rules.cancellationAllowed) throw new BadRequestException('Cancellation is disabled by the pinned Plan');
          this.policy.commitment(sub, sub.planVersion, now);
          update = { status: 'CANCELLED', cancelledAt: now, suspendedFromStatus: null };
          if (pending) await tx.subscriptionChange.update({ where: { id: pending.id }, data: { status: 'CANCELLED' } });
          break;
        case 'ACTIVATE':
          if (!['TRIALING', 'PAST_DUE', 'GRACE'].includes(sub.status)) throw new BadRequestException('Activation requires trial or payment recovery; use RESUME for suspension');
          update = { status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd(now, sub.billingCycle), trialEndsAt: null, graceEndsAt: null };
          break;
        case 'PAST_DUE':
          if (!['ACTIVE', 'TRIALING', 'GRACE'].includes(sub.status)) throw new BadRequestException('Invalid past-due transition');
          update = { status: 'PAST_DUE' };
          break;
        case 'GRACE':
          if (sub.status !== 'PAST_DUE' || rules.gracePeriodDays === 0) throw new BadRequestException('Grace requires past-due status and a positive grace period');
          if (sub.graceEndsAt) throw new BadRequestException('Grace already granted for this payment period');
          update = { status: 'GRACE', graceEndsAt: addDays(now, rules.gracePeriodDays) };
          break;
        case 'APPLY_DUE': {
          if (sub.status === 'SUSPENDED') throw new BadRequestException('Suspended subscription cannot apply due changes');
          if (sub.status === 'TRIALING' && sub.trialEndsAt && sub.trialEndsAt <= now) {
            update = rules.autoConvertAfterTrial
              ? { status: 'ACTIVE', trialEndsAt: null, currentPeriodStart: now, currentPeriodEnd: periodEnd(now, sub.billingCycle) }
              : { status: 'PAST_DUE' };
          } else if (sub.status === 'GRACE' && sub.graceEndsAt && sub.graceEndsAt <= now) {
            update = { status: 'PAST_DUE' };
          } else if (sub.status === 'ACTIVE' && sub.currentPeriodEnd <= now) {
            update = rules.autoRenew
              ? { currentPeriodStart: sub.currentPeriodEnd, currentPeriodEnd: periodEnd(sub.currentPeriodEnd, sub.billingCycle) }
              : { status: 'PAST_DUE' };
          } else if (!pending || pending.effectiveAt > now) throw new BadRequestException('No lifecycle or scheduled change is due');
          if (pending && pending.effectiveAt <= now && (update.status ?? sub.status) === 'ACTIVE') {
            const target = selectionSchema.parse(pending.requestData);
            const { version } = await this.policy.select(tx, target, 'EXISTING');
            this.policy.change(sub, sub.planVersion, version, target, now);
            const occupied = await tx.tenantMembership.count({ where: { tenantId, status: { in: ['ACTIVE', 'INVITED', 'SUSPENDED'] } } });
            if (target.seatQuantity < occupied) throw new ConflictException('Scheduled seats are below occupied memberships');
            transitionEffectiveAt = pending.effectiveAt;
            update = { ...update, ...target, currentPeriodStart: pending.effectiveAt, currentPeriodEnd: periodEnd(pending.effectiveAt, target.billingCycle) };
            await tx.subscriptionChange.update({ where: { id: pending.id }, data: { status: 'APPLIED', appliedAt: now, revision: sub.revision + 1 } });
          } else if (Object.keys(update).length === 0) throw new BadRequestException('Scheduled change requires active subscription');
          break;
        }
      }
      // Scheduling itself consumes a revision, so competing commands cannot silently succeed.
      const updated = await tx.tenantSubscription.update({ where: { id: sub.id, revision: input.expectedRevision }, data: { ...update, revision: { increment: 1 } } });
      const result = jsonValue({ ...updated, scheduledChange: scheduled ? { effectiveAt, ...selectionSchema.parse(input) } : null });
      if (scheduled && input.action === 'CHANGE_PLAN') {
        await tx.subscriptionChange.create({ data: {
          subscriptionId: sub.id, tenantId, idempotencyKey: `internal:${randomUUID()}`, payloadHash: hash,
          kind: 'SCHEDULED_PLAN', reason: input.reason, fromPlanVersionId: sub.planVersionId, toPlanVersionId: input.planVersionId,
          fromStatus: sub.status, toStatus: sub.status, status: 'SCHEDULED', effectiveAt,
          actorUserId: actor.userId, requestId: input.requestId, revision: updated.revision,
          requestData: jsonValue(selectionSchema.parse(input)), result,
        } });
      }
      await tx.subscriptionChange.create({ data: {
        subscriptionId: sub.id, tenantId, idempotencyKey: input.idempotencyKey, payloadHash: hash, kind: input.action, reason: input.reason,
        fromPlanVersionId: sub.planVersionId, toPlanVersionId: updated.planVersionId, fromStatus: sub.status, toStatus: updated.status,
        status: 'APPLIED', effectiveAt: transitionEffectiveAt, appliedAt: now, actorUserId: actor.userId, requestId: input.requestId, revision: updated.revision,
        requestData: jsonValue(input), result,
      } });
      return result;
    });
  }
}
