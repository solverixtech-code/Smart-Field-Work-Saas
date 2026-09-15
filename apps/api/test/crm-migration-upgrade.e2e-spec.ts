import { execFileSync } from "child_process";
import { createHash, randomUUID } from "crypto";
import {
  copyFileSync,
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "fs";
import { tmpdir } from "os";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { z } from "zod";
const frozenHashes = z
  .object({ files: z.record(z.string()) })
  .parse(
    JSON.parse(
      readFileSync(
        path.join(__dirname, "fixtures/phase-0-migration-hashes.json"),
        "utf8",
      ),
    ),
  );

describe("Phase 1.1 exact frozen 33-migration upgrade", () => {
  it("preserves every frozen SQL hash", () => {
    expect(Object.keys(frozenHashes.files)).toHaveLength(33);
    for (const [directory, hash] of Object.entries(frozenHashes.files)) {
      const sql = readFileSync(
        path.join("prisma/migrations", directory, "migration.sql"),
        "utf8",
      ).replace(/\r\n/g, "\n");
      expect(createHash("sha256").update(sql).digest("hex")).toBe(hash);
    }
  });
  it("upgrades populated Phase 0 through exactly one new migration and preserves relationships", async () => {
    verifyTestDatabaseSafety();
    const base = process.env.TEST_DATABASE_URL!;
    const schema = `crm_upgrade_${randomUUID().replace(/-/g, "")}`;
    const url = new URL(base);
    url.searchParams.set("schema", schema);
    const temporary = mkdtempSync(path.join(tmpdir(), "crm-upgrade-"));
    const prismaDir = path.join(temporary, "prisma");
    mkdirSync(path.join(prismaDir, "migrations"), { recursive: true });
    const client = new PrismaClient({
      datasources: { db: { url: url.toString() } },
    });
    const deploy = () =>
      execFileSync(
        process.execPath,
        [
          require.resolve("prisma/build/index.js"),
          "migrate",
          "deploy",
          `--schema=${path.join(prismaDir, "schema.prisma")}`,
        ],
        {
          env: { ...process.env, DATABASE_URL: url.toString() },
          stdio: "pipe",
        },
      );
    try {
      copyFileSync(
        "prisma/schema.prisma",
        path.join(prismaDir, "schema.prisma"),
      );
      copyFileSync(
        "prisma/migrations/migration_lock.toml",
        path.join(prismaDir, "migrations/migration_lock.toml"),
      );
      for (const directory of Object.keys(frozenHashes.files))
        cpSync(
          path.join("prisma/migrations", directory),
          path.join(prismaDir, "migrations", directory),
          { recursive: true },
        );
      deploy();
      expect(
        await client.$queryRaw`SELECT to_regclass('"Account"')::text AS name`,
      ).toEqual([{ name: null }]);
      const tenant = await client.tenant.create({
        data: {
          slug: `upgrade-${randomUUID()}`,
          displayName: "Frozen relationship proof",
        },
        select: { id: true },
      });
      const user = await client.user.create({
        data: {
          employeeCode: randomUUID(),
          email: `${randomUUID()}@test.invalid`,
          fullName: "Frozen user",
          passwordHash: "unusable",
          role: "SUPPORT",
        },
        select: { id: true },
      });
      const role = await client.tenantRole.create({
        data: {
          tenantId: tenant.id,
          code: "upgrade_owner",
          name: "Frozen role",
        },
        select: { id: true },
      });
      const membership = await client.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          tenantRoleId: role.id,
          status: "ACTIVE",
        },
        select: { id: true, tenantId: true, userId: true, tenantRoleId: true },
      });
      const before = await client.$queryRaw<
        Array<{ migration_name: string; checksum: string }>
      >`SELECT migration_name,checksum FROM "_prisma_migrations" ORDER BY migration_name`;
      expect(before).toHaveLength(33);
      const additions = readdirSync("prisma/migrations", {
        withFileTypes: true,
      }).filter((d) => d.isDirectory() && !(d.name in frozenHashes.files));
      expect(additions).toHaveLength(1);
      for (const addition of additions)
        cpSync(
          path.join("prisma/migrations", addition.name),
          path.join(prismaDir, "migrations", addition.name),
          { recursive: true },
        );
      deploy();
      const after = await client.$queryRaw<
        Array<{ migration_name: string; checksum: string }>
      >`SELECT migration_name,checksum FROM "_prisma_migrations" ORDER BY migration_name`;
      expect(after).toHaveLength(34);
      expect(after.slice(0, 33)).toEqual(before);
      expect(
        await client.tenantMembership.findUnique({
          where: { id: membership.id },
          select: {
            id: true,
            tenantId: true,
            userId: true,
            tenantRoleId: true,
          },
        }),
      ).toEqual(membership);
      const account = await client.account.create({
        data: {
          tenantId: tenant.id,
          name: "After upgrade",
          ownerMembershipId: membership.id,
          createdByMembershipId: membership.id,
          updatedByMembershipId: membership.id,
        },
        select: { id: true, revision: true },
      });
      expect(account.revision).toBe(1);
      await client.contact.create({
        data: {
          tenantId: tenant.id,
          accountId: account.id,
          name: "After upgrade",
          email: "upgrade@test.invalid",
          createdByMembershipId: membership.id,
          updatedByMembershipId: membership.id,
        },
        select: { id: true },
      });
    } finally {
      if (!/^crm_upgrade_[a-f0-9]{32}$/.test(schema))
        throw new Error("Unsafe schema");
      await client.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await client.$disconnect();
      if (
        !path.resolve(temporary).startsWith(path.resolve(tmpdir()) + path.sep)
      )
        throw new Error("Unsafe temporary path");
      rmSync(temporary, { recursive: true, force: true });
    }
  }, 120000);
});
