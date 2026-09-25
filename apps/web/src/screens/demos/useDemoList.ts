import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { demoApi, DemoListParams, DemoPage, DemoView, toDemoItem } from "./demo.api";

type DemoListFilters = Omit<DemoListParams, "view">;

export function useDemoList(view: DemoView, filters: DemoListFilters = {}) {
  const [data, setData] = useState<DemoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 100;
  const search = filters.search;
  const status = filters.status;
  const demoType = filters.demoType;
  const executiveMembershipId = filters.executiveMembershipId;
  const from = filters.from;
  const to = filters.to;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    demoApi.list({ view, page, limit, search, status, demoType, executiveMembershipId, from, to }, controller.signal)
      .then(setData)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : "Unable to load demos");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [demoType, executiveMembershipId, from, limit, page, revision, search, status, to, view]);

  return { demos: data?.items.map(toDemoItem) ?? [], data, loading, refresh };
}
