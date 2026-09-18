import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../persistence/prisma.service";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import {
  territorySelect,
  territoryBoundaryPointSelect,
  territoryMemberSelect,
  territoryTargetSelect,
  TerritoryRow,
} from "./territory-select";

export const territoryConflict = (code: string): never => {
  throw new ConflictException({
    statusCode: 409,
    error: "Conflict",
    message: code,
    code,
  });
};

@Injectable()
export class TerritoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(
    principal: RequestPrincipal,
    write: boolean,
    work: (tx: Prisma.TransactionClient, policy: CrmPolicy) => Promise<T>,
  ): Promise<T> {
    const policy = new CrmPolicy(principal);
    return await this.prisma.$transaction(async (tx) => {
      if (write) {
        await tx.$queryRaw`SELECT m8_lock_tenant(${policy.scope.tenantId})::text`;
        await tx.$queryRaw`SELECT id FROM "TenantMembership" WHERE id=${policy.scope.membershipId} AND "tenantId"=${policy.scope.tenantId} FOR SHARE`;
      }
      return await work(tx, policy);
    });
  }

  async territory(
    tx: Prisma.TransactionClient,
    policy: CrmPolicy,
    id: string,
    lock = false,
  ): Promise<TerritoryRow> {
    if (lock) {
      await tx.$queryRaw`SELECT id FROM "Territory" WHERE id=${id} AND "tenantId"=${policy.scope.tenantId} FOR UPDATE`;
    }
    const row = await tx.territory.findFirst({
      where: {
        id,
        tenantId: policy.scope.tenantId,
        deletedAt: null,
      },
      select: territorySelect,
    });
    if (!row) {
      throw new NotFoundException("CRM_TERRITORY_NOT_FOUND");
    }
    return row;
  }

  async generateCode(tx: Prisma.TransactionClient, tenantId: string): Promise<string> {
    const count = await tx.territory.count({ where: { tenantId } });
    return `T${String(count + 1).padStart(3, "0")}`;
  }

  async ensureMembership(
    tx: Prisma.TransactionClient,
    policy: CrmPolicy,
    membershipId: string,
  ) {
    const membership = await tx.tenantMembership.findFirst({
      where: {
        id: membershipId,
        tenantId: policy.scope.tenantId,
        status: "ACTIVE",
      },
    });
    if (!membership) {
      throw new NotFoundException("CRM_MEMBERSHIP_NOT_FOUND");
    }
    return membership;
  }

  async ensureAccount(
    tx: Prisma.TransactionClient,
    policy: CrmPolicy,
    accountId: string,
  ) {
    const account = await tx.account.findFirst({
      where: {
        id: accountId,
        tenantId: policy.scope.tenantId,
        deletedAt: null,
      },
    });
    if (!account) {
      throw new NotFoundException("CRM_ACCOUNT_NOT_FOUND");
    }
    return account;
  }

  async audit(
    tx: Prisma.TransactionClient,
    policy: CrmPolicy,
    action: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ) {
    await tx.auditLog.create({
      data: {
        tenantId: policy.scope.tenantId,
        tenantMembershipId: policy.scope.membershipId,
        action,
        entityType: "Territory",
        entityId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }
}
