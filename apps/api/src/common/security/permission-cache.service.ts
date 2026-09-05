import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionCacheService {
  private inMemoryCache = new Map<string, { permissions: string[]; timestamp: number }>();
  private readonly ttlMs = 5 * 60 * 1000; // 5 minutes standard TTL fallback

  get(key: string): string[] | null {
    const cached = this.inMemoryCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return cached.permissions;
  }

  set(key: string, permissions: string[]): void {
    this.inMemoryCache.set(key, {
      permissions,
      timestamp: Date.now(),
    });
  }

  invalidateKey(key: string): void {
    this.inMemoryCache.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.inMemoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  clear(): void {
    this.inMemoryCache.clear();
  }
}
