import { ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma.service';

@Injectable()
export class SubscriptionTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(key: string, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await this.prisma.$transaction(async tx => {
          // Transaction-scoped lock works across API processes, including absent rows.
          await this.lock(tx, key);
          const result = await work(tx);
          // Surface deferred integrity failures before the driver's COMMIT path.
          await tx.$executeRaw`SET CONSTRAINTS ALL IMMEDIATE`;
          return result;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 30000, timeout: 30000 });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;
        if (['P2034', 'P2002'].includes(error.code) && attempt < 3) continue;
        if (error.code === 'P2002') throw new ConflictException('A resource with this identity already exists');
        if (error.code === 'P2034' || error.code === 'P2028') throw new ServiceUnavailableException('Concurrent operation; retry with the same idempotency key');
        throw error;
      }
    }
    throw new ServiceUnavailableException('Transaction retry exhausted');
  }

  async lock(tx: Prisma.TransactionClient, key: string): Promise<void> {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text`;
  }
}
