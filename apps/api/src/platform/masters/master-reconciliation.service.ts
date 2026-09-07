import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PrismaService } from "../../persistence/prisma.service";
import { jsonValue, payloadHash } from "../subscriptions/subscription-contract";
import {
  masterCode,
  masterDefinitionSelect,
  masterId,
  masterLabel,
  masterPage,
  masterReason,
  masterValueSelect,
  MasterScope,
} from "./master-contract";
import { MasterSeedService } from "./master-seed.service";
import { MasterTransactionService } from "./master-transaction.service";
import { EffectiveMasterService } from "./effective-master.service";
import { MASTER_SEED_VALUES } from "./master-seed-catalog";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const masterLegacyMappings = masterReason
  .extend({
    mappings: z
      .array(
        z
          .object({
            legacyRecordId: masterId,
            legacyHash: hash,
            targetValueId: masterId,
            definitionCode: masterCode,
            scope: z.discriminatedUnion("kind", [
              z.object({ kind: z.literal("SYSTEM") }).strict(),
              z
                .object({ kind: z.literal("TENANT"), tenantId: masterId })
                .strict(),
              z
                .object({ kind: z.literal("INDUSTRY"), versionId: masterId })
                .strict(),
            ]),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .superRefine(({ mappings }, ctx) => {
    if (
      new Set(mappings.map((m) => m.legacyRecordId)).size !== mappings.length ||
      new Set(mappings.map((m) => m.targetValueId)).size !== mappings.length
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate legacy or target identity",
      });
  });
const legacySelect = {
  id: true,
  category: true,
  code: true,
  name: true,
  description: true,
  displayColor: true,
  sortOrder: true,
  isActive: true,
  isSystemDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MasterRecordSelect;

@Injectable()
export class MasterReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seed: MasterSeedService,
    private readonly transactions: MasterTransactionService,
    private readonly effective: EffectiveMasterService,
  ) {}

  async report(actorId: string, input: unknown = {}) {
    await this.seed.authorize(actorId, false);
    const { page, limit } = masterPage.omit({ search: true }).parse(input);
    const [summary, rows] = await Promise.all([
      this.seed.legacyReport(actorId),
      this.prisma.masterRecord.findMany({
        select: {
          ...legacySelect,
          reconciliation: {
            select: { masterValueId: true, mappingHash: true },
          },
        },
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      ...summary,
      page,
      limit,
      items: rows.map(({ reconciliation, ...row }) => ({
        ...row,
        legacyHash: payloadHash(jsonValue(row)),
        reconciliation,
      })),
    };
  }

  async run(input: unknown, actorId: string, approvedHash?: string) {
    await this.seed.authorize(actorId, approvedHash !== undefined);
    const parsed = masterLegacyMappings.parse(input);
    const command = {
      ...parsed,
      mappings: [...parsed.mappings].sort((a, b) =>
        a.legacyRecordId < b.legacyRecordId
          ? -1
          : a.legacyRecordId > b.legacyRecordId
            ? 1
            : 0,
      ),
    };
    const reviewedHash = payloadHash(command);
    if (approvedHash !== undefined && approvedHash !== reviewedHash)
      throw new BadRequestException("Reviewed legacy mapping hash mismatch");
    return this.transactions.run("legacy-reconciliation", async (tx) => {
      const results: {
        legacyRecordId: string;
        masterValueId: string;
        status: "CREATE" | "LINK" | "NOOP";
      }[] = [];
      for (const mapping of command.mappings) {
        await tx.$queryRaw`SELECT id FROM "MasterRecord" WHERE id=${mapping.legacyRecordId} FOR UPDATE`;
        const legacy = await tx.masterRecord.findUnique({
          where: { id: mapping.legacyRecordId },
          select: legacySelect,
        });
        if (!legacy) throw new NotFoundException("Legacy Master row not found");
        if (payloadHash(jsonValue(legacy)) !== mapping.legacyHash)
          throw new ConflictException("Legacy row changed since review");
        if (legacy.category !== mapping.definitionCode)
          throw new ConflictException(
            "Legacy category cannot be reclassified by this tool",
          );
        // Legacy rules, Tailwind colors, invalid codes or labels are never silently transformed.
        const label = masterLabel.parse({
          name: legacy.name,
          description: legacy.description,
          displayColor: legacy.displayColor,
          sortOrder: legacy.sortOrder,
          isActive: legacy.isActive,
        });
        if (
          !/^[A-Z][A-Z0-9_]{1,63}$/.test(legacy.code) ||
          payloadHash(label) !==
            payloadHash({
              name: legacy.name,
              description: legacy.description,
              displayColor: legacy.displayColor,
              sortOrder: legacy.sortOrder,
              isActive: legacy.isActive,
            })
        )
          throw new ConflictException(
            "Legacy label requires explicit source cleanup before review",
          );
        const mappingHash = payloadHash(mapping);
        const old = await tx.masterLegacyReconciliation.findUnique({
          where: { legacyRecordId: legacy.id },
          select: { mappingHash: true, masterValueId: true },
        });
        if (old) {
          if (
            old.mappingHash !== mappingHash ||
            old.masterValueId !== mapping.targetValueId
          )
            throw new ConflictException(
              "Legacy row already reconciled differently",
            );
          results.push({
            legacyRecordId: legacy.id,
            masterValueId: old.masterValueId,
            status: "NOOP",
          });
          continue;
        }
        let definition = await tx.masterDefinition.findUnique({
          where: { code: mapping.definitionCode },
          select: {
            id: true,
            status: true,
            allowTenantCreate: true,
            allowIndustryDefaults: true,
          },
        });
        if (!definition || definition.status !== "ACTIVE")
          throw new ConflictException(
            "Approved active Master definition required",
          );
        const scope: MasterScope = mapping.scope;
        await this.transactions.lock(tx, scope, definition.id);
        definition = await tx.masterDefinition.findUniqueOrThrow({
          where: { id: definition.id },
          select: masterDefinitionSelect,
        });
        if (definition.status !== "ACTIVE")
          throw new ConflictException(
            "Approved active Master definition required",
          );
        if (
          ["target_metric_type", "target_type"].includes(
            mapping.definitionCode,
          ) &&
          !MASTER_SEED_VALUES.some(
            (value) =>
              value.definitionCode === mapping.definitionCode &&
              value.code === legacy.code,
          )
        )
          throw new ConflictException(
            "Closed Master catalog cannot accept a legacy extension",
          );
        const linked = await tx.masterLegacyReconciliation.findUnique({
          where: { masterValueId: mapping.targetValueId },
          select: { legacyRecordId: true },
        });
        if (linked)
          throw new ConflictException(
            "Explicit target already reconciles another legacy row",
          );
        let versionId: string | null = null;
        if (scope.kind === "TENANT") {
          versionId = (
            await this.effective.definition(
              tx,
              scope.tenantId,
              mapping.definitionCode,
              true,
            )
          ).versionId;
          if (!definition.allowTenantCreate)
            throw new ConflictException(
              "Tenant creation prohibited by definition",
            );
        }
        if (scope.kind === "INDUSTRY" && !definition.allowIndustryDefaults)
          throw new ConflictException(
            "Industry defaults prohibited by definition",
          );
        const content = {
          ...label,
          definitionId: definition.id,
          source: scope.kind,
          code: legacy.code,
          tenantId: scope.kind === "TENANT" ? scope.tenantId : null,
          industryTemplateVersionId:
            scope.kind === "INDUSTRY" ? scope.versionId : null,
        };
        const target = await tx.masterValue.findUnique({
          where: { id: mapping.targetValueId },
          select: masterValueSelect,
        });
        if (target) {
          const { id, revision, ...existing } = target;
          if (
            !id ||
            revision < 1 ||
            payloadHash(existing) !== payloadHash(content)
          )
            throw new ConflictException(
              "Explicit target does not match reviewed legacy content and scope",
            );
        }
        const collisions: Prisma.MasterValueWhereInput[] = [
          { source: "SYSTEM" },
        ];
        if (scope.kind === "SYSTEM") collisions.push({});
        if (scope.kind === "TENANT") {
          collisions.push({ source: "TENANT", tenantId: scope.tenantId });
          if (versionId)
            collisions.push({
              source: "INDUSTRY",
              industryTemplateVersionId: versionId,
            });
        }
        if (scope.kind === "INDUSTRY")
          collisions.push({
            source: "INDUSTRY",
            industryTemplateVersionId: scope.versionId,
          });
        if (
          await tx.masterValue.count({
            where: {
              id: { not: mapping.targetValueId },
              definitionId: definition.id,
              code: legacy.code,
              OR: collisions,
            },
          })
        )
          throw new ConflictException(
            "Legacy mapping code collision; explicit matching target required",
          );
        if (approvedHash !== undefined) {
          if (!target)
            await tx.masterValue.create({
              data: {
                ...content,
                id: mapping.targetValueId,
                createdByUserId: actorId,
              },
              select: { id: true },
            });
          await tx.masterLegacyReconciliation.create({
            data: {
              legacyRecordId: legacy.id,
              masterValueId: mapping.targetValueId,
              mappingHash,
              actorUserId: actorId,
            },
            select: { legacyRecordId: true },
          });
          await tx.auditLog.create({
            data: {
              actorUserId: actorId,
              tenantId: content.tenantId,
              action: "master.legacy.reconcile",
              entityType: "MasterLegacyReconciliation",
              entityId: legacy.id,
              beforeJson: jsonValue(legacy),
              afterJson: jsonValue({
                mapping,
                reviewedHash,
                reason: command.reason,
                requestId: command.requestId,
              }),
            },
            select: { id: true },
          });
        }
        results.push({
          legacyRecordId: legacy.id,
          masterValueId: mapping.targetValueId,
          status: target ? "LINK" : "CREATE",
        });
      }
      return {
        mode: approvedHash === undefined ? "DRY_RUN" : "APPLY",
        reviewedHash,
        tableRetired: false,
        results,
      };
    });
  }
}
