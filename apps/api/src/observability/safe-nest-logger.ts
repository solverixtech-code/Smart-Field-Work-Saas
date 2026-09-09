import { LoggerService } from "@nestjs/common";
import { redactDiagnostic } from "./redaction";
import { requestContext } from "./request-context";

/** Logger transport for framework/legacy Nest loggers; no recursive Nest Logger calls. */
export class SafeNestLogger implements LoggerService {
  private emit(level: string, message: unknown, details: unknown[]) {
    const context = requestContext.current();
    const safe = redactDiagnostic({
      level,
      timestamp: new Date().toISOString(),
      requestId: context?.requestId,
      correlationId: context?.correlationId,
      actorUserId: context?.actorUserId,
      tenantId: context?.tenantId,
      membershipId: context?.membershipId,
      message,
      details,
    });
    process.stdout.write(JSON.stringify(safe) + "\n");
  }
  log(message: unknown, ...details: unknown[]) {
    this.emit("info", message, details);
  }
  warn(message: unknown, ...details: unknown[]) {
    this.emit("warn", message, details);
  }
  error(message: unknown, ...details: unknown[]) {
    if (message !== null && typeof message === 'object') {
      const event: unknown = Object.getOwnPropertyDescriptor(message, 'event')?.value;
      if (event === 'worker.poll.failed' || event === 'job.failed') {
        this.emit('error', message, []);
        return;
      }
    }
    // Driver/framework error messages can contain input values. Keep only source
    // stack frames internally; do not serialize raw messages or SQL parameters.
    const candidates = message instanceof Error ? [message.stack, ...details] : details;
    const frames = candidates.filter((value): value is string => typeof value === 'string')
      .flatMap((value) => value.split('\n')).filter((line) => /^\s*at .+:\d+:\d+\)?$/.test(line)).slice(0, 12);
    this.emit("error", { errorCode: 'APPLICATION_ERROR', frames }, []);
  }
  debug(message: unknown, ...details: unknown[]) {
    this.emit("debug", message, details);
  }
  verbose(message: unknown, ...details: unknown[]) {
    this.emit("trace", message, details);
  }
  fatal(message: unknown, ...details: unknown[]) {
    this.emit("fatal", message, details);
  }
}
