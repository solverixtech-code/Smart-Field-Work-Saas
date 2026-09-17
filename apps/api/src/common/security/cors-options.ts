import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

/** Preserve the approved bootstrap origins; CORS is not an authorization guard. */
export function createCorsOptions(
  frontendUrl: string | undefined,
): CorsOptions {
  const allowedList = [
    frontendUrl,
    "https://preeminent-dieffenbachia-fc721e.netlify.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      // Native clients and same-origin requests need no CORS grant.
      if (!origin) return callback(null, true);
      const allowed =
        allowedList.includes(origin) ||
        /^https:\/\/.*\.netlify\.app$/.test(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):?\d*$/.test(
          origin,
        );
      // A denied origin receives no CORS headers, without changing route semantics.
      return callback(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-Correlation-Id",
      "X-Tenant-Id",
      "X-Session-Id",
      "If-None-Match",
    ],
    exposedHeaders: ["X-Request-Id", "X-Correlation-Id"],
  };
}
