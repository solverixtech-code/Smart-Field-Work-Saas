import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { RequestPrincipal } from "../common/security/request-principal.interface";

export interface OperationContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly originRequestId?: string;
  actorUserId?: string;
  tenantId?: string;
  membershipId?: string;
}
const storage = new AsyncLocalStorage<OperationContext>();
export const requestContext = {
  current: () => storage.getStore(),
  run<T>(context: OperationContext, work: () => T): T {
    return storage.run({ ...context }, work);
  },
  create(correlation: unknown): OperationContext {
    return {
      requestId: randomUUID(),
      correlationId:
        typeof correlation === "string" &&
        /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(correlation)
          ? correlation
          : randomUUID(),
    };
  },
  attach(principal: RequestPrincipal): void {
    const current = storage.getStore();
    if (!current) return;
    current.actorUserId = principal.userId;
    current.tenantId = principal.tenantId ?? undefined;
    current.membershipId = principal.membershipId ?? undefined;
  },
};
