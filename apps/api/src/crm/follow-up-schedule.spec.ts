import { parseFollowUpSchedule } from "./follow-up-schedule";

describe("parseFollowUpSchedule", () => {
  it("preserves the selected workspace wall-clock time", () => {
    expect(
      parseFollowUpSchedule(
        "2026-09-25",
        "11:30 AM",
        "Asia/Kolkata",
      ).toISOString(),
    ).toBe("2026-09-25T06:00:00.000Z");
    expect(
      parseFollowUpSchedule(
        "2026-09-25",
        "14:45",
        "Asia/Kolkata",
      ).toISOString(),
    ).toBe("2026-09-25T09:15:00.000Z");
  });

  it("rejects invalid dates and nonexistent daylight-saving times", () => {
    expect(() =>
      parseFollowUpSchedule("2026-02-30", "11:30 AM", "Asia/Kolkata"),
    ).toThrow();
    expect(() =>
      parseFollowUpSchedule("2026-03-08", "02:30", "America/New_York"),
    ).toThrow();
  });
});
