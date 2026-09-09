import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZodExceptionFilter.name);

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const formattedIssues = exception.issues.map((issue) => {
      const path = issue.path.join('.');
      return {
        field: path || 'body',
        message: issue.message,
      };
    });

    const errorMessages = formattedIssues.map((item) =>
      item.field && item.field !== 'body'
        ? `${item.field}: ${item.message}`
        : item.message,
    );

    this.logger.warn(
      'Request validation failed',
    );

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: errorMessages.length === 1 ? errorMessages[0] : errorMessages,
      details: formattedIssues,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
