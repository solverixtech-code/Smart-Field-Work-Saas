import { Injectable, Logger } from "@nestjs/common";
import { requestContext } from "./request-context";
import { redactDiagnostic } from "./redaction";

@Injectable()
export class StructuredLogger {
  private readonly logger = new Logger("Operations");
  write(
    event: string,
    fields: unknown = null,
    level: "log" | "warn" | "error" = "log",
  ): void {
    const context = requestContext.current();
    this.logger[level](
        redactDiagnostic({
          event,
          level,
          timestamp: new Date().toISOString(),
          requestId: context?.requestId,
          correlationId: context?.correlationId,
          originRequestId: context?.originRequestId,
          actorUserId: context?.actorUserId,
          tenantId: context?.tenantId,
          membershipId: context?.membershipId,
          fields,
        }),
    );
  }
}
