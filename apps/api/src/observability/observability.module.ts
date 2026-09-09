import {
  Global,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  Injectable,
  NestModule,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { METRIC_LABELS, MetricsService } from "./metrics.service";
import { StructuredLogger } from "./structured-logger.service";
import { requestContext } from "./request-context";

@Injectable()
class RequestObservationMiddleware implements NestMiddleware {
  constructor(
    private readonly metrics: MetricsService,
    private readonly logger: StructuredLogger,
  ) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const context = requestContext.create(req.headers["x-correlation-id"]);
    requestContext.run(context, () => {
      const activeContext = requestContext.current() ?? context;
      res.setHeader("X-Request-Id", context.requestId);
      res.setHeader("X-Correlation-Id", context.correlationId);
      const start = performance.now();
      res.once("finish", () =>
        requestContext.run(activeContext, () => {
          const status =
            res.statusCode >= 500
              ? "5xx"
              : res.statusCode >= 400
                ? "4xx"
                : res.statusCode >= 300
                  ? "3xx"
                  : res.statusCode >= 200
                    ? "2xx"
                    : "1xx";
          const http =
            req.method === "GET" ||
            req.method === "POST" ||
            req.method === "PUT" ||
            req.method === "PATCH" ||
            req.method === "DELETE" ||
            req.method === "HEAD" ||
            req.method === "OPTIONS"
              ? req.method
              : "OTHER";
          const routePath: unknown = req.route?.path;
          const route =
            METRIC_LABELS.route.find((candidate) => candidate === routePath) ??
            "other";
          this.metrics.observe("http_requests", { http, status, route });
          this.metrics.observe(
            "http_duration_ms",
            { http, status, route },
            performance.now() - start,
          );
          this.logger.write("http.completed", {
            method: http,
            route,
            status: res.statusCode,
          });
        }),
      );
      next();
    });
  }
}

@Global()
@Module({
  providers: [MetricsService, StructuredLogger],
  exports: [MetricsService, StructuredLogger],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestObservationMiddleware).forRoutes("*");
  }
}
