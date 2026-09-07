import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../persistence/prisma.service";
import { EffectivePermissionService } from "../../common/security/effective-permission.service";
import { jsonValue, payloadHash } from "../subscriptions/subscription-contract";
import {
  masterDefinitionSelect,
  masterId,
  masterValueSelect,
} from "./master-contract";
import { MasterTransactionService } from "./master-transaction.service";
import { reviewApprovedMasterSeed } from "./master-seed-contract";

@Injectable()
export class MasterSeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: EffectivePermissionService,
    private readonly transactions: MasterTransactionService,
  ) {}

  async authorize(actorId: string, apply: boolean) {
    masterId.parse(actorId);
    const [actor, permissions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { status: true },
      }),
      this.permissions.resolvePlatformPermissions(actorId),
    ]);
    if (
      actor?.status !== "ACTIVE" ||
      !permissions.includes(
        apply ? "platform.masters.manage" : "platform.masters.view",
      )
    )
      throw new ForbiddenException("Active platform Master actor required");
  }

  async run(actorId: string, approvedHash?: string) {
    await this.authorize(actorId, approvedHash !== undefined);
    const { seed, reviewedHash } = reviewApprovedMasterSeed();
    if (approvedHash !== undefined && approvedHash !== reviewedHash)
      throw new BadRequestException("Reviewed Master seed hash mismatch");
    return this.transactions.run("seed", async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MasterDefinition" ORDER BY id FOR UPDATE`;
      const moduleCodes = seed.definitions.flatMap((d) =>
        d.moduleCode === null ? [] : [d.moduleCode],
      );
      const modules = await tx.platformModule.findMany({
        where: { code: { in: moduleCodes } },
        select: { code: true },
      });
      if (new Set(moduleCodes).size !== modules.length)
        throw new ConflictException(
          "Synchronize the canonical Module registry before seeding Masters",
        );
      const definitions = await tx.masterDefinition.findMany({
        select: masterDefinitionSelect,
      });
      const existing = new Map(definitions.map((d) => [d.code, d]));
      const results: {
        kind: "DEFINITION" | "VALUE";
        code: string;
        status: "CREATE" | "NOOP";
      }[] = [];
      for (const definition of seed.definitions) {
        const old = existing.get(definition.code);
        if (old) {
          const { id, revision, ...content } = old;
          if (
            !id ||
            revision < 1 ||
            payloadHash(content) !== payloadHash(definition)
          )
            throw new ConflictException(
              `Master definition seed conflict: ${definition.code}`,
            );
        }
        results.push({
          kind: "DEFINITION",
          code: definition.code,
          status: old ? "NOOP" : "CREATE",
        });
      }
      const seedIdentities = seed.values.flatMap((value) => {
        const definition = existing.get(value.definitionCode);
        return definition
          ? [{ definitionId: definition.id, code: value.code }]
          : [];
      });
      const values = await tx.masterValue.findMany({
        where: {
          source: "SYSTEM",
          OR: seedIdentities,
        },
        select: {
          ...masterValueSelect,
          definition: { select: { code: true } },
        },
      });
      const byCode = new Map(
        values.map((v) => [`${v.definition.code}/${v.code}`, v]),
      );
      const lowerValues = await tx.masterValue.findMany({
        where: {
          source: { not: "SYSTEM" },
          OR: seedIdentities,
        },
        take: 1,
        select: { code: true, definition: { select: { code: true } } },
      });
      const lowerCodes = new Set(
        lowerValues.map((v) => `${v.definition.code}/${v.code}`),
      );
      for (const value of seed.values) {
        const key = `${value.definitionCode}/${value.code}`,
          old = byCode.get(key);
        if (lowerCodes.has(key))
          throw new ConflictException(
            `Master inherited seed collision: ${key}`,
          );
        if (old) {
          const { id, revision, definitionId, definition, ...content } = old;
          if (
            !id ||
            !definitionId ||
            revision < 1 ||
            payloadHash({ ...content, definitionCode: definition.code }) !==
              payloadHash(value)
          )
            throw new ConflictException(`Master value seed conflict: ${key}`);
        }
        results.push({
          kind: "VALUE",
          code: key,
          status: old ? "NOOP" : "CREATE",
        });
      }
      if (approvedHash !== undefined) {
        for (const definition of seed.definitions)
          if (!existing.has(definition.code)) {
            const created = await tx.masterDefinition.create({
              data: definition,
              select: masterDefinitionSelect,
            });
            existing.set(created.code, created);
          }
        for (const value of seed.values)
          if (!byCode.has(`${value.definitionCode}/${value.code}`)) {
            const { definitionCode, ...data } = value;
            const definition = existing.get(definitionCode);
            if (!definition)
              throw new ConflictException("Missing approved Master definition");
            await tx.masterValue.create({
              data: {
                ...data,
                definitionId: definition.id,
                createdByUserId: actorId,
              },
              select: { id: true },
            });
          }
        if (results.some((r) => r.status === "CREATE"))
          await tx.auditLog.create({
            data: {
              actorUserId: actorId,
              action: "master.seed.apply",
              entityType: "MasterSeed",
              entityId: reviewedHash,
              afterJson: jsonValue({
                provenance: seed.provenance,
                reviewedHash,
                results,
              }),
            },
            select: { id: true },
          });
      }
      return {
        mode: approvedHash === undefined ? "DRY_RUN" : "APPLY",
        reviewedHash,
        definitions: 24,
        systemValues: 44,
        classification: {
          fixtureCategories: 44,
          generic: 24,
          domainCommercial: 9,
          policy: 10,
          deprecated: 1,
          unclassified: 0,
          productionSystemValues: 44,
          definitionOnlyCandidates: 29,
          demoOnlyCandidates: 13,
        },
        created:
          approvedHash === undefined
            ? 0
            : results.filter((r) => r.status === "CREATE").length,
        wouldCreate: results.filter((r) => r.status === "CREATE").length,
        results,
      };
    });
  }

  async legacyReport(actorId: string) {
    await this.authorize(actorId, false);
    const groups = await this.prisma.masterRecord.groupBy({
      by: ["category", "isSystemDefault"],
      _count: { id: true },
      orderBy: { category: "asc" },
    });
    const migrated = await this.prisma.masterLegacyReconciliation.count();
    const rows = groups.reduce((total, row) => total + row._count.id, 0);
    return {
      mode: "DRY_RUN",
      tableRetired: false,
      migrated,
      rows,
      pending: rows - migrated,
      groups,
      decision: !rows
        ? "EMPTY_LEGACY_TABLE_RETAINED"
        : rows === migrated
          ? "RECONCILED_LEGACY_TABLE_RETAINED"
          : "EXPLICIT_OWNERSHIP_MAPPING_REQUIRED",
    };
  }
}
