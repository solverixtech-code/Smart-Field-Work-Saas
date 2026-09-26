import { z } from "zod";

export const locationSample = z.object({
  clientSampleId: z.string().uuid(),
  capturedAt: z.string().datetime({ offset: true }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).max(10000).nullable().optional(),
  speedKmh: z.number().min(0).max(1000).nullable().optional(),
  headingDegrees: z.number().min(0).max(359.999).nullable().optional(),
  batteryPercentage: z.number().int().min(0).max(100).nullable().optional(),
  source: z.enum(["WEB", "MOBILE"]).default("WEB"),
}).strict();

export const locationSampleBatch = z.object({
  samples: z.array(locationSample).min(1).max(200),
}).strict();

export type LocationSampleInput = z.infer<typeof locationSample>;
