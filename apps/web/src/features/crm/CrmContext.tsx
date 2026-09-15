import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useRuntimeBootstrap } from "../runtime/context/RuntimeBootstrapContext";
import { crmApi } from "./crm.api";
import { CrmRequestScope, crmError, CrmError } from "./crm.state";
import type { CrmService } from "./crm.types";
const Context = createContext<{
  service: CrmService;
  scope: CrmRequestScope;
  can: (permission: string) => boolean;
  readOnly: boolean;
} | null>(null);
function Session({
  children,
  permissions,
  readOnly,
  service,
}: {
  children: React.ReactNode;
  permissions: string[];
  readOnly: boolean;
  service: CrmService;
}) {
  const [scope] = useState(() => new CrmRequestScope());
  useLayoutEffect(() => {
    scope.activate();
    return () => scope.dispose();
  }, [scope]);
  return (
    <Context.Provider
      value={{ service, scope, readOnly, can: (p) => permissions.includes(p) }}
    >
      {children}
    </Context.Provider>
  );
}
export function CrmBoundary({ service = crmApi }: { service?: CrmService }) {
  const authorization = useAppSelector((s) => s.authorization);
  const token = useAppSelector((s) => s.auth.accessToken);
  const runtime = useRuntimeBootstrap();
  const tenant = authorization.tenant;
  if (
    runtime.loading ||
    authorization.loading ||
    !authorization.loaded ||
    !tenant?.id
  )
    return <p role="status">Loading workspace...</p>;
  if (runtime.error)
    return (
      <p role="alert">
        Workspace settings could not be loaded. Reload the page to try again.
      </p>
    );
  if (
    runtime.bootstrap?.principal.tenantId !== tenant.id ||
    runtime.bootstrap.principal.membershipId !== tenant.membershipId
  )
    return (
      <p role="alert">
        Workspace selection changed. Reload to load its settings.
      </p>
    );
  return (
    <Session
      key={`${tenant.id}:${tenant.membershipId}:${tenant.permissionVersion}:${token}`}
      service={service}
      permissions={tenant.permissions}
      readOnly={runtime.isReadOnly}
    >
      <Outlet />
    </Session>
  );
}
export function useCrm() {
  const value = useContext(Context);
  if (!value) throw new Error("CRM session required");
  return value;
}
export function useCrmQuery<T>(
  key: string,
  load: (service: CrmService, signal: AbortSignal) => Promise<T>,
) {
  const { service, scope } = useCrm();
  const loader = useRef(load);
  loader.current = load;
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data?: T;
    error?: CrmError;
    loading: boolean;
  }>({ key, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    scope.signal.addEventListener("abort", abort);
    let active = true;
    setState({ key, loading: true });
    loader
      .current(service, controller.signal)
      .then((data) => {
        if (active && !scope.signal.aborted)
          setState({ key, data, loading: false });
      })
      .catch((error) => {
        if (active && !scope.signal.aborted)
          setState({ key, error: crmError(error), loading: false });
      });
    return () => {
      active = false;
      controller.abort();
      scope.signal.removeEventListener("abort", abort);
    };
  }, [key, version, service, scope]);
  return {
    ...(state.key === key ? state : { key, loading: true }),
    reload: () => setVersion((v) => v + 1),
  };
}
export function useDebouncedSearch(value: string) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setResult(value), 300);
    return () => clearTimeout(timeout);
  }, [value]);
  return result;
}
export function useCrmMutation() {
  const { service, scope } = useCrm();
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState<CrmError>();
  async function run<T>(
    work: (service: CrmService, signal: AbortSignal) => Promise<T>,
  ): Promise<T | undefined> {
    if (busy.current || scope.signal.aborted) return;
    busy.current = true;
    setPending(true);
    setError(undefined);
    try {
      return await scope.run((signal) => work(service, signal));
    } catch (failure) {
      if (!scope.signal.aborted) setError(crmError(failure));
      return undefined;
    } finally {
      busy.current = false;
      if (!scope.signal.aborted) setPending(false);
    }
  }
  return { run, pending, error, clearError: () => setError(undefined) };
}
