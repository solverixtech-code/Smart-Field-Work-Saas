import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { PrismaService } from '../../persistence/prisma.service';
import { CommandActor } from './subscription-contract';
import { SubscriptionTransactionService } from './subscription-transaction.service';

const claimSchema = z.object({ attemptKey: z.string().trim().min(1).max(200) }).strict();
const finishSchema = z.discriminatedUnion('status', [
  z.object({ leaseToken: z.string().uuid(), status: z.literal('COMPLETED') }).strict(),
  z.object({ leaseToken: z.string().uuid(), status: z.literal('FAILED'), errorCode: z.string().regex(/^[A-Z0-9_]{1,100}$/) }).strict(),
]);

@Injectable()
export class ProvisioningEventService {
  constructor(private readonly prisma: PrismaService, private readonly transactions: SubscriptionTransactionService) {}

  async list(page: number, limit: number) {
    const where = { status: { in: ['PENDING', 'FAILED', 'PROCESSING'] as Array<'PENDING' | 'FAILED' | 'PROCESSING'> } };
    const [data, total] = await Promise.all([
      this.prisma.provisioningEvent.findMany({ where, select: { id: true, provisioningId: true, kind: true, schemaVersion: true, status: true, attemptCount: true, leaseEndsAt: true, lastErrorCode: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], skip: (page - 1) * limit, take: limit }),
      this.prisma.provisioningEvent.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  claim(id: string, raw: unknown, actor: CommandActor) {
    const input = claimSchema.parse(raw);
    return this.transactions.run(`event:${id}`, async tx => {
      const event = await tx.provisioningEvent.findUnique({ where: { id } });
      if (!event) throw new NotFoundException('Event not found');
      const previous = await tx.provisioningAttempt.findUnique({ where: { eventId_attemptKey: { eventId: id, attemptKey: input.attemptKey } } });
      if (previous && previous.actorUserId !== actor.userId) throw new ConflictException('Attempt belongs to another actor');
      const now = new Date();
      if (previous) {
        if (event.status !== 'PROCESSING' || event.leaseToken !== previous.leaseToken || !event.leaseEndsAt || event.leaseEndsAt <= now) throw new ConflictException('Attempt finished or expired; use a new attempt key');
      } else {
        if (event.status === 'COMPLETED') throw new ConflictException('Event already completed');
        if (event.status === 'PROCESSING' && event.leaseEndsAt && event.leaseEndsAt > now) throw new ConflictException('Event already leased');
        if (event.status === 'PROCESSING' && event.leaseToken) await tx.provisioningAttempt.update({ where: { leaseToken: event.leaseToken }, data: { status: 'FAILED', errorCode: 'LEASE_EXPIRED', finishedAt: now } });
      }
      const leaseToken = previous?.leaseToken ?? randomUUID();
      const leaseEndsAt = previous ? event.leaseEndsAt : new Date(now.getTime() + 300000);
      if (!previous) {
        await tx.provisioningAttempt.create({ data: { eventId: id, attemptKey: input.attemptKey, leaseToken, actorUserId: actor.userId } });
        await tx.provisioningEvent.update({ where: { id }, data: { status: 'PROCESSING', leaseToken, leaseEndsAt, lastErrorCode: null, attemptCount: { increment: 1 } } });
      }
      const provisioning = await tx.tenantProvisioning.findUniqueOrThrow({ where: { id: event.provisioningId }, select: { id: true, tenantId: true, ownerMembershipId: true, ownerMembership: { select: { user: { select: { id: true, email: true, fullName: true } } } } } });
      return { eventId: id, kind: event.kind, schemaVersion: event.schemaVersion, leaseToken, leaseEndsAt, provisioningId: provisioning.id, tenantId: provisioning.tenantId, ownerMembershipId: provisioning.ownerMembershipId, owner: provisioning.ownerMembership.user };
    });
  }

  finish(id: string, raw: unknown, actor: CommandActor) {
    const input = finishSchema.parse(raw);
    return this.transactions.run(`event:${id}`, async tx => {
      const event = await tx.provisioningEvent.findUnique({ where: { id } });
      const attempt = await tx.provisioningAttempt.findUnique({ where: { leaseToken: input.leaseToken } });
      if (!event || !attempt || attempt.eventId !== id) throw new NotFoundException('Event attempt not found');
      if (attempt.actorUserId !== actor.userId) throw new ConflictException('Attempt belongs to another actor');
      const errorCode = input.status === 'FAILED' ? input.errorCode : null;
      if (attempt.status !== 'PROCESSING') {
        if (attempt.status === input.status && attempt.errorCode === errorCode) return { eventId: id, status: attempt.status };
        throw new ConflictException('Attempt already resolved differently');
      }
      const now = new Date();
      if (event.leaseToken !== input.leaseToken || !event.leaseEndsAt || event.leaseEndsAt <= now) throw new ConflictException('Lease expired or superseded');
      await tx.provisioningAttempt.update({ where: { id: attempt.id }, data: { status: input.status, errorCode, finishedAt: now } });
      await tx.provisioningEvent.update({ where: { id }, data: { status: input.status, completedAt: input.status === 'COMPLETED' ? now : null, lastErrorCode: errorCode, leaseToken: null, leaseEndsAt: null } });
      return { eventId: id, status: input.status };
    });
  }
}
