import { BadRequestException } from "@nestjs/common";

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const twelveHourPattern = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i;
const twentyFourHourPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseFollowUpSchedule(
  date: string,
  time: string,
  timezone: string,
): Date {
  const dateMatch = datePattern.exec(date);
  const twelveHourMatch = twelveHourPattern.exec(time);
  const twentyFourHourMatch = twentyFourHourPattern.exec(time);
  if (!dateMatch || (!twelveHourMatch && !twentyFourHourMatch)) {
    throw new BadRequestException("Enter a valid follow-up date and time.");
  }
  const timeMatch = twelveHourMatch ?? twentyFourHourMatch;
  if (!timeMatch)
    throw new BadRequestException("Enter a valid follow-up time.");
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = twelveHourMatch
    ? (Number(twelveHourMatch[1]) % 12) +
      (twelveHourMatch[3].toUpperCase() === "PM" ? 12 : 0)
    : Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  const validDate = new Date(Date.UTC(year, month - 1, day));
  if (
    validDate.getUTCFullYear() !== year ||
    validDate.getUTCMonth() + 1 !== month ||
    validDate.getUTCDate() !== day
  ) {
    throw new BadRequestException("Enter a valid follow-up date.");
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const partsAt = (instant: number) => {
    const parts = formatter.formatToParts(new Date(instant));
    const value = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    return Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
    );
  };
  let instant = wallClock;
  for (let attempt = 0; attempt < 3; attempt++) {
    const difference = wallClock - partsAt(instant);
    if (difference === 0) return new Date(instant);
    instant += difference;
  }
  throw new BadRequestException(
    "That local follow-up time does not exist in the workspace timezone.",
  );
}
