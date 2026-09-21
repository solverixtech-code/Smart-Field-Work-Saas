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
import AllLeadsPage from "../../screens/leads/AllLeadsPage";
import { LeadForm, LeadConversionModal, LeadAssignment } from "./LeadForms";
import type { LeadCounts, LeadDto } from "./lead.types";
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
            "crm.leads.view",
            "crm.leads.create",
            "crm.leads.update",
            "crm.leads.assign",
            "crm.leads.convert",
            "crm.leads.delete",
            "crm.leads.import",
            "crm.leads.export",
            "crm.leads.access.tenant",
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
    leads: {
      list: vi.fn(rejected),
      counts: vi.fn(rejected),
      summary: vi.fn(rejected),
      get: vi.fn(rejected),
      create: vi.fn(rejected),
      update: vi.fn(rejected),
      assign: vi.fn(rejected),
      remove: vi.fn(rejected),
      convert: vi.fn(rejected),
      owners: vi.fn(rejected),
      bulkAssign: vi.fn(rejected),
      importPreview: vi.fn(rejected),
      importLeads: vi.fn(rejected),
      exportCsv: vi.fn(rejected),
      history: vi.fn(rejected),
      addNote: vi.fn(rejected),
      visits: vi.fn(rejected),
      createVisit: vi.fn(rejected),
      followUps: vi.fn(rejected),
      createFollowUp: vi.fn(rejected),
      updateFollowUp: vi.fn(rejected),
      demos: vi.fn(rejected),
      createDemo: vi.fn(rejected),
      communications: vi.fn(rejected),
      createCommunication: vi.fn(rejected),
    },
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
    deals: vi.fn(rejected),
    dealSummary: vi.fn(rejected),
    deal: vi.fn(rejected),
    createDeal: vi.fn(rejected),
    updateDeal: vi.fn(rejected),
    updateDealStage: vi.fn(rejected),
    deleteDeal: vi.fn(rejected),
    territories: vi.fn(rejected),
    territoryMemberOptions: vi.fn(rejected),
    territory: vi.fn(rejected),
    createTerritory: vi.fn(rejected),
    updateTerritory: vi.fn(rejected),
    deleteTerritory: vi.fn(rejected),
    territoryMembers: vi.fn(rejected),
    assignTerritoryMember: vi.fn(rejected),
    unassignTerritoryMember: vi.fn(rejected),
    territoryBusinesses: vi.fn(rejected),
    assignTerritoryBusiness: vi.fn(rejected),
    unassignTerritoryBusiness: vi.fn(rejected),
    territoryTargets: vi.fn(rejected),
    updateTerritoryTarget: vi.fn(rejected),
    territoryPerformance: vi.fn(rejected),
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

const lead: LeadDto = {
  id: "lead-a",
  tenantId: "tenant-a",
  leadCode: "LD-000001",
  name: "Real lead",
  kind: "BUSINESS",
  businessName: "Real lead",
  contactName: "Real buyer",
  phone: "+919876543210",
  email: "buyer@example.com",
  website: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  postalCode: null,
  countryCode: null,
  description: null,
  sourceValueId: null,
  estimatedValue: null,
  expectedClosingDate: null,
  nextFollowUpAt: null,
  nextActionNote: null,
  requirementNote: null,
  disqualificationReason: null,
  status: "QUALIFIED",
  priority: "HIGH",
  revision: 2,
  ownerMembershipId: "member-a",
  assignedMembershipId: null,
  owner: { id: "member-a", displayName: "Owner" },
  assignee: null,
  source: null,
  accountId: null,
  contactId: null,
  convertedAccountId: null,
  convertedContactId: null,
  convertedAt: null,
  convertedByMembershipId: null,
  createdAt: "2026-09-15T00:00:00Z",
  updatedAt: "2026-09-15T00:00:00Z",
};
function leadService() {
  const api = service();
  const counts: LeadCounts = {
    total: 97,
    unassigned: 12,
    pendingFollowUps: 3,
    lifecycle: [{ status: "QUALIFIED", count: 97 }],
    priorities: [{ priority: "HIGH", count: 97 }],
    sources: [],
  };
  vi.mocked(api.leads.counts).mockResolvedValue(counts);
  vi.mocked(api.leads.summary).mockResolvedValue(counts);
  vi.mocked(api.leads.owners).mockResolvedValue({
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 25,
  });
  vi.mocked(api.accounts).mockResolvedValue({
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 25,
  });
  return api;
}
async function inputValue(selector: string, value: string) {
  const input = host.querySelector<HTMLInputElement>(selector)!;
  expect(input).toBeTruthy();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function submitForm(container: ParentNode = host) {
  await act(async () =>
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  await flush();
}
describe("Lead frontend production flows", () => {
  it("preserves the rich zero state and uses aggregate totals rather than a page", async () => {
    const api = leadService();
    vi.mocked(api.leads.list).mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      limit: 25,
    });
    await act(async () => root.render(view(api, <AllLeadsPage />)));
    await flush();
    for (const text of [
      "Total Leads",
      "Hot High Priority",
      "Pending Follow-ups",
      "Unassigned Leads",
      "Converted",
      "Leads by Lifecycle",
      "Top Lead Sources",
      "No leads yet.",
    ])
      expect(host.textContent).toContain(text);
    expect(host.textContent).toContain("97");
    expect(host.textContent).toContain("Import Leads");
    expect(host.textContent).toContain("Export Data");
    expect(host.textContent).toContain("Bulk Assign");
  });
  it.each([400, 401, 403, 404, 409, 412, 422, 429, 500])(
    "renders Lead API %s without fixture fallback",
    async (status) => {
      const api = leadService();
      vi.mocked(api.leads.list).mockRejectedValue(failure(status));
      await act(async () => root.render(view(api, <AllLeadsPage />)));
      await flush();
      expect(host.querySelector('[role="alert"]')?.textContent).toContain(
        crmError(failure(status)).message,
      );
      expect(host.querySelector("tbody")).toBeNull();
      expect(host.textContent).not.toContain("Real lead");
    },
  );
  it("shows loading and ignores the old tenant response after a switch", async () => {
    const api = leadService();
    let resolveA: (
      value: Awaited<ReturnType<typeof api.leads.list>>,
    ) => void = () => {};
    const pending = new Promise<Awaited<ReturnType<typeof api.leads.list>>>(
      (resolve) => {
        resolveA = resolve;
      },
    );
    vi.mocked(api.leads.list).mockImplementation(() =>
      state.tenant === "tenant-a"
        ? pending
        : Promise.resolve({
            items: [{ ...lead, id: "lead-b", name: "Tenant B lead" }],
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 25,
          }),
    );
    await act(async () => root.render(view(api, <AllLeadsPage />)));
    expect(host.textContent).not.toContain(lead.name);
    state.tenant = "tenant-b";
    state.token = "token-b";
    await act(async () => root.render(view(api, <AllLeadsPage />)));
    await flush();
    await act(async () =>
      resolveA({ items: [lead], total: 1, totalPages: 1, page: 1, limit: 25 }),
    );
    await flush();
    expect(host.textContent).toContain("Tenant B lead");
    expect(host.textContent).not.toContain(lead.name);
  });
  it.each([400, 409, 412, 422])(
    "retains Lead edits on %s and requires explicit revision reload for conflicts",
    async (status) => {
      const api = leadService();
      vi.mocked(api.leads.update).mockRejectedValue(failure(status));
      vi.mocked(api.leads.get).mockResolvedValue({
        ...lead,
        name: "Changed elsewhere",
        revision: 3,
      });
      await act(async () =>
        root.render(view(api, <LeadForm initial={lead} />)),
      );
      await flush();
      await inputValue("#lead-name", "My lead draft");
      await submitForm();
      expect(host.querySelector<HTMLInputElement>("#lead-name")?.value).toBe(
        "My lead draft",
      );
      if (status === 409 || status === 412) {
        expect(
          host.querySelector<HTMLButtonElement>('button[type="submit"]')
            ?.disabled,
        ).toBe(true);
        await click("Reload current revision");
        expect(host.textContent).toContain("Changed elsewhere");
        expect(api.leads.update).toHaveBeenCalledTimes(1);
        await submitForm();
        expect(api.leads.update).toHaveBeenLastCalledWith(
          lead.id,
          expect.objectContaining({
            name: "My lead draft",
            expectedRevision: 3,
          }),
          expect.any(AbortSignal),
        );
      }
    },
  );
  it("clears a retained form draft when switching tenants", async () => {
    const api = leadService();
    await act(async () => root.render(view(api, <LeadForm />)));
    await inputValue("#lead-name", "Tenant A draft");
    state.tenant = "tenant-b";
    state.token = "token-b";
    await act(async () => root.render(view(api, <LeadForm />)));
    expect(host.querySelector<HTMLInputElement>("#lead-name")?.value).toBe("");
  });
  it("renders row actions outside table overflow and supports keyboard dismissal", async () => {
    const api = leadService();
    vi.mocked(api.leads.list).mockResolvedValue({
      items: [lead],
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 25,
    });
    await act(async () => root.render(view(api, <AllLeadsPage />)));
    await flush();
    const trigger = host.querySelector<HTMLButtonElement>(
      'button[aria-label="More Actions"]',
    )!;
    await act(async () => trigger.click());
    await flush();
    const menu = document.querySelector('[role="menu"]')!;
    expect(menu).toBeTruthy();
    expect(host.contains(menu)).toBe(false);
    expect(document.activeElement?.getAttribute("role")).toBe("menuitem");
    await act(async () =>
      menu.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("uses the shared Modal portal and retries an uncertain conversion with the same command", async () => {
    const api = leadService(),
      done = vi.fn(),
      close = vi.fn();
    vi.mocked(api.leads.convert).mockRejectedValue(failure(500));
    await act(async () =>
      root.render(
        view(
          api,
          <LeadConversionModal lead={lead} onSaved={done} onClose={close} />,
        ),
      ),
    );
    await flush();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog).toBeTruthy();
    expect(host.contains(dialog)).toBe(false);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    await submitForm(dialog);
    await submitForm(dialog);
    const calls = vi.mocked(api.leads.convert).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).toEqual(calls[1][1]);
    expect(done).not.toHaveBeenCalled();
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(close).toHaveBeenCalled();
  });
  it("keeps assignment selections on a stale revision", async () => {
    const api = leadService();
    vi.mocked(api.leads.assign).mockRejectedValue(failure(409));
    const saved = vi.fn();
    await act(async () =>
      root.render(view(api, <LeadAssignment lead={lead} onSaved={saved} />)),
    );
    await flush();
    await submitForm();
    expect(saved).not.toHaveBeenCalled();
    expect(host.textContent).toContain("Reload current revision");
    expect(api.leads.assign).toHaveBeenCalledWith(
      lead.id,
      {
        expectedRevision: 2,
        ownerMembershipId: "member-a",
        assignedMembershipId: null,
      },
      expect.any(AbortSignal),
    );
  });
  it("queries the real follow-up filter instead of a fabricated lifecycle", async () => {
    const api = leadService();
    vi.mocked(api.leads.list).mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 1,
      limit: 25,
    });
    await act(async () =>
      root.render(view(api, <AllLeadsPage viewMode="follow-up" />)),
    );
    await flush();
    expect(api.leads.list).toHaveBeenCalledWith(
      expect.objectContaining({ followUp: "pending" }),
      expect.any(AbortSignal),
    );
  });
  it("keeps every converted route free of fixture imports and raw transport", () => {
    for (const file of [
      "AllLeadsPage",
      "AddLeadPage",
      "EditLeadPage",
      "LeadDetailsPage",
      "tabs/LeadAssignmentTab",
      "tabs/LeadOverviewTab",
    ])
      expect(
        readFileSync("src/screens/leads/" + file + ".tsx", "utf8"),
      ).not.toMatch(/leadsData|mockLeads|axios|fetch\(/);
    expect(
      readFileSync("src/screens/leads/AllLeadsPage.tsx", "utf8"),
    ).toContain("RowActionsMenu");
  });
});
