import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface InMemoryCacheEntry {
  value: string;
  expiresAt?: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private inMemoryStore = new Map<string, InMemoryCacheEntry>();

  constructor(private readonly configService: ConfigService) {
    const enabled = this.configService.get<boolean>('REDIS_ENABLED') ?? true;
    const host = this.configService.get<string>('REDIS_HOST');

    if (enabled && host && host.trim() !== '') {
      try {
        this.client = new Redis({
          host,
          port: this.configService.get<number>('REDIS_PORT') ?? 6379,
          password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
          db: this.configService.get<number>('REDIS_DB') ?? 0,
          keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX') ?? 'visiblo:',
          enableReadyCheck: true,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: () => null,
        });

        this.client.on('error', (error) => {
          this.logger.warn(`Redis client error: ${error.message}. Operating in fallback mode.`);
          this.isConnected = false;
        });
      } catch (err) {
        this.logger.warn('Failed to initialize Redis client. Operating with in-memory fallback.');
        this.client = null;
      }
    } else {
      this.logger.log('Redis is disabled or not configured in environment. Operating with in-memory fallback.');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.client) {
      this.isConnected = false;
      return;
    }

    try {
      await this.client.connect();
      await this.client.ping();
      this.isConnected = true;
      this.logger.log('Redis connected successfully.');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        `Redis connection skipped/offline: ${
          error instanceof Error ? error.message : 'unknown'
        }. Operating with in-memory fallback.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
      } catch {
        // ignore
      }
    }
  }

  isRedisAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  getClient(): Redis | null {
    return this.isRedisAvailable() ? this.client : null;
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisAvailable() && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        this.logger.warn(`Redis get error, falling back to in-memory: ${err}`);
      }
    }

    const entry = this.inMemoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisAvailable() && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
          return;
        }
        await this.client.set(key, value);
        return;
      } catch (err) {
        this.logger.warn(`Redis set error, falling back to in-memory: ${err}`);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisAvailable() && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        this.logger.warn(`Redis del error: ${err}`);
      }
    }

    this.inMemoryStore.delete(key);
  }

  async pttl(key: string): Promise<number> {
    if (this.isRedisAvailable() && this.client) {
      try {
        return await this.client.pttl(key);
      } catch (err) {
        this.logger.warn(`Redis pttl error: ${err}`);
      }
    }

    const entry = this.inMemoryStore.get(key);
    if (!entry || !entry.expiresAt) return -1;
    const diff = entry.expiresAt - Date.now();
    return diff > 0 ? diff : -2;
  }
}
