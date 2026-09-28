// @vitest-environment jsdom
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attendanceApi } from "./attendance.api";
import AttendanceAdministrationPage from "./AttendanceAdministrationPage";

vi.mock("./attendance.api", () => ({
  attendanceApi: {
    admin: {
      sites: vi.fn(),
      policy: vi.fn(),
      holidays: vi.fn(),
      leaves: vi.fn(),
      memberships: vi.fn(),
      devices: vi.fn(),
      exceptions: vi.fn(),
    },
  },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(attendanceApi.admin.sites).mockResolvedValue([
    {
      id: "site-1",
      code: "MUM-HQ",
      name: "Mumbai headquarters",
      address: "Andheri East, Mumbai",
      latitude: 19.1,
      longitude: 72.8,
      radiusMeters: 150,
      isActive: true,
    },
  ]);
  vi.mocked(attendanceApi.admin.policy).mockResolvedValue(null);
  vi.mocked(attendanceApi.admin.holidays).mockResolvedValue([
    { id: "holiday-1", name: "Diwali", date: "2026-11-08T00:00:00.000Z" },
  ]);
  vi.mocked(attendanceApi.admin.leaves).mockResolvedValue([]);
  vi.mocked(attendanceApi.admin.memberships).mockResolvedValue([]);
  vi.mocked(attendanceApi.admin.devices).mockResolvedValue([]);
  vi.mocked(attendanceApi.admin.exceptions).mockResolvedValue([]);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.resetAllMocks();
});

describe("Attendance administration", () => {
  it("loads persisted configuration and exposes every management section", async () => {
    await act(async () => {
      root.render(<AttendanceAdministrationPage />);
      await Promise.resolve();
    });
    await act(async () => { await Promise.resolve(); });

    expect(host.textContent).toContain("Attendance Administration");
    expect(host.textContent).toContain("Mumbai headquarters");
    expect(host.textContent).toContain("150 m radius");
    expect(host.querySelectorAll('[role="tab"]')).toHaveLength(7);

    const holidayTab = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
      .find((button) => button.textContent?.includes("Holidays"));
    await act(async () => holidayTab?.click());
    expect(host.textContent).toContain("Diwali");
  });
});
