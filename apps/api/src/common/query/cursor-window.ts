import { z } from "zod";

export const cursorWindowSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().max(300).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export function cursorWindow(input: z.infer<typeof cursorWindowSchema>) {
  const end = input.to ? new Date(input.to) : new Date();
  const start = input.from
    ? new Date(input.from)
    : new Date(end.getTime() - 7 * 86400000);
  z.number()
    .min(0)
    .max(31 * 86400000)
    .parse(end.getTime() - start.getTime());
  let position: { time: string; id: string } | undefined;
  if (input.cursor) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(
        Buffer.from(input.cursor, "base64url").toString("utf8"),
      );
    } catch {
      parsed = null;
    }
    position = z
      .object({ time: z.string().datetime(), id: z.string().uuid() })
      .strict()
      .parse(parsed);
  }
  return {
    start,
    end,
    where: {
      createdAt: { gte: start, lte: end },
      ...(position
        ? {
            OR: [
              { createdAt: { lt: new Date(position.time) } },
              { createdAt: new Date(position.time), id: { lt: position.id } },
            ],
          }
        : {}),
    },
  };
}
export function cursorPage<T extends { id: string; createdAt: Date }>(
  items: T[],
  limit: number,
) {
  const data = items.slice(0, limit);
  const last = data[data.length - 1];
  return {
    data,
    nextCursor:
      items.length > limit && last
        ? Buffer.from(
            JSON.stringify({ time: last.createdAt.toISOString(), id: last.id }),
          ).toString("base64url")
        : null,
  };
}
