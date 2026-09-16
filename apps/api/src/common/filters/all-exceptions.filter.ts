import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const resObj =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    const message =
      typeof resObj === "string"
        ? resObj
        : typeof resObj === "object" && resObj !== null && "message" in resObj
          ? (resObj as { message: unknown }).message
          : exception instanceof Error
            ? exception.message
            : "Internal Server Error";

    const stack = exception instanceof Error ? exception.stack : undefined;

    // Log full error details to terminal
    this.logger.error(
      `HTTP ${request.method} ${request.url} [${status}]: ${
        typeof message === "object" ? JSON.stringify(message) : message
      }`,
      stack,
    );

    if (response.headersSent) {
      return;
    }

    response.status(status).json({
      statusCode: status,
      error: status === 500 ? "Internal Server Error" : "Http Error",
      message:
        typeof message === "string" || Array.isArray(message)
          ? message
          : "An unexpected server error occurred.",
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
