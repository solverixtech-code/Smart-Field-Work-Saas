// @vitest-environment jsdom
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import { readFileSync } from "node:fs";
import { CrmBoundary } from "./CrmContext";
import { CrmRequestScope, crmError } from "./crm.state";
import { AccountForm } from "./CrmForms";
import AllBusinessesPage from "../../screens/businesses/AllBusinessesPage";
import type { AccountDto, CrmService } from "./crm.types";
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const state = vi.hoisted(() => ({ tenant: "tenant-a", token: "token-a" }));
vi.mock("../../common/api", () => ({ api: {} }));
vi.mock("../../store", () => ({
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({
      auth: { accessToken: state.token },
      authorization: {
        loaded: true,
        loading: false,
        tenant: {
          id: state.tenant,
          membershipId: `member-${state.tenant}`,
          permissionVersion: "1",
          permissions: [
            "crm.businesses.view",
            "crm.businesses.update",
            "crm.businesses.create",
            "crm.businesses.access.tenant",
          ],
        },
      },
    }),
}));
vi.mock("../runtime/context/RuntimeBootstrapContext", () => ({
  useRuntimeBootstrap: () => ({
    loading: false,
    error: null,
    isReadOnly: false,
    bootstrap: {
      principal: {
        tenantId: state.tenant,
        membershipId: `member-${state.tenant}`,
      },
    },
  }),
}));
const initial: AccountDto = {
  id: "record-a",
  tenantId: "tenant-a",
  name: "Original business",
  revision: 1,
  status: "ACTIVE",
  owner: { id: "member-a", displayName: "Owner" },
  ownerMembershipId: "member-a",
  businessType: null,
  source: null,
  createdAt: "2026-09-15T00:00:00Z",
  updatedAt: "2026-09-15T00:00:00Z",
};
const rejected = () =>
  Promise.reject(new Error("Unexpected service operation"));
function service(): CrmService {
  return {
    accounts: vi.fn(rejected),
    account: vi.fn(rejected),
    createAccount: vi.fn(rejected),
    updateAccount: vi.fn(rejected),
    deleteAccount: vi.fn(rejected),
    contacts: vi.fn(rejected),
    contact: vi.fn(rejected),
    createContact: vi.fn(rejected),
    updateContact: vi.fn(rejected),
    deleteContact: vi.fn(rejected),
    primary: vi.fn(rejected),
    owners: vi.fn(rejected),
    masters: vi.fn(rejected),
  };
}
function failure(status: number) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: { code: status === 409 ? "CRM_STALE_REVISION" : undefined },
    },
  } as AxiosError;
}
let host: HTMLDivElement, root: Root;
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
function view(api: CrmService, page: React.ReactNode = <AllBusinessesPage />) {
  return (
    <React.StrictMode>
      <MemoryRouter>
        <Routes>
          <Route element={<CrmBoundary service={api} />}>
            <Route path="/" element={page} />
          </Route>
        </Routes>
      </MemoryRouter>
    </React.StrictMode>
  );
}
async function click(text: string) {
  const button = Array.from(host.querySelectorAll("button")).find((b) =>
    b.textContent?.includes(text),
  );
  expect(button).toBeTruthy();
  await act(async () => button!.click());
  await flush();
}
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  state.tenant = "tenant-a";
  state.token = "token-a";
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("CRM frontend production flow", () => {
  it("loads real totals and records under StrictMode", async () => {
    const api = service();
    vi.mocked(api.accounts).mockResolvedValue({
      items: [initial],
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    });
    await act(async () => root.render(view(api)));
    await flush();
    expect(host.textContent).toContain("Original business");
    expect(host.textContent).toContain("1 businesses");
    expect(host.textContent).not.toContain("5,842");
  });
  it("uses server totals, not the displayed page, for status KPIs", async () => {
    const api = service();
    vi.mocked(api.accounts).mockImplementation(async (query) => ({
      items: query.limit === 1 ? [] : [initial],
      page: 1,
      limit: query.limit ?? 25,
      totalPages: 4,
      total:
        query.status === "ACTIVE"
          ? 71
          : query.status === "INACTIVE"
            ? 19
            : query.status === "BLOCKED"
              ? 10
              : 100,
    }));
    await act(async () => root.render(view(api)));
    await flush();
    expect(host.textContent).toContain("100 businesses");
    for (const [label, count] of [
      ["Total Businesses", "100"],
      ["Active Businesses", "71"],
      ["Inactive Businesses", "19"],
      ["Blocked Businesses", "10"],
    ]) {
      const title = Array.from(host.querySelectorAll("span[title]")).find(
        (el) => el.getAttribute("title") === label,
      );
      expect(title?.parentElement?.parentElement?.textContent).toContain(count);
    }
    expect(api.accounts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 1, status: "ACTIVE" }),
      expect.any(AbortSignal),
    );
  });
  it("renders a real empty result without fixture fallback", async () => {
    const api = service();
    vi.mocked(api.accounts).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 0,
    });
    await act(async () => root.render(view(api)));
    await flush();
    expect(host.textContent).toContain("No businesses yet");
    for (const label of [
      "Total Businesses",
      "Active Businesses",
      "Inactive Businesses",
      "Blocked Businesses",
      "New This Month",
      "Businesses by Status",
      "Businesses by Source",
      "Quick Actions",
    ])
      expect(host.textContent).toContain(label);
    expect(host.textContent).toContain("Monthly analytics unavailable");
    expect(
      host.querySelector<HTMLButtonElement>(
        'button[title="Export is not available in this phase"]',
      )?.disabled,
    ).toBe(true);
  });
  it.each([400, 401, 403, 404, 409, 412, 422, 429, 500])(
    "shows explicit API %s failure without demo data",
    async (status) => {
      const api = service();
      vi.mocked(api.accounts).mockRejectedValue(failure(status));
      await act(async () => root.render(view(api)));
      await flush();
      expect(host.querySelector('[role="alert"]')?.textContent).toContain(
        crmError(failure(status)).message,
      );
      expect(host.textContent).not.toContain(initial.name);
      expect(host.querySelector("tbody")).toBeNull();
    },
  );
  it("ignores a late Tenant A list after switching to Tenant B", async () => {
    const api = service();
    let resolveA: (
      value: Awaited<ReturnType<CrmService["accounts"]>>,
    ) => void = () => {};
    const pending = new Promise<Awaited<ReturnType<CrmService["accounts"]>>>(
      (resolve) => {
        resolveA = resolve;
      },
    );
    vi.mocked(api.accounts).mockImplementation(() =>
      state.tenant === "tenant-a"
        ? pending
        : Promise.resolve({
            items: [
              {
                ...initial,
                id: "record-b",
                tenantId: "tenant-b",
                name: "Tenant B business",
              },
            ],
            total: 1,
            page: 1,
            limit: 25,
            totalPages: 1,
          }),
    );
    await act(async () => root.render(view(api)));
    expect(host.textContent).not.toContain(initial.name);
    state.tenant = "tenant-b";
    state.token = "token-b";
    await act(async () => root.render(view(api)));
    await flush();
    await act(async () =>
      resolveA({
        items: [initial],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      }),
    );
    await flush();
    expect(host.textContent).toContain("Tenant B business");
    expect(host.textContent).not.toContain(initial.name);
  });
  it("retains edits on 409, reloads current revision, and requires a separate submit", async () => {
    const api = service();
    vi.mocked(api.updateAccount).mockRejectedValue(failure(409));
    vi.mocked(api.account).mockResolvedValue({
      ...initial,
      name: "Changed elsewhere",
      revision: 2,
    });
    await act(async () =>
      root.render(view(api, <AccountForm initial={initial} />)),
    );
    await flush();
    const input = host.querySelector<HTMLInputElement>("#business-name")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "My retained edits");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    await flush();
    expect(input.value).toBe("My retained edits");
    expect(api.updateAccount).toHaveBeenCalledTimes(1);
    expect(
      host.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    ).toBe(true);
    await click("Reload current revision");
    expect(host.textContent).toContain("Changed elsewhere");
    expect(input.value).toBe("My retained edits");
    expect(api.updateAccount).toHaveBeenCalledTimes(1);
    await act(async () =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    await flush();
    expect(api.updateAccount).toHaveBeenLastCalledWith(
      initial.id,
      expect.objectContaining({
        name: "My retained edits",
        expectedRevision: 2,
      }),
      expect.any(AbortSignal),
    );
  });
  it("does not retry an uncertain create", async () => {
    const api = service();
    vi.mocked(api.createAccount).mockRejectedValue(failure(500));
    await act(async () => root.render(view(api, <AccountForm />)));
    await act(async () =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    await flush();
    expect(api.createAccount).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[role="alert"]')).not.toBeNull();
  });
  it("blocks completion of a mutation from a disposed workspace even if transport ignores abort", async () => {
    const scope = new CrmRequestScope();
    let resolve: (value: number) => void = () => {};
    const pending = scope.run(
      () =>
        new Promise<number>((r) => {
          resolve = r;
        }),
    );
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    scope.dispose();
    scope.activate();
    resolve(7);
    await rejected;
  });
  it("keeps converted pages free of fixtures, raw transport and first-record fallbacks", () => {
    for (const filename of [
      "AllBusinessesPage",
      "AddBusinessPage",
      "BusinessLayoutWrapper",
      "BusinessDetailsPage",
      "BusinessContactsPage",
    ]) {
      const source = readFileSync(
        `src/screens/businesses/${filename}.tsx`,
        "utf8",
      );
      expect(source).not.toMatch(
        /businessesData|mockBusinesses|mockContacts|axios|fetch\(|\[0\]/,
      );
    }
  });
});
