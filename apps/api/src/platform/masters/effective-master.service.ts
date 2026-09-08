import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../persistence/prisma.service";
import { readEffectiveModules } from "../modules/effective-modules";
import {
  masterCode,
  masterDefinitionSelect,
  masterId,
  masterOverrideSelect,
  masterPage,
  masterValueSelect,
  MasterDefinitionRow,
  MasterOverrideRow,
  MasterValueRow,
} from "./master-contract";

export interface EffectiveMasterValue extends MasterValueRow {
  readonly selectable: boolean;
  readonly provenance: {
    readonly source: MasterValueRow["source"];
    readonly industryTemplateVersionId: string | null;
    readonly overrides: readonly {
      readonly id: string;
      readonly scope: MasterOverrideRow["scope"];
      readonly revision: number;
    }[];
  };
}
const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const rank = { SYSTEM: 0, INDUSTRY: 1, TENANT: 2 };

// Pure deterministic layering shared by selectable and historical rendering.
export function resolveMasterValues(
  definition: MasterDefinitionRow,
  values: readonly MasterValueRow[],
  overrides: readonly MasterOverrideRow[],
): EffectiveMasterValue[] {
  const codes = new Set<string>();
  const byValue = new Map<string, MasterOverrideRow[]>();
  for (const override of overrides) {
    const group = byValue.get(override.inheritedMasterValueId) ?? [];
    group.push(override);
    byValue.set(override.inheritedMasterValueId, group);
  }
  return values
    .map((value): EffectiveMasterValue => {
      if (codes.has(value.code))
        throw new ConflictException("MASTER_INHERITED_CODE_COLLISION");
      codes.add(value.code);
      let name = value.name,
        displayColor = value.displayColor,
        sortOrder = value.sortOrder,
        hidden = false;
      const applied: {
        id: string;
        scope: MasterOverrideRow["scope"];
        revision: number;
      }[] = [];
      const layers = [...(byValue.get(value.id) ?? [])].sort((a, b) =>
        compare(a.scope, b.scope),
      );
      if (new Set(layers.map((layer) => layer.scope)).size !== layers.length)
        throw new ConflictException("MASTER_DUPLICATE_OVERRIDE");
      for (const layer of layers) {
        if (definition.systemValuePolicy === "LOCKED_IDENTITY") continue;
        const industry = layer.scope === "INDUSTRY";
        if (industry && !definition.allowIndustryDefaults) continue;
        if (industry || definition.allowTenantEdit) {
          name = layer.displayName ?? name;
          displayColor = layer.displayColor ?? displayColor;
          sortOrder = layer.sortOrder ?? sortOrder;
        }
        if (industry || definition.allowTenantDeactivate)
          hidden = layer.isHidden;
        applied.push({
          id: layer.id,
          scope: layer.scope,
          revision: layer.revision,
        });
      }
      return {
        ...value,
        name,
        displayColor,
        sortOrder,
        selectable: value.isActive && !hidden && definition.status === "ACTIVE",
        provenance: {
          source: value.source,
          industryTemplateVersionId: value.industryTemplateVersionId,
          overrides: applied,
        },
      };
    })
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        rank[a.source] - rank[b.source] ||
        compare(a.code, b.code),
    );
}

@Injectable()
export class EffectiveMasterService {
  constructor(private readonly prisma: PrismaService) {}

  async context(tx: Prisma.TransactionClient, tenantId: string, write = false) {
    masterId.parse(tenantId);
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");
    const [assignment, commercial] = await Promise.all([
      tx.tenantIndustryTemplateAssignment.findUnique({
        where: { tenantId },
        select: { industryTemplateVersionId: true },
      }),
      readEffectiveModules(tx, tenantId, new Date(), write),
    ]);
    const modules = new Set(commercial.modules.map(m => m.code));
    return {
      versionId: assignment?.industryTemplateVersionId ?? null,
      modules,
    };
  }

  async definition(
    tx: Prisma.TransactionClient,
    tenantId: string,
    code: string,
    write = false,
    historical = false,
  ) {
    masterCode.parse(code);
    const context = await this.context(tx, tenantId, write);
    const definition = await tx.masterDefinition.findUnique({
      where: { code },
      select: masterDefinitionSelect,
    });
    if (
      !definition ||
      (!historical && definition.status !== "ACTIVE") ||
      (definition.moduleCode !== null &&
        !context.modules.has(definition.moduleCode))
    )
      throw new NotFoundException("Master definition unavailable");
    return { definition, ...context };
  }

  definitions(tenantId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const { modules } = await this.context(tx, tenantId);
        return this.definitionsInSnapshot(tx, modules);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  /** Internal M9 seam: caller supplies the shared commercial authority in this transaction. */
  definitionsInSnapshot(tx: Prisma.TransactionClient, modules: ReadonlySet<string>) {
    return tx.masterDefinition.findMany({
      where: { status: "ACTIVE", OR: [{ moduleCode: null }, { moduleCode: { in: [...modules] } }] },
      select: masterDefinitionSelect,
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      take: 24,
    });
  }

  list(tenantId: string, code: string, input: unknown) {
    const { page, limit, search } = masterPage.parse(input);
    return this.prisma.$transaction(
      async (tx) => {
        const { definition, versionId } = await this.definition(
          tx,
          tenantId,
          code,
        );
        const source: Prisma.MasterValueWhereInput[] = [
          { source: "SYSTEM" },
          { source: "TENANT", tenantId },
        ];
        if (versionId)
          source.push({
            source: "INDUSTRY",
            industryTemplateVersionId: versionId,
          });
        const values = await tx.masterValue.findMany({
          where: { definitionId: definition.id, OR: source },
          select: masterValueSelect,
          take: 10001,
        });
        if (values.length > 10000)
          throw new ConflictException("MASTER_RESOLUTION_LIMIT_EXCEEDED");
        const scopes: Prisma.MasterValueOverrideWhereInput[] = [
          { scope: "TENANT", tenantId },
        ];
        if (versionId)
          scopes.push({
            scope: "INDUSTRY",
            industryTemplateVersionId: versionId,
          });
        const overrides = await tx.masterValueOverride.findMany({
          where: {
            inheritedMasterValueId: { in: values.map((v) => v.id) },
            OR: scopes,
          },
          select: masterOverrideSelect,
        });
        const query = search.toLowerCase();
        const items = resolveMasterValues(definition, values, overrides).filter(
          (v) =>
            v.selectable &&
            (!query ||
              v.name.toLowerCase().includes(query) ||
              v.code.toLowerCase().includes(query)),
        );
        return {
          definition,
          industryTemplateVersionId: versionId,
          items: items.slice((page - 1) * limit, page * limit),
          total: items.length,
          page,
          limit,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  historical(tenantId: string, valueId: string) {
    masterId.parse(valueId);
    return this.prisma.$transaction(
      async (tx) => {
        const value = await tx.masterValue.findFirst({
          where: {
            id: valueId,
            OR: [
              { source: "SYSTEM" },
              { source: "TENANT", tenantId },
              {
                source: "INDUSTRY",
                industryTemplateVersion: { changesTo: { some: { tenantId } } },
              },
            ],
          },
          select: {
            ...masterValueSelect,
            definition: { select: { code: true } },
          },
        });
        if (!value) throw new NotFoundException("Master value not found");
        const {
          definition: { code },
          ...row
        } = value;
        const { definition, versionId } = await this.definition(
          tx,
          tenantId,
          code,
          false,
          true,
        );
        const scopes: Prisma.MasterValueOverrideWhereInput[] = [
          { scope: "TENANT", tenantId },
        ];
        const historicalVersion =
          value.source === "INDUSTRY"
            ? value.industryTemplateVersionId
            : versionId;
        if (historicalVersion)
          scopes.push({
            scope: "INDUSTRY",
            industryTemplateVersionId: historicalVersion,
          });
        const overrides = await tx.masterValueOverride.findMany({
          where: { inheritedMasterValueId: valueId, OR: scopes },
          select: masterOverrideSelect,
        });
        const resolved = resolveMasterValues(definition, [row], overrides)[0];
        return {
          ...resolved,
          selectable:
            resolved.selectable &&
            (value.source !== "INDUSTRY" ||
              value.industryTemplateVersionId === versionId),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
}
