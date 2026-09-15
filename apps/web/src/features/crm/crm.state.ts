import { isAxiosError } from "axios";
import { z } from "zod";
export interface CrmError {
  status: number;
  message: string;
  conflict: boolean;
  details?: Array<{ field: string; message: string }>;
}
export function crmError(error: unknown): CrmError {
  const status = isAxiosError(error) ? (error.response?.status ?? 0) : 0;
  const code = isAxiosError<{ code?: string }>(error)
    ? error.response?.data?.code
    : undefined;
  const details = z
    .array(
      z.object({ field: z.string().max(100), message: z.string().max(300) }),
    )
    .max(50)
    .safeParse(
      status === 400 && isAxiosError<{ details?: unknown }>(error)
        ? error.response?.data?.details
        : undefined,
    );
  const specific: Record<string, string> = {
    CRM_ACCOUNT_HAS_CONTACTS:
      "Remove all contacts from this business before deleting it.",
    CRM_PRIMARY_CONTACT_REQUIRED_CHANGE:
      "Clear or switch the primary contact before deleting or deactivating it.",
  };
  const messages: Record<number, string> = {
    0: "The request could not be confirmed. Check your connection and reload before trying a create again.",
    400: "Check the required fields, formats and lengths, then submit again.",
    401: "Your session or workspace selection has expired. Sign in or select your workspace again.",
    403: "Your permissions or subscription do not allow this action.",
    404: "This record is unavailable in your current workspace.",
    409: "The record changed. Your edits are retained. Reload the current revision, review your edits and submit again.",
    412: "The record changed. Reload its current revision before submitting again.",
    422: "A selected owner, master value or record is no longer available. Choose an active option.",
    429: "Too many requests. Wait a moment and try again.",
  };
  return {
    status,
    message:
      (code && specific[code]) ||
      messages[status] ||
      "The server could not complete this request. Reload to check its current state.",
    conflict: status === 409 || status === 412,
    details: details.success ? details.data : undefined,
  };
}
/** A request is usable only within the generation that started it. Also gates unabortable responses. */
export class CrmRequestScope {
  private controller = new AbortController();
  get signal() {
    return this.controller.signal;
  }
  activate() {
    if (this.controller.signal.aborted) this.controller = new AbortController();
  }
  dispose() {
    this.controller.abort();
  }
  async run<T>(work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const signal = this.signal;
    if (signal.aborted)
      throw new DOMException("Workspace changed", "AbortError");
    const result = await work(signal);
    if (signal.aborted)
      throw new DOMException("Workspace changed", "AbortError");
    return result;
  }
}
