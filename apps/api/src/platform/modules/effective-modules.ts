import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { MODULE_REGISTRY } from "./feature-registry";
import {
  readRules,
  subscriptionAccess,
} from "../subscriptions/subscription-contract";

/** Shared M8/M9 read authority; never adds recommendations or Module dependencies. */
export async function readEffectiveModules(
  tx: Prisma.TransactionClient,
  tenantId: string,
  clock: () => Date,
  write = false,
) {
  const subscription = await tx.tenantSubscription.findUnique({
    where: { tenantId },
    select: {
      id: true,
      revision: true,
      status: true,
      planVersionId: true,
      trialEndsAt: true,
      graceEndsAt: true,
      planVersion: {
        select: {
          commercialRule: { select: { schemaVersion: true, rules: true } },
          modules: {
            select: { module: { select: { code: true, status: true } } },
          },
        },
      },
    },
  });
  // Preserve M8's clock evaluation after the subscription read completes.
  const now = clock();
  const mode = subscription
    ? subscriptionAccess(
        subscription,
        readRules(subscription.planVersion.commercialRule),
        now,
      )
    : "FULL";
  if (mode === "BLOCKED" || (write && mode === "READ_ONLY")) {
    throw new ForbiddenException(
      "Subscription does not permit this Tenant operation",
    );
  }
  const canonicalList = MODULE_REGISTRY.filter((m) =>
    ["ACTIVE", "BETA"].includes(m.status),
  ).map((m) => ({
    code: m.code,
    status: m.status,
    source: "CANONICAL" as const,
  }));
  const canonicalSet = new Set(canonicalList.map((m) => m.code));

  const planModules = (subscription?.planVersion.modules ?? [])
    .filter(
      (m) =>
        canonicalSet.has(m.module.code) &&
        ["ACTIVE", "BETA"].includes(m.module.status),
    )
    .map((m) => ({
      code: m.module.code,
      status: m.module.status,
      source: "PLAN_VERSION" as const,
    }));

  const modules = (planModules.length > 0 ? planModules : canonicalList).sort((a, b) =>
    a.code < b.code ? -1 : a.code > b.code ? 1 : 0,
  );
  const boundary =
    subscription?.status === "TRIALING"
      ? subscription.trialEndsAt
      : subscription?.status === "GRACE"
        ? subscription.graceEndsAt
        : null;
  return {
    modules,
    access: {
      mode,
      mapping: subscription
        ? ("SUBSCRIBED" as const)
        : ("LEGACY_UNMAPPED" as const),
      subscriptionStatus: subscription?.status ?? null,
      planVersionId: subscription?.planVersionId ?? null,
    },
    nextRevalidationAt:
      boundary && boundary > now ? boundary.toISOString() : null,
    dependency: subscription
      ? {
          id: subscription.id,
          revision: subscription.revision,
          planVersionId: subscription.planVersionId,
          mode,
        }
      : null,
  };
}
