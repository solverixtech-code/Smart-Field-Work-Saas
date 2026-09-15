// @vitest-environment jsdom
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { expect, it, vi } from "vitest";
import store from "../../../store";
import { setAuthorization } from "../../../store/slices/authorizationSlice";
import {
  RuntimeBootstrapProvider,
  useRuntimeBootstrap,
} from "./RuntimeBootstrapContext";
import {
  runtimeService,
  RuntimeBootstrapDto,
} from "../services/runtime.service";
vi.mock("../services/runtime.service", () => ({
  runtimeService: { getBootstrap: vi.fn(), invalidateTenantCache: vi.fn() },
}));
vi.mock("../../../common/api", () => ({ api: {} }));
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const data = (id: string): RuntimeBootstrapDto => ({
  schemaVersion: 1,
  configVersion: id,
  generatedAt: "2026-09-15T00:00:00Z",
  nextRevalidationAt: null,
  principal: { userId: "user", tenantId: id, membershipId: `member-${id}` },
  tenant: { id, displayName: id, status: "ACTIVE" },
  access: {
    mode: "FULL",
    mapping: "SUBSCRIBED",
    subscriptionStatus: "ACTIVE",
    planVersionId: "plan",
  },
  modules: [{ code: "core_crm", status: "ACTIVE", source: "PLAN_VERSION" }],
  industry: null,
  settings: {
    timezone: "UTC",
    currency: "INR",
    locale: "en-IN",
    language: "en",
    dateFormat: "dd/MM/yyyy",
    weekStartDay: "MONDAY",
    financialYearStartMonth: 4,
  },
  settingsProvenance: "SYSTEM",
  permissions: [],
  masters: {
    strategy: "MANIFEST",
    canRead: false,
    canManage: false,
    definitions: [],
  },
});
function select(id: string) {
  store.dispatch(
    setAuthorization({
      schemaVersion: 1,
      user: {
        id: "user",
        fullName: "Test",
        email: "test@test.invalid",
        avatarUrl: null,
      },
      session: { id: "session" },
      platform: { roleCodes: [], permissions: [], permissionVersion: null },
      tenant: {
        id,
        membershipId: `member-${id}`,
        roleCode: "tenant_admin",
        dataScope: null,
        permissions: [],
        permissionVersion: "1",
      },
    }),
  );
}
function Read() {
  const runtime = useRuntimeBootstrap();
  return (
    <div>
      {runtime.loading
        ? "Loading"
        : (runtime.bootstrap?.tenant.displayName ??
          runtime.error ??
          "No workspace")}
    </div>
  );
}
it("runtime bootstrap ignores the previous tenant response after an authorization switch", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let resolveA: (value: RuntimeBootstrapDto) => void = () => {};
  const a = new Promise<RuntimeBootstrapDto>((resolve) => {
    resolveA = resolve;
  });
  vi.mocked(runtimeService.getBootstrap).mockImplementation(() =>
    store.getState().authorization.tenant?.id === "a"
      ? a
      : Promise.resolve(data("b")),
  );
  store.dispatch({
    type: "auth/setCredentials",
    payload: {
      accessToken: "test-token",
      user: { id: "user", fullName: "Test", email: "test@test.invalid" },
    },
  });
  select("a");
  try {
    await act(async () =>
      root.render(
        <Provider store={store}>
          <RuntimeBootstrapProvider>
            <Read />
          </RuntimeBootstrapProvider>
        </Provider>,
      ),
    );
    await act(async () => select("b"));
    expect(host.textContent).toBe("b");
    await act(async () => resolveA(data("a")));
    expect(host.textContent).toBe("b");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});
