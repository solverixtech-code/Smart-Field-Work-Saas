// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../common/api";
import { CrmBoundary } from "../../features/crm/CrmContext";
import FollowUpsListPage from "./FollowUpsListPage";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../../common/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));
vi.mock("../../store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { accessToken: "field-token" },
      authorization: {
        loaded: true,
        loading: false,
        tenant: {
          id: "tenant-a",
          membershipId: "field-member",
          permissionVersion: "1",
          permissions: [
            "crm.followups.view",
            "crm.followups.manage",
            "crm.leads.view",
            "crm.leads.access.assigned",
          ],
        },
      },
    }),
}));
vi.mock("../../features/runtime/context/RuntimeBootstrapContext", () => ({
  useRuntimeBootstrap: () => ({
    loading: false,
    error: null,
    isReadOnly: false,
    bootstrap: { principal: { tenantId: "tenant-a", membershipId: "field-member" } },
  }),
}));

let host: HTMLDivElement;
let root: Root;
const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/tenant/crm/follow-ups")
      return { data: {
        items: [], total: 0, page: 1, limit: 25, totalPages: 0,
        today: "2026-09-22", summary: { completed: 0, pending: 0, overdue: 0, today: 0 },
      } } as never;
    if (url === "/tenant/crm/leads")
      return { data: {
        items: [{ id: "assigned-lead", name: "Acme Retail Solutions", businessName: "Acme Retail Solutions", leadCode: "LD-000001" }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      } } as never;
    throw new Error(`Unexpected GET ${url}`);
  });
  vi.mocked(api.post).mockResolvedValue({ data: { id: "follow-up-1" } } as never);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.clearAllMocks();
});

describe("field executive follow-ups", () => {
  it("opens the shared Add follow-up modal and schedules one on an assigned lead", async () => {
    await act(async () => root.render(
      <MemoryRouter initialEntries={["/admin/follow-ups"]}>
        <Routes>
          <Route element={<CrmBoundary />}>
            <Route path="/admin/follow-ups" element={<FollowUpsListPage view="all" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    ));
    await flush();

    const add = Array.from(host.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Add follow-up"),
    );
    expect(add).toBeTruthy();
    await act(async () => add!.click());
    await flush();

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain("Add new follow-up");
    const leadSelect = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent?.includes("Select a lead"))!;
    await act(async () => leadSelect.click());
    const leadOption = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((button) => button.textContent?.includes("Acme Retail Solutions"))!;
    await act(async () => leadOption.click());

    expect(dialog.textContent).toContain("09:00 AM");
    const timeTrigger = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent?.includes("09:00 AM"))!;
    await act(async () => timeTrigger.click());
    await flush();
    const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
    expect(dialogs).toHaveLength(2);
    const clockDialog = dialogs[dialogs.length - 1];
    expect(clockDialog.textContent).toContain("Clock Time Picker");
    const done = Array.from(clockDialog.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent === "Done")!;
    await act(async () => done.click());
    await flush();

    const title = dialog.querySelector<HTMLInputElement>("#follow-up-title")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(title, "Call buyer");
      title.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => dialog.querySelector("form")!.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    ));
    await flush();
    expect(api.post).toHaveBeenCalledWith(
      "/tenant/crm/leads/assigned-lead/follow-ups",
      expect.objectContaining({
        title: "Call buyer",
        scheduledDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: "09:00 AM",
      }),
      expect.any(Object),
    );
  });
});
