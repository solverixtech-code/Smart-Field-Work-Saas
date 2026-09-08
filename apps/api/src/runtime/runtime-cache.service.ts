import { Injectable } from "@nestjs/common";
import {
  RuntimeBootstrap,
  RUNTIME_MAX_ENTRIES,
  RUNTIME_TTL_MS,
  runtimeCacheKey,
  validateBootstrap,
} from "./runtime-contract";

@Injectable()
export class RuntimeClock {
  now(): Date {
    return new Date();
  }
}

@Injectable()
export class RuntimeConfigCache {
  private readonly entries = new Map<
    string,
    { expiresAt: number; value: unknown }
  >();
  get size(): number {
    return this.entries.size;
  }

  get(key: string, now: Date): RuntimeBootstrap | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= now.getTime()) {
      this.entries.delete(key);
      return null;
    }
    try {
      const parsed = validateBootstrap(entry.value);
      if (
        runtimeCacheKey(parsed) !== key ||
        (parsed.nextRevalidationAt !== null &&
          Date.parse(parsed.nextRevalidationAt) <= now.getTime())
      ) {
        this.entries.delete(key);
        return null;
      }
      return parsed; // Zod clones the DTO, preventing callers from mutating cached state.
    } catch {
      this.entries.delete(key);
      return null;
    }
  }
  set(value: RuntimeBootstrap, now: Date): void {
    const parsed = validateBootstrap(value);
    const boundary =
      parsed.nextRevalidationAt === null
        ? Infinity
        : Date.parse(parsed.nextRevalidationAt);
    const expiresAt = Math.min(now.getTime() + RUNTIME_TTL_MS, boundary);
    if (expiresAt <= now.getTime()) return;
    for (const [key, entry] of this.entries)
      if (entry.expiresAt <= now.getTime()) this.entries.delete(key);
    const key = runtimeCacheKey(parsed);
    this.entries.delete(key);
    while (this.entries.size >= RUNTIME_MAX_ENTRIES) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
    this.entries.set(key, { expiresAt, value: parsed });
  }
}
