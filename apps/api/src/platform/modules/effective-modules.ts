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
  now: Date,
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
  const canonical = new Set(
    MODULE_REGISTRY.filter((m) => ["ACTIVE", "BETA"].includes(m.status)).map(
      (m) => m.code,
    ),
  );
  const modules = (subscription?.planVersion.modules ?? [])
    .filter(
      (m) =>
        canonical.has(m.module.code) &&
        ["ACTIVE", "BETA"].includes(m.module.status),
    )
    .map((m) => ({
      code: m.module.code,
      status: m.module.status,
      source: "PLAN_VERSION" as const,
    }))
    .sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
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
