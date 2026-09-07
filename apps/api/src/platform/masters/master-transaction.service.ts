import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { SubscriptionTransactionService } from "../subscriptions/subscription-transaction.service";
import { MasterScope } from "./master-contract";

@Injectable()
export class MasterTransactionService {
  constructor(private readonly transactions: SubscriptionTransactionService) {}

  async run<T>(
    key: string,
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await this.transactions.run(`master:${key}`, work);
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError))
          throw error;
        const sqlCode = String(error.meta?.code ?? "");
        if (error.code === "P2010" && ["40001", "40P01"].includes(sqlCode)) {
          if (attempt < 3) continue;
          throw new ServiceUnavailableException(
            "Concurrent Master operation; retry with the same revision",
          );
        }
        if (error.code === "P2025")
          throw new NotFoundException("Master resource not found");
        if (["P2002", "P2003", "P2004", "P2010"].includes(error.code)) {
          const message = String(error.meta?.message ?? error.message);
          // Do not leak SQL, other Tenant IDs or driver internals.
          const publicCode =
            message.match(/MASTER_[A-Z_]+/)?.[0] ?? "MASTER_INTEGRITY_CONFLICT";
          throw new ConflictException(publicCode);
        }
        throw error;
      }
    }
    throw new ServiceUnavailableException("Master transaction retry exhausted");
  }

  async lock(
    tx: Prisma.TransactionClient,
    scope: MasterScope,
    definitionId: string,
  ): Promise<void> {
    if (scope.kind === "TENANT")
      await tx.$queryRaw`SELECT m8_lock_tenant(${scope.tenantId})::text`;
    if (scope.kind === "INDUSTRY")
      await tx.$queryRaw`SELECT m8_lock_draft(${scope.versionId})::text`;
    await tx.$queryRaw`SELECT id FROM "MasterDefinition" WHERE id=${definitionId} FOR UPDATE`;
  }
}
