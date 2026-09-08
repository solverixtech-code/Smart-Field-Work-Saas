import { randomUUID } from "crypto";
import {
  configVersion,
  resolveRuntimeSettings,
  RUNTIME_CODE_VERSION,
  RUNTIME_MAX_ENTRIES,
  RUNTIME_SOURCE_DEPENDENCIES,
  runtimeBootstrapSchema,
  runtimeCacheKey,
  RuntimeVersionVector,
  SYSTEM_RUNTIME_SETTINGS,
  validateBootstrap,
} from "./runtime-contract";
import { RuntimeConfigCache } from "./runtime-cache.service";
import { RUNTIME_OPENAPI_SCHEMA } from "./runtime-openapi";

const tenantId = randomUUID(),
  membershipId = randomUUID(),
  userId = randomUUID();
const vector: RuntimeVersionVector = {
  schema: 1,
  code: RUNTIME_CODE_VERSION,
  tenantId,
  membershipId,
  userId,
  sessionId: "",
  contextVersion: 1,
  epochs: [
    { id: randomUUID(), scope: "SYSTEM", version: "1" },
    { id: randomUUID(), scope: "TENANT", version: "1" },
  ],
  subscription: {
    id: randomUUID(),
    revision: 1,
    planVersionId: randomUUID(),
    mode: "FULL",
  },
  industry: null,
  accessMode: "FULL",
  nextBoundary: null,
};
const now = new Date("2026-09-08T00:00:00.000Z");
const fixture = () =>
  validateBootstrap({
    schemaVersion: 1,
    configVersion: configVersion(vector),
    generatedAt: now.toISOString(),
    nextRevalidationAt: null,
    principal: { tenantId, membershipId, userId },
    tenant: { id: tenantId, displayName: "Test", status: "ACTIVE" },
    access: {
      mode: "FULL",
      mapping: "SUBSCRIBED",
      subscriptionStatus: "ACTIVE",
      planVersionId: vector.subscription?.planVersionId,
    },
    modules: [],
    industry: null,
    ...resolveRuntimeSettings(null),
    permissions: ["system.masters.view"],
    masters: {
      strategy: "MANIFEST",
      canRead: true,
      canManage: false,
      definitions: [],
    },
  });

describe("Runtime vector, strict schema and scoped cache", () => {
  it("hashes deterministically independent of object property insertion order", () => {
    expect(configVersion({ ...vector })).toBe(
      configVersion({ ...vector, schema: 1 }),
    );
    expect(configVersion(vector)).toMatch(/^cfg1_[a-f0-9]{64}$/);
  });
  const changes: readonly Partial<RuntimeVersionVector>[] = [
    { code: "next" },
    { tenantId: randomUUID() },
    { membershipId: randomUUID() },
    { userId: randomUUID() },
    { sessionId: randomUUID() },
    { contextVersion: 2 },
    { epochs: [{ ...vector.epochs[0], version: "2" }, vector.epochs[1]] },
    { epochs: [vector.epochs[0], { ...vector.epochs[1], version: "2" }] },
    {
      epochs: [
        ...vector.epochs,
        { id: randomUUID(), scope: "INDUSTRY", version: "1" },
      ],
    },
    { epochs: [{ ...vector.epochs[0], id: randomUUID() }, vector.epochs[1]] },
    { subscription: null },
    {
      subscription: {
        id: randomUUID(),
        revision: 1,
        planVersionId: randomUUID(),
        mode: "FULL",
      },
    },
    {
      subscription: {
        id: vector.subscription!.id,
        revision: 2,
        planVersionId: vector.subscription!.planVersionId,
        mode: "FULL",
      },
    },
    {
      industry: {
        assignmentId: randomUUID(),
        revision: 1,
        versionId: randomUUID(),
      },
    },
    { accessMode: "READ_ONLY" },
    { nextBoundary: "2026-09-09T00:00:00.000Z" },
  ];
  it.each(changes)(
    "changes identity for authoritative dependency %j",
    (change) => {
      expect(configVersion({ ...vector, ...change })).not.toBe(
        configVersion(vector),
      );
    },
  );
  it("does not use generatedAt as semantic version authority", () => {
    const before = fixture(),
      after = validateBootstrap({
        ...before,
        generatedAt: "2026-09-08T00:01:00.000Z",
      });
    expect(runtimeCacheKey(before)).toBe(runtimeCacheKey(after));
  });
  it("requires dependency review for every semantic field and publishes matching OpenAPI properties", () => {
    const keys = Object.keys(runtimeBootstrapSchema.shape)
      .filter((key) => key !== "generatedAt")
      .sort();
    expect(Object.keys(RUNTIME_SOURCE_DEPENDENCIES).sort()).toEqual(keys);
    for (const deps of Object.values(RUNTIME_SOURCE_DEPENDENCIES))
      expect(deps.length).toBeGreaterThan(0);
    expect(Object.keys(RUNTIME_OPENAPI_SCHEMA.properties ?? {}).sort()).toEqual(
      Object.keys(runtimeBootstrapSchema.shape).sort(),
    );
  });
  it("inherits System defaults only when the entire Tenant settings row is absent", () => {
    expect(resolveRuntimeSettings(null)).toEqual({
      settings: SYSTEM_RUNTIME_SETTINGS,
      settingsProvenance: "SYSTEM",
    });
    expect(
      resolveRuntimeSettings({ ...SYSTEM_RUNTIME_SETTINGS }).settingsProvenance,
    ).toBe("TENANT");
    expect(
      resolveRuntimeSettings({ ...SYSTEM_RUNTIME_SETTINGS, timezone: "UTC" })
        .settings.timezone,
    ).toBe("UTC");
  });
  it.each([
    {},
    undefined,
    { ...SYSTEM_RUNTIME_SETTINGS, timezone: null },
    { ...SYSTEM_RUNTIME_SETTINGS, timezone: "invalid-zone" },
    { ...SYSTEM_RUNTIME_SETTINGS, currency: "rupees" },
    { ...SYSTEM_RUNTIME_SETTINGS, financialYearStartMonth: 0 },
    { ...SYSTEM_RUNTIME_SETTINGS, financialYearStartMonth: 13 },
    { ...SYSTEM_RUNTIME_SETTINGS, financialYearStartMonth: 1.5 },
    { ...SYSTEM_RUNTIME_SETTINGS, weekStartDay: [] },
    { ...SYSTEM_RUNTIME_SETTINGS, settings: {} },
    JSON.parse('{"__proto__":{"admin":true}}'),
  ])(
    "rejects malformed/unknown settings without inventing inheritance: %j",
    (input) => {
      expect(() => resolveRuntimeSettings(input)).toThrow(
        "RUNTIME_CONFIG_SOURCE_INVALID",
      );
    },
  );
  it.each([{ timezone: "UTC" }, [], null, { masterDefaults: [] }])(
    "rejects nonempty or invalid Industry scalar layer %j",
    (industry) => {
      expect(() => resolveRuntimeSettings(null, industry)).toThrow(
        "RUNTIME_CONFIG_SOURCE_INVALID",
      );
    },
  );
  it.each([
    "passwordHash",
    "refreshToken",
    "rules",
    "internalEpoch",
    "rawGrants",
  ])("rejects unexpected public field %s", (key) => {
    expect(() =>
      validateBootstrap({ ...fixture(), [key]: "not-public" }),
    ).toThrow();
  });
  it("rejects duplicate/unsorted permissions and unknown schema versions", () => {
    expect(() =>
      validateBootstrap({ ...fixture(), permissions: ["z", "a"] }),
    ).toThrow();
    expect(() =>
      validateBootstrap({ ...fixture(), permissions: ["a", "a"] }),
    ).toThrow();
    expect(() =>
      validateBootstrap({ ...fixture(), schemaVersion: 2 }),
    ).toThrow();
  });
  it("enforces the UTF-8 payload ceiling even when individual fields are valid", () => {
    const permissions = Array.from(
      { length: 1000 },
      (_, i) => `${String(i).padStart(4, "0")}${"x".repeat(190)}`,
    );
    expect(() => validateBootstrap({ ...fixture(), permissions })).toThrow(
      "RUNTIME_CONFIG_LIMIT_EXCEEDED",
    );
  });
  it("isolates all identity dimensions in keys", () => {
    const value = fixture();
    for (const key of ["tenantId", "membershipId", "userId"] as const)
      expect(
        runtimeCacheKey({
          ...value,
          principal: { ...value.principal, [key]: randomUUID() },
        }),
      ).not.toBe(runtimeCacheKey(value));
  });
  it("returns independent validated copies and expires at TTL", () => {
    const cache = new RuntimeConfigCache(),
      value = fixture(),
      key = runtimeCacheKey(value);
    cache.set(value, now);
    value.settings.timezone = "UTC";
    const hit = cache.get(key, now)!;
    expect(hit.settings.timezone).toBe("Asia/Kolkata");
    hit.settings.timezone = "UTC";
    expect(cache.get(key, now)?.settings.timezone).toBe("Asia/Kolkata");
    expect(cache.get(key, new Date(now.getTime() + 60000))).toBeNull();
  });
  it("hard-expires exactly at the subscription boundary", () => {
    const cache = new RuntimeConfigCache(),
      value = {
        ...fixture(),
        nextRevalidationAt: new Date(now.getTime() + 1000).toISOString(),
      };
    cache.set(value, now);
    expect(
      cache.get(runtimeCacheKey(value), new Date(now.getTime() + 999)),
    ).not.toBeNull();
    expect(
      cache.get(runtimeCacheKey(value), new Date(now.getTime() + 1000)),
    ).toBeNull();
    cache.set(value, new Date(now.getTime() + 1000));
    expect(cache.size).toBe(0);
  });
  it("bounds memory and evicts the oldest inserted entry", () => {
    const cache = new RuntimeConfigCache(),
      value = fixture();
    cache.set(value, now);
    for (let i = 0; i < RUNTIME_MAX_ENTRIES; i++)
      cache.set(
        {
          ...value,
          configVersion: configVersion({ ...vector, contextVersion: i + 2 }),
        },
        now,
      );
    expect(cache.size).toBe(RUNTIME_MAX_ENTRIES);
    expect(cache.get(runtimeCacheKey(value), now)).toBeNull();
  });
  it("retains old entries physically without matching a new configuration key", () => {
    const cache = new RuntimeConfigCache(),
      value = fixture();
    cache.set(value, now);
    expect(
      cache.get(
        runtimeCacheKey({
          ...value,
          configVersion: configVersion({ ...vector, contextVersion: 2 }),
        }),
        now,
      ),
    ).toBeNull();
    expect(cache.size).toBe(1);
  });
  it.each([
    { broken: true },
    {
      ...fixture(),
      principal: { tenantId: randomUUID(), membershipId, userId },
    },
  ])("discards corrupt or cross-Tenant poisoned entries", (corrupt) => {
    const cache = new RuntimeConfigCache(),
      key = runtimeCacheKey(fixture());
    // Deliberate white-box corruption; never exposed as an application write API.
    const entries = Reflect.get(cache, "entries") as Map<
      string,
      { expiresAt: number; value: unknown }
    >;
    entries.set(key, { expiresAt: now.getTime() + 60000, value: corrupt });
    expect(cache.get(key, now)).toBeNull();
    expect(cache.size).toBe(0);
  });
});
