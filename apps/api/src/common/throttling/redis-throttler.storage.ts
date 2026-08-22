import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../../redis/redis.service';

interface RedisThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

interface InMemoryThrottlerRecord {
  hits: number;
  hitsExpireAt: number;
  blockExpireAt?: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private inMemoryMap = new Map<string, InMemoryThrottlerRecord>();

  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<RedisThrottlerStorageRecord> {
    const ttlMs = Math.max(ttl, 1);
    const blockMs = Math.max(blockDuration || ttlMs, 1);
    const hitsKey = `rate-limit:${throttlerName}:${key}:hits`;
    const blockKey = `rate-limit:${throttlerName}:${key}:block`;
    const client = this.redisService.getClient();

    if (!client || !this.redisService.isRedisAvailable()) {
      return this.incrementInMemory(hitsKey, ttlMs, limit, blockMs);
    }

    try {
      const blockTtl = await client.pttl(blockKey);
      if (blockTtl > 0) {
        return {
          totalHits: limit + 1,
          timeToExpire: Math.max(await client.pttl(hitsKey), 0),
          isBlocked: true,
          timeToBlockExpire: blockTtl,
        };
      }

      const totalHits = await client.incr(hitsKey);
      if (totalHits === 1) {
        await client.pexpire(hitsKey, ttlMs);
      }

      const timeToExpire = Math.max(await client.pttl(hitsKey), 0);
      const isBlocked = totalHits > limit;

      if (isBlocked) {
        await client.set(blockKey, '1', 'PX', blockMs);
      }

      return {
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire: isBlocked ? blockMs : 0,
      };
    } catch {
      return this.incrementInMemory(hitsKey, ttlMs, limit, blockMs);
    }
  }

  private incrementInMemory(
    hitsKey: string,
    ttlMs: number,
    limit: number,
    blockMs: number,
  ): RedisThrottlerStorageRecord {
    const now = Date.now();
    let record = this.inMemoryMap.get(hitsKey);

    if (record && record.blockExpireAt && now < record.blockExpireAt) {
      return {
        totalHits: limit + 1,
        timeToExpire: Math.max(record.hitsExpireAt - now, 0),
        isBlocked: true,
        timeToBlockExpire: record.blockExpireAt - now,
      };
    }

    if (!record || now >= record.hitsExpireAt) {
      record = {
        hits: 1,
        hitsExpireAt: now + ttlMs,
      };
    } else {
      record.hits += 1;
    }

    const isBlocked = record.hits > limit;
    if (isBlocked && !record.blockExpireAt) {
      record.blockExpireAt = now + blockMs;
    }

    this.inMemoryMap.set(hitsKey, record);

    return {
      totalHits: record.hits,
      timeToExpire: Math.max(record.hitsExpireAt - now, 0),
      isBlocked,
      timeToBlockExpire: isBlocked && record.blockExpireAt ? Math.max(record.blockExpireAt - now, 0) : 0,
    };
  }
}
