import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Optional,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { MetricsService } from '../observability/metrics.service';
import { PrismaService } from "../persistence/prisma.service";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { EffectivePermissionService } from "../common/security/effective-permission.service";
import { EffectiveMasterService } from "../platform/masters/effective-master.service";
import { readEffectiveModules } from "../platform/modules/effective-modules";
import { classifyPlanTransactionError } from "../platform/plans/plan-transaction-error";
import { RuntimeClock, RuntimeConfigCache } from "./runtime-cache.service";
import {
  configVersion,
  resolveRuntimeSettings,
  RUNTIME_CODE_VERSION,
  RuntimeBootstrap,
  runtimeCacheKey,
  runtimeSettingsSelect,
  RuntimeVersionVector,
  validateBootstrap,
} from "./runtime-contract";

@Injectable()
export class RuntimeConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: EffectivePermissionService,
    private readonly masters: EffectiveMasterService,
    private readonly cache: RuntimeConfigCache,
    private readonly clock: RuntimeClock,
    @Optional() private readonly metrics?: MetricsService,
  ) {}

  /** One snapshot per composition, then an independent authoritative double-check.
   * The second snapshot is the request's linearization point, on both hits and misses. */
  async bootstrap(principal: RequestPrincipal): Promise<RuntimeBootstrap> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const candidate = await this.snapshot(async (tx) => {
          const state = await this.state(tx, principal);
          const key = runtimeCacheKey({
            principal: state.principal,
            configVersion: state.version,
          });
          const cached = this.cache.get(key, this.clock.now());
          this.metrics?.observe('runtime_cache', { cache: cached ? 'hit' : 'miss' });
          if (cached) return cached;
          return this.compose(tx, state);
        });
        const current = await this.snapshot((tx) => this.state(tx, principal));
        const now = this.clock.now();
        if (
          current.version !== candidate.configVersion ||
          (candidate.nextRevalidationAt !== null &&
            Date.parse(candidate.nextRevalidationAt) <= now.getTime())
        ) {
          this.metrics?.observe('runtime_cache', { cache: 'retry' });
          continue;
        }
        const result = validateBootstrap({
          ...candidate,
          generatedAt: now.toISOString(),
        });
        try {
          this.cache.set(result, now);
        } catch {
          this.metrics?.observe('runtime_cache', { cache: 'failure' });
          /* Cache availability is not business authority. */
        }
        return result;
      } catch (error: unknown) {
        this.metrics?.observe('runtime_cache', { cache: 'failure' });
        if (classifyPlanTransactionError(error) === "RETRYABLE") {
          if (attempt < 2) continue;
          throw new ServiceUnavailableException("RUNTIME_CONFIG_UNSTABLE");
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError)
          throw new ServiceUnavailableException("RUNTIME_CONFIG_UNSTABLE");
        throw error;
      }
    }
    throw new ServiceUnavailableException("RUNTIME_CONFIG_UNSTABLE");
  }

  private snapshot<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
        return work(tx);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        timeout: 10000,
        maxWait: 10000,
      },
    );
  }

  private async state(
    tx: Prisma.TransactionClient,
    principal: RequestPrincipal,
  ) {
    if (!principal.tenantId || !principal.membershipId)
      throw new ForbiddenException("Selected Tenant membership required");
    const membership = await tx.tenantMembership.findUnique({
      where: { id: principal.membershipId },
      select: {
        id: true,
        tenantId: true,
        userId: true,
        status: true,
        tenantRole: { select: { tenantId: true } },
        user: { select: { status: true } },
        tenant: { select: { id: true, displayName: true, status: true, industryCode: true, websiteUrl: true } },
      },
    });
    if (
      !membership ||
      membership.userId !== principal.userId ||
      membership.user.status !== "ACTIVE" ||
      membership.tenantId !== principal.tenantId ||
      membership.status !== "ACTIVE" ||
      membership.tenant.status !== "ACTIVE" ||
      (membership.tenantRole &&
        membership.tenantRole.tenantId !== principal.tenantId)
    ) {
      throw new ForbiddenException("Selected Tenant membership unavailable");
    }
    if (principal.sessionId) {
      const session = await tx.userSession.findUnique({
        where: { id: principal.sessionId },
        select: {
          userId: true,
          status: true,
          selectedMembershipId: true,
          contextVersion: true,
        },
      });
      if (
        !session ||
        session.userId !== principal.userId ||
        session.status !== "ACTIVE" ||
        session.selectedMembershipId !== principal.membershipId ||
        session.contextVersion !== principal.contextVersion
      )
        throw new UnauthorizedException("Session context changed");
    }
    const assignment = await tx.tenantIndustryTemplateAssignment.findUnique({
      where: { tenantId: principal.tenantId },
      select: {
        id: true,
        revision: true,
        industryTemplateVersionId: true,
        industryTemplateVersion: {
          select: {
            industryTemplateId: true,
            version: true,
            status: true,
            schemaVersion: true,
            terminology: true,
            masterDefaults: true,
          },
        },
      },
    });
    if (
      assignment &&
      (assignment.industryTemplateVersion.status !== "PUBLISHED" ||
        assignment.industryTemplateVersion.schemaVersion !== 1 ||
        JSON.stringify(assignment.industryTemplateVersion.terminology) !==
          "{}" ||
        JSON.stringify(assignment.industryTemplateVersion.masterDefaults) !==
          "[]")
    )
      throw new ServiceUnavailableException("RUNTIME_CONFIG_SOURCE_INVALID");
    const epochRows = await tx.runtimeConfigEpoch.findMany({
      where: {
        OR: [
          { scope: "SYSTEM" },
          { tenantId: principal.tenantId },
          ...(assignment
            ? [
                {
                  industryTemplateVersionId:
                    assignment.industryTemplateVersionId,
                },
              ]
            : []),
        ],
      },
      select: { id: true, scope: true, version: true },
      orderBy: { scope: "asc" },
    });
    if (epochRows.length !== (assignment ? 3 : 2))
      throw new ServiceUnavailableException("RUNTIME_CONFIG_SOURCE_INVALID");
    const commercial = await readEffectiveModules(tx, principal.tenantId, () =>
      this.clock.now(),
    );
    const identity = {
      userId: principal.userId,
      membershipId: principal.membershipId,
      tenantId: principal.tenantId,
    };
    const vector: RuntimeVersionVector = {
      schema: 1,
      code: RUNTIME_CODE_VERSION,
      ...identity,
      sessionId: principal.sessionId,
      contextVersion: principal.contextVersion,
      epochs: epochRows.map((row) => ({
        ...row,
        version: row.version.toString(),
      })),
      subscription: commercial.dependency,
      industry: assignment
        ? {
            assignmentId: assignment.id,
            revision: assignment.revision,
            versionId: assignment.industryTemplateVersionId,
          }
        : null,
      accessMode: commercial.access.mode,
      nextBoundary: commercial.nextRevalidationAt,
    };
    return {
      principal: identity,
      tenant: membership.tenant,
      commercial,
      version: configVersion(vector),
      industry: assignment
        ? {
            templateId: assignment.industryTemplateVersion.industryTemplateId,
            versionId: assignment.industryTemplateVersionId,
            version: assignment.industryTemplateVersion.version,
          }
        : null,
    };
  }

  private async compose(
    tx: Prisma.TransactionClient,
    state: Awaited<ReturnType<RuntimeConfigService["state"]>>,
  ): Promise<RuntimeBootstrap> {
    const tenantId = state.principal.tenantId;
    const permissions = await this.permissions.resolveTenantPermissions(
      tenantId,
      state.principal.membershipId,
      tx,
    );
    const canRead = permissions.includes("system.masters.view");
    const definitions = canRead
      ? await this.masters.definitionsInSnapshot(
          tx,
          new Set(state.commercial.modules.map((m) => m.code)),
        )
      : [];
    const settings = await tx.tenantSettings.findUnique({
      where: { tenantId },
      select: runtimeSettingsSelect,
    });
    return validateBootstrap({
      schemaVersion: 1,
      configVersion: state.version,
      generatedAt: this.clock.now().toISOString(),
      nextRevalidationAt: state.commercial.nextRevalidationAt,
      principal: state.principal,
      tenant: state.tenant,
      access: state.commercial.access,
      modules: state.commercial.modules,
      industry: state.industry,
      ...resolveRuntimeSettings(settings),
      permissions,
      masters: {
        strategy: "MANIFEST",
        canRead,
        canManage:
          state.commercial.access.mode === "FULL" &&
          permissions.includes("system.masters.manage"),
        definitions,
      },
    });
  }

  async updateWorkspaceSettings(
    principal: RequestPrincipal,
    dto: {
      companyName?: string;
      website?: string;
      primaryEmail?: string;
      primaryPhone?: string;
      industry?: string;
      primaryColor?: string;
      secondaryColor?: string;
      timezone?: string;
      currency?: string;
    },
  ) {
    if (!principal.tenantId) {
      throw new BadRequestException("Tenant context required");
    }

    const roles = [
      ...(principal.platformRoleCodes || []),
      ...(principal.tenantRoleCode ? [principal.tenantRoleCode] : []),
    ];
    const isOwnerOrAdmin = roles.some((r) =>
      ["TENANT_ADMIN", "SUPER_ADMIN", "OWNER", "ADMIN"].includes(r.toUpperCase()),
    );
    const perms = principal.permissions || principal.tenantPermissions || [];
    if (
      !isOwnerOrAdmin &&
      !perms.includes("crm.workspace.manage") &&
      !perms.includes("platform.tenant.manage")
    ) {
      throw new ForbiddenException(
        "Only Workspace Administrators can update workspace settings.",
      );
    }

    const updated = await this.prisma.tenant.update({
      where: { id: principal.tenantId },
      data: {
        ...(dto.companyName ? { displayName: dto.companyName.trim() } : {}),
        ...(dto.website !== undefined ? { websiteUrl: dto.website?.trim() || null } : {}),
        ...(dto.industry !== undefined ? { industryCode: dto.industry?.trim() || null } : {}),
      },
    });

    // Invalidate runtime cache so bootstrap picks up new tenant settings immediately
    this.cache.clear();

    return {
      success: true,
      message: "Workspace settings updated successfully",
      tenant: updated,
    };
  }
}
