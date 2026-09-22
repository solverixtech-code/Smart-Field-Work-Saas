import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, UserCheck, AlertCircle, Building2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Checkbox } from "../../components/ui/Checkbox";
import {
  useCrm,
  useCrmMutation,
  useCrmQuery,
} from "../../features/crm/CrmContext";
import { CrmFailure } from "../../features/crm/CrmControls";
import { getEmployeeProfile } from "../territories/territoriesData";

export default function BulkAssignLeadsPage() {
  const navigate = useNavigate();
  const { readOnly, can } = useCrm();
  const mutation = useCrmMutation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetMembershipId, setTargetMembershipId] = useState("");
  const [reason, setReason] = useState("");

  const leads = useCrmQuery("bulk-unassigned-leads", (service, signal) =>
    service.leads.list({ unassigned: "true", page: 1, limit: 100 }, signal),
  );
  const owners = useCrmQuery("bulk-assignment-owners", (service, signal) =>
    service.leads.owners({ page: 1, limit: 100 }, signal),
  );
  const rows = leads.data?.items ?? [];
  const ownerOptions = useMemo(
    () =>
      (owners.data?.items ?? []).map((owner) => {
        const profile = getEmployeeProfile(owner.displayName, owner.role, owner.avatarUrl);
        return {
          value: owner.id,
          label: owner.employeeCode || owner.email
            ? `${owner.displayName} (${owner.employeeCode || owner.email})`
            : owner.displayName,
          sublabel: [profile.sublabel, owner.email].filter(Boolean).join(" · "),
          avatar: profile.avatar,
        };
      }),
    [owners.data?.items],
  );

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? rows.map((lead) => lead.id) : []);
  const toggleOne = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : [...current, id],
    );

  const handleBulkAssign = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!targetMembershipId) {
      toast.error("Choose the target assignee.");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Select at least one lead.");
      return;
    }
    const result = await mutation.run((service, signal) =>
      service.leads.bulkAssign(
        {
          leadIds: selectedIds,
          assignedMembershipId: targetMembershipId,
          reason: reason.trim() || undefined,
        },
        signal,
      ),
    );
    if (result) {
      toast.success(`Assigned ${result.assigned} lead(s).`);
      navigate("/admin/leads");
    }
  };

  return (
    <form className="space-y-3 pb-12 font-sans" onSubmit={handleBulkAssign}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/leads")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#0D1F3D]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </button>

        <Button
          variant="accent"
          size="sm"
          type="submit"
          disabled={readOnly || !can("crm.leads.assign")}
          isLoading={mutation.pending}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          <UserCheck className="h-4 w-4" /> Apply Bulk Assignment (
          {selectedIds.length})
        </Button>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600 shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">
                Bulk Lead Assignment
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Select unassigned leads and assign them to an active tenant
                member in one atomic operation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-semibold">
          <label className="block font-bold text-[#0D1F3D]">
            Select Target Assignee *
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={targetMembershipId}
              onChange={(event) => setTargetMembershipId(event.target.value)}
              options={ownerOptions}
              searchable={true}
              placeholder={
                owners.loading ? "Loading assignees..." : "Search assignee..."
              }
              disabled={owners.loading || ownerOptions.length === 0}
            />
            <div className="flex items-center gap-2 font-medium text-slate-500">
              <AlertCircle className="h-4 w-4 shrink-0 text-purple-600" />
              <span>
                The API validates every selected lead and rolls back the batch
                if any record is invalid.
              </span>
            </div>
          </div>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] shadow-xs outline-none focus:border-[#0D1F3D]"
            placeholder="Reason for reassignment, if applicable"
          />
        </div>

        {mutation.error && <CrmFailure error={mutation.error} />}
        {leads.error && <CrmFailure error={leads.error} retry={leads.reload} />}

        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-[#0D1F3D]">
            Select Leads to Assign ({rows.length} Available)
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3 text-center">
                    <Checkbox
                      checked={
                        rows.length > 0 && selectedIds.length === rows.length
                      }
                      onChange={toggleAll}
                      aria-label="Select all unassigned leads"
                    />
                  </th>
                  <th className="p-3">Lead Code</th>
                  <th className="p-3">Business</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {rows.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                        aria-label={`Select ${lead.leadCode}`}
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {lead.leadCode}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-extrabold text-[#0D1F3D]">
                          {lead.businessName || lead.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">{lead.contactName || "Not set"}</td>
                    <td className="p-3">{lead.city || "Not set"}</td>
                    <td className="p-3">{lead.priority}</td>
                  </tr>
                ))}
                {!leads.loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No unassigned leads are available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate("/admin/leads")}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            type="submit"
            disabled={readOnly || !can("crm.leads.assign")}
            isLoading={mutation.pending}
            className="font-bold shadow-xs"
          >
            Confirm Bulk Assignment
          </Button>
        </div>
      </div>
    </form>
  );
}
