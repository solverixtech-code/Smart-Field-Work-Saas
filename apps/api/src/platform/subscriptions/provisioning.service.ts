import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { randomBytes, randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantService } from '../tenants/tenant.service';
import { TenantMembershipService } from '../tenants/tenant-membership.service';
import { CreateTenantFoundationDto, TenantSettingsInputDto, TenantBrandingInputDto } from '../tenants/dto/create-tenant-foundation.dto';
import { CommandActor, payloadHash, selectionSchema } from './subscription-contract';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTransactionService } from './subscription-transaction.service';

const provisionSchema = selectionSchema.extend({
  idempotencyKey: z.string().trim().min(1).max(200),
  requestId: z.string().trim().min(1).max(200).optional(),
  industryCode: z.string().trim().toUpperCase().min(1).max(100),
  trial: z.boolean().default(false),
  tenant: z.record(z.unknown()),
  owner: z.object({ email: z.string().trim().toLowerCase().email().max(254), fullName: z.string().trim().min(1).max(200) }).strict(),
}).strict();
const receiptSelect = {
  id: true, tenantId: true, subscriptionId: true, ownerMembershipId: true, createdAt: true,
  events: { select: { id: true, kind: true }, orderBy: { kind: 'asc' as const } },
} satisfies Prisma.TenantProvisioningSelect;

@Injectable()
export class ProvisioningService {
  constructor(private readonly prisma: PrismaService, private readonly transactions: SubscriptionTransactionService, private readonly tenants: TenantService, private readonly memberships: TenantMembershipService, private readonly subscriptions: SubscriptionService) {}

  async provision(raw: unknown, actor: CommandActor) {
    const input = provisionSchema.parse(raw);
    const tenant = plainToInstance(CreateTenantFoundationDto, input.tenant);
    tenant.slug = typeof tenant.slug === 'string' ? tenant.slug.trim().toLowerCase() : tenant.slug;
    tenant.displayName = typeof tenant.displayName === 'string' ? tenant.displayName.trim() : tenant.displayName;
    tenant.settings ??= new TenantSettingsInputDto();
    tenant.branding ??= new TenantBrandingInputDto();
    if ((await validate(tenant, { whitelist: true, forbidNonWhitelisted: true })).length) throw new BadRequestException('Invalid Tenant foundation input');
    if (tenant.status !== 'DRAFT' && tenant.status !== 'ACTIVE') throw new BadRequestException('Provisioning supports only draft or active Tenant input');
    // Provisioning owns activation; invited membership still blocks workspace access.
    tenant.status = 'ACTIVE';
    tenant.primaryDomain = tenant.primaryDomain?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || undefined;
    for (const key of ['legalName', 'websiteUrl', 'description'] as const) tenant[key] = tenant[key]?.trim() || undefined;
    const hash = payloadHash({ ...input, tenant, requestId: undefined, actorUserId: actor.userId });
    return this.transactions.run(`provision:${input.idempotencyKey}`, async tx => {
      const replay = await tx.tenantProvisioning.findUnique({ where: { idempotencyKey: input.idempotencyKey }, select: { ...receiptSelect, payloadHash: true } });
      if (replay) {
        if (replay.payloadHash !== hash) throw new ConflictException('Idempotency key belongs to a different provisioning request');
        const { payloadHash: ignored, ...receipt } = replay;
        return receipt;
      }
      const industry = await tx.industryClassification.findUnique({ where: { code: input.industryCode }, select: { isActive: true } });
      if (!industry?.isActive) throw new BadRequestException('Select an active Industry classification');
      await this.transactions.lock(tx, `owner:${input.owner.email}`);
      const matches = await tx.user.findMany({ where: { email: { equals: input.owner.email, mode: 'insensitive' } }, select: { id: true, status: true }, take: 2 });
      if (matches.length > 1) throw new ConflictException('Owner identity requires reconciliation');
      let owner = matches[0];
      if (owner && owner.status !== 'ACTIVE') throw new ConflictException('Owner account is inactive');
      if (!owner) {
        owner = await tx.user.create({ data: {
          email: input.owner.email, fullName: input.owner.fullName, employeeCode: `OWNER_${randomUUID()}`,
          passwordHash: await argon2.hash(randomBytes(48).toString('base64url')),
          // Compatibility field only. Authority comes from the independent membership.
          role: 'SUPPORT', status: 'ACTIVE',
        }, select: { id: true, status: true } });
      }
      const created = await this.tenants.createTenantFoundation(tenant, tx);
      await tx.tenant.update({ where: { id: created.id }, data: { industryCode: input.industryCode } });
      const role = await tx.tenantRole.findUnique({ where: { tenantId_code: { tenantId: created.id, code: 'tenant_admin' } }, select: { id: true, isActive: true } });
      if (!role?.isActive) throw new ConflictException('Built-in tenant_admin role is unavailable; synchronize RBAC');
      const membership = await this.memberships.createMembership({ tenantId: created.id, userId: owner.id, tenantRoleId: role.id, status: 'INVITED', isPrimary: false, invitedByUserId: actor.userId }, tx);
      const sub = await this.subscriptions.create(tx, created.id, selectionSchema.parse(input), input.trial, actor, `provision:${input.idempotencyKey}`, 'Tenant provisioning', new Date(), input.requestId);
      return tx.tenantProvisioning.create({ data: {
        idempotencyKey: input.idempotencyKey, payloadHash: hash, tenantId: created.id, subscriptionId: sub.id,
        ownerMembershipId: membership.id, actorUserId: actor.userId, requestId: input.requestId,
        events: { create: [{ kind: 'OWNER_INVITATION' }, { kind: 'TENANT_INITIALIZED' }] },
      }, select: receiptSelect });
    });
  }

  async accept(id: string, actor: CommandActor) {
    return this.transactions.run(`invitation:${id}`, async tx => {
      const invitation = await tx.tenantProvisioning.findUnique({ where: { id }, select: { ownerMembershipId: true, tenantId: true, acceptedAt: true } });
      if (!invitation) throw new NotFoundException('Invitation not found');
      await tx.$queryRaw`SELECT id FROM "TenantMembership" WHERE id = ${invitation.ownerMembershipId} FOR UPDATE`;
      const member = await tx.tenantMembership.findUnique({ where: { id: invitation.ownerMembershipId }, select: { userId: true, status: true, tenant: { select: { status: true } }, user: { select: { status: true } } } });
      if (!member || member.userId !== actor.userId) throw new ForbiddenException('Invitation belongs to another user');
      if (member.user.status !== 'ACTIVE' || member.tenant.status !== 'ACTIVE') throw new ForbiddenException('Owner or Tenant is inactive');
      if (invitation.acceptedAt) return { membershipId: invitation.ownerMembershipId, acceptedAt: invitation.acceptedAt };
      if (member.status !== 'INVITED') throw new ConflictException('Membership is no longer invited');
      const now = new Date();
      await tx.tenantMembership.update({ where: { id: invitation.ownerMembershipId }, data: { status: 'ACTIVE', activatedAt: now, joinedAt: now } });
      await tx.tenantProvisioning.update({ where: { id }, data: { acceptedAt: now } });
      return { membershipId: invitation.ownerMembershipId, acceptedAt: now };
    });
  }

  industries() {
    return this.prisma.industryClassification.findMany({ where: { isActive: true }, select: { code: true, name: true }, orderBy: { code: 'asc' } });
  }
}
