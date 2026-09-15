import React, { useState } from "react";
import {
  NavLink,
  Outlet,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
} from "../../features/crm/CrmContext";
import { CrmFailure, statusLabel } from "../../features/crm/CrmControls";
import { AccountDto } from "../../features/crm/crm.types";
export interface BusinessContext {
  business: AccountDto;
  reload: () => void;
}
export default function BusinessLayoutWrapper() {
  const { businessId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { can, readOnly } = useCrm();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutation = useCrmMutation();
  const result = useCrmQuery(`account:${businessId}`, (service, signal) =>
    service.account(businessId, signal),
  );
  if (result.error)
    return <CrmFailure error={result.error} retry={result.reload} />;
  if (!result.data) return <p role="status">Loading business...</p>;
  const business = result.data;
  const root = `/admin/businesses/${business.id}`;
  const supported =
    location.pathname === root || location.pathname === `${root}/contacts`;
  async function remove() {
    const removed = await mutation.run(async (service, signal) => {
      await service.deleteAccount(business.id, business.revision, signal);
      return true;
    });
    if (removed) navigate("/admin/businesses");
  }
  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold text-slate-900">
            {business.name}
          </h1>
          <p className="text-sm text-slate-600">
            {statusLabel(business.status)} | Owner: {business.owner.displayName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/businesses")}
          >
            All businesses
          </Button>
          {can("crm.businesses.update") && !readOnly && (
            <Button onClick={() => navigate(`${root}/edit`)}>
              Edit business
            </Button>
          )}
          {can("crm.businesses.delete") && !readOnly && (
            <Button variant="outline" onClick={() => setConfirmDelete(true)}>
              Delete business
            </Button>
          )}
        </div>
      </header>
      {mutation.error && (
        <CrmFailure
          error={mutation.error}
          retry={() => {
            setConfirmDelete(false);
            mutation.clearError();
            result.reload();
          }}
        />
      )}
      {confirmDelete && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <p>
            Delete this business? All contacts must be removed first. Deleted
            businesses cannot be restored.
          </p>
          <div className="flex gap-2">
            <Button
              disabled={Boolean(mutation.error?.conflict)}
              isLoading={mutation.pending}
              onClick={remove}
            >
              Confirm deletion
            </Button>
            <Button
              variant="outline"
              disabled={mutation.pending}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <nav
        aria-label="Business sections"
        className="flex flex-wrap gap-4 border-b border-slate-200 pb-3"
      >
        <NavLink
          end
          to={root}
          className="text-sm font-semibold underline underline-offset-4"
        >
          Business details
        </NavLink>
        {can("crm.contacts.view") && (
          <NavLink
            to={`${root}/contacts`}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Contacts
          </NavLink>
        )}
      </nav>
      {supported ? (
        <Outlet
          context={
            { business, reload: result.reload } satisfies BusinessContext
          }
        />
      ) : (
        <p
          role="status"
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          This business section is not available yet.
        </p>
      )}
    </div>
  );
}
