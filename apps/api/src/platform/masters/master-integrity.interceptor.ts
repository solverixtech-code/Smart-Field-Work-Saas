import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { catchError, Observable, throwError } from "rxjs";

// M8 adds compatibility triggers to frozen Industry assignment commands. Translate
// only M8 constraint failures; all incumbent exceptions retain their behavior.
@Injectable()
export class MasterIntegrityInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError ||
          error instanceof Prisma.PrismaClientUnknownRequestError
        ) {
          const code = error.message.match(/MASTER_[A-Z_]+/)?.[0];
          if (code) return throwError(() => new ConflictException(code));
        }
        return throwError(() => error);
      }),
    );
  }
}
