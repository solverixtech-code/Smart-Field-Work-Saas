import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PrismaService } from "../../persistence/prisma.service";
import { jsonValue } from "../subscriptions/subscription-contract";
import { EffectiveMasterService } from "./effective-master.service";
import { MasterTransactionService } from "./master-transaction.service";
import {
  createMasterValue,
  masterCode,
  masterDefinitionSelect,
  masterId,
  masterOverride,
  masterOverrideSelect,
  masterPage,
  masterRevision,
  masterValueSelect,
  MasterScope,
  overrideScope,
  updateMasterDefinition,
  updateMasterValue,
  valueScope,
} from "./master-contract";

@Injectable()
export class MasterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: MasterTransactionService,
    private readonly effective: EffectiveMasterService,
  ) {}

  definitions() {
    return this.prisma.masterDefinition.findMany({
      select: masterDefinitionSelect,
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      take: 24,
    });
  }

  private revision(actual: number, expected: number) {
    if (actual !== expected)
      throw new ConflictException("MASTER_STALE_REVISION");
  }
  private async definition(
    tx: Prisma.TransactionClient,
    scope: MasterScope,
    code: string,
    write: boolean,
    allowInactive = false,
  ) {
    masterCode.parse(code);
    let definition = await tx.masterDefinition.findUnique({
      where: { code },
      select: masterDefinitionSelect,
    });
    if (!definition) throw new NotFoundException("Master definition not found");
    if (write) {
      await this.transactions.lock(tx, scope, definition.id);
      definition = await tx.masterDefinition.findUniqueOrThrow({
        where: { code },
        select: masterDefinitionSelect,
      });
    }
    if (scope.kind === "TENANT")
      await this.effective.definition(
        tx,
        scope.tenantId,
        code,
        write,
        allowInactive,
      );
    if (write && !allowInactive && definition.status !== "ACTIVE")
      throw new ConflictException("Master definition inactive");
    return definition;
  }

  async audit(
    tx: Prisma.TransactionClient,
    actorUserId: string,
    action: string,
    entityId: string,
    before: unknown,
    after: unknown,
    reason: string,
    requestId?: string,
    tenantId?: string,
  ) {
    masterId.parse(actorUserId);
    await tx.auditLog.create({
      data: {
        actorUserId,
        tenantId,
        action,
        entityType: "Master",
        entityId,
        beforeJson: jsonValue({ value: before }),
        afterJson: jsonValue({ value: after, reason, requestId }),
      },
      select: { id: true },
    });
  }

  list(scope: MasterScope, code: string, input: unknown) {
    const page = masterPage.parse(input);
    return this.prisma.$transaction(
      async (tx) => {
        const definition = await this.definition(tx, scope, code, false);
        const where: Prisma.MasterValueWhereInput = {
          ...valueScope(scope),
          definitionId: definition.id,
          ...(page.search
            ? {
                OR: [
                  { name: { contains: page.search, mode: "insensitive" } },
                  { code: { contains: page.search, mode: "insensitive" } },
                ],
              }
            : {}),
        };
        const [items, total] = await Promise.all([
          tx.masterValue.findMany({
            where,
            select: masterValueSelect,
            orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
            skip: (page.page - 1) * page.limit,
            take: page.limit,
          }),
          tx.masterValue.count({ where }),
        ]);
        return { definition, items, total, page: page.page, limit: page.limit };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  updateDefinition(code: string, input: unknown, actor: string) {
    masterCode.parse(code);
    const { expectedRevision, reason, requestId, ...data } =
      updateMasterDefinition.parse(input);
    return this.transactions.run(`definition:${code}`, async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MasterDefinition" WHERE code=${code} FOR UPDATE`;
      const old = await tx.masterDefinition.findUnique({
        where: { code },
        select: masterDefinitionSelect,
      });
      if (!old) throw new NotFoundException("Master definition not found");
      this.revision(old.revision, expectedRevision);
      // Closed metric/scope catalogs cannot be reopened through metadata APIs.
      if (
        ["target_metric_type", "target_type"].includes(code) &&
        (data.allowTenantCreate ||
          data.allowTenantEdit ||
          data.allowTenantDeactivate ||
          data.allowIndustryDefaults ||
          data.systemValuePolicy !== "LOCKED_IDENTITY")
      )
        throw new ConflictException("MASTER_CLOSED_CATALOG");
      const next = await tx.masterDefinition.update({
        where: { id: old.id, revision: expectedRevision },
        data: { ...data, revision: { increment: 1 } },
        select: masterDefinitionSelect,
      });
      await this.audit(
        tx,
        actor,
        "master.definition.update",
        old.id,
        old,
        next,
        reason,
        requestId,
      );
      return next;
    });
  }

  createValue(scope: MasterScope, code: string, input: unknown, actor: string) {
    const { reason, requestId, ...label } = createMasterValue.parse(input);
    valueScope(scope);
    return this.transactions.run(
      `value:${code}:${JSON.stringify(scope)}`,
      async (tx) => {
        const definition = await this.definition(tx, scope, code, true);
        if (scope.kind === "TENANT" && !definition.allowTenantCreate)
          throw new ForbiddenException("MASTER_TENANT_CREATE_POLICY");
        if (scope.kind === "INDUSTRY" && !definition.allowIndustryDefaults)
          throw new ForbiddenException("MASTER_INDUSTRY_POLICY");
        const data = {
          ...label,
          definitionId: definition.id,
          source: scope.kind,
          tenantId: scope.kind === "TENANT" ? scope.tenantId : null,
          industryTemplateVersionId:
            scope.kind === "INDUSTRY" ? scope.versionId : null,
          createdByUserId: actor,
        };
        const next = await tx.masterValue.create({
          data,
          select: masterValueSelect,
        });
        await this.audit(
          tx,
          actor,
          "master.value.create",
          next.id,
          null,
          next,
          reason,
          requestId,
          data.tenantId ?? undefined,
        );
        return next;
      },
    );
  }

  updateValue(
    scope: MasterScope,
    valueId: string,
    input: unknown,
    actor: string,
  ) {
    masterId.parse(valueId);
    const { expectedRevision, reason, requestId, ...data } =
      updateMasterValue.parse(input);
    return this.transactions.run(`value:${valueId}`, async (tx) => {
      let old = await tx.masterValue.findFirst({
        where: { id: valueId, ...valueScope(scope) },
        select: {
          ...masterValueSelect,
          definition: { select: { code: true } },
        },
      });
      if (!old) throw new NotFoundException("Master value not found");
      const definition = await this.definition(
        tx,
        scope,
        old.definition.code,
        true,
      );
      old = await tx.masterValue.findFirstOrThrow({
        where: { id: valueId, ...valueScope(scope) },
        select: {
          ...masterValueSelect,
          definition: { select: { code: true } },
        },
      });
      this.revision(old.revision, expectedRevision);
      if (scope.kind === "TENANT") {
        if (
          !definition.allowTenantEdit &&
          (data.name !== old.name ||
            data.description !== old.description ||
            data.displayColor !== old.displayColor ||
            data.sortOrder !== old.sortOrder)
        )
          throw new ForbiddenException("MASTER_TENANT_EDIT_POLICY");
        if (!definition.allowTenantDeactivate && data.isActive !== old.isActive)
          throw new ForbiddenException("MASTER_TENANT_HIDE_POLICY");
      }
      const next = await tx.masterValue.update({
        where: { id: valueId, revision: expectedRevision },
        data: { ...data, revision: { increment: 1 } },
        select: masterValueSelect,
      });
      await this.audit(
        tx,
        actor,
        "master.value.update",
        valueId,
        old,
        next,
        reason,
        requestId,
        scope.kind === "TENANT" ? scope.tenantId : undefined,
      );
      return next;
    });
  }

  overrides(scope: Exclude<MasterScope, { kind: "SYSTEM" }>, input: unknown) {
    const { page, limit } = masterPage.omit({ search: true }).parse(input);
    return this.prisma.$transaction(
      async (tx) => {
        const modules =
          scope.kind === "TENANT"
            ? (await this.effective.context(tx, scope.tenantId)).modules
            : null;
        return tx.masterValueOverride.findMany({
          where: {
            ...overrideScope(scope),
            ...(modules
              ? {
                  inheritedMasterValue: {
                    definition: {
                      OR: [
                        { moduleCode: null },
                        { moduleCode: { in: [...modules] } },
                      ],
                    },
                  },
                }
              : {}),
          },
          select: masterOverrideSelect,
          orderBy: { id: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  setOverride(
    scope: Exclude<MasterScope, { kind: "SYSTEM" }>,
    valueId: string,
    input: unknown,
    actor: string,
  ) {
    const command = masterOverride.parse(input);
    return this.mutateOverride(scope, valueId, command, actor, false);
  }
  removeOverride(
    scope: Exclude<MasterScope, { kind: "SYSTEM" }>,
    valueId: string,
    input: unknown,
    actor: string,
  ) {
    return this.mutateOverride(
      scope,
      valueId,
      {
        ...masterRevision.parse(input),
        displayName: null,
        displayColor: null,
        sortOrder: null,
        isHidden: false,
      },
      actor,
      true,
    );
  }
  private mutateOverride(
    scope: Exclude<MasterScope, { kind: "SYSTEM" }>,
    valueId: string,
    command: z.infer<typeof masterOverride>,
    actor: string,
    remove: boolean,
  ) {
    masterId.parse(valueId);
    overrideScope(scope);
    return this.transactions.run(
      `override:${JSON.stringify(scope)}:${valueId}`,
      async (tx) => {
        const value = await tx.masterValue.findUnique({
          where: { id: valueId },
          select: {
            ...masterValueSelect,
            definition: { select: { code: true } },
          },
        });
        if (
          !value ||
          value.source === "TENANT" ||
          (scope.kind === "INDUSTRY" && value.source !== "SYSTEM")
        )
          throw new NotFoundException("Inherited Master value not found");
        // Lock scope before checking exact ancestry, closing migration/create races.
        await this.definition(tx, scope, value.definition.code, true, remove);
        if (scope.kind === "TENANT" && value.source === "INDUSTRY") {
          const assignment =
            await tx.tenantIndustryTemplateAssignment.findUnique({
              where: { tenantId: scope.tenantId },
              select: { industryTemplateVersionId: true },
            });
          if (
            assignment?.industryTemplateVersionId !==
            value.industryTemplateVersionId
          )
            throw new NotFoundException("Inherited Master value not found");
        }
        const old = await tx.masterValueOverride.findFirst({
          where: { ...overrideScope(scope), inheritedMasterValueId: valueId },
          select: masterOverrideSelect,
        });
        this.revision(old?.revision ?? 0, command.expectedRevision);
        if (remove && !old)
          throw new NotFoundException("Master override not found");
        const data = {
          displayName: command.displayName,
          displayColor: command.displayColor,
          sortOrder: command.sortOrder,
          isHidden: command.isHidden,
        };
        const next =
          remove && old
            ? (await tx.masterValueOverride.delete({
                where: { id: old.id, revision: command.expectedRevision },
                select: { id: true },
              }),
              null)
            : old
              ? await tx.masterValueOverride.update({
                  where: { id: old.id, revision: command.expectedRevision },
                  data: { ...data, revision: { increment: 1 } },
                  select: masterOverrideSelect,
                })
              : await tx.masterValueOverride.create({
                  data: {
                    ...data,
                    inheritedMasterValueId: valueId,
                    scope: scope.kind,
                    tenantId: scope.kind === "TENANT" ? scope.tenantId : null,
                    industryTemplateVersionId:
                      scope.kind === "INDUSTRY" ? scope.versionId : null,
                    createdByUserId: actor,
                  },
                  select: masterOverrideSelect,
                });
        await this.audit(
          tx,
          actor,
          remove ? "master.override.remove" : "master.override.set",
          old?.id ?? next?.id ?? valueId,
          old,
          next,
          command.reason,
          command.requestId,
          scope.kind === "TENANT" ? scope.tenantId : undefined,
        );
        return { override: next };
      },
    );
  }
}
