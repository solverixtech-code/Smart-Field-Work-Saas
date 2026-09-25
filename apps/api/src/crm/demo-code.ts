import { UnprocessableEntityException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export async function generateDemoCode(tx: Prisma.TransactionClient, tenantId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`demo-code:${tenantId}`}, 0))::text`;
  const count = await tx.leadDemo.count({ where: { tenantId } });
  for (let number = count + 1; number < count + 10_000; number += 1) {
    const code = `DEM-${String(number).padStart(4, "0")}`;
    if (!await tx.leadDemo.findFirst({ where: { tenantId, demoCode: code }, select: { id: true } })) return code;
  }
  throw new UnprocessableEntityException("CRM_DEMO_CODE_EXHAUSTED");
}
