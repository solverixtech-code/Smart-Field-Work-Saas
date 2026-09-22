import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import {
  useCrm,
  useCrmMutation,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import { leadApi } from "../../features/crm/lead.api";
import type { FollowUpRecord } from "../../features/crm/follow-up.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followUp?: FollowUpRecord;
  initialLeadId?: string;
  initialLeadName?: string;
}

export function FollowUpFormModal({
  isOpen,
  onClose,
  onSuccess,
  followUp,
  initialLeadId,
  initialLeadName,
}: Props) {
  const { can, readOnly } = useCrm();
  const canManage = can("crm.followups.manage") || can("crm.leads.update");
  const mutation = useCrmMutation();
  const [leadSearch, setLeadSearch] = useState("");
  const search = useDebouncedSearch(leadSearch);
  const [leadId, setLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedMembershipId, setAssignedMembershipId] = useState("");
  const leads = useCrmQuery(
    `follow-up-leads:${isOpen}:${search}`,
    async (_, signal) =>
      isOpen && !followUp && !initialLeadId && can("crm.leads.view")
        ? leadApi.list({ search, limit: 50 }, signal)
        : { items: [], total: 0, page: 1, limit: 50, totalPages: 0 },
  );
  const owners = useCrmQuery(`follow-up-owners:${isOpen}`, async (_, signal) =>
    isOpen && can("crm.leads.assign")
      ? leadApi.owners({ limit: 100 }, signal)
      : { items: [], total: 0, page: 1, limit: 100, totalPages: 0 },
  );

  useEffect(() => {
    if (!isOpen) return;
    setLeadId(followUp?.leadId ?? initialLeadId ?? "");
    setTitle(followUp?.title ?? "");
    setScheduledDate(followUp?.scheduledDate ?? "");
    setScheduledTime(followUp?.scheduledTime ?? "");
    setNotes(followUp?.notes ?? "");
    setAssignedMembershipId("");
  }, [isOpen, followUp, initialLeadId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const targetLeadId = followUp?.leadId ?? initialLeadId ?? leadId;
    if (!targetLeadId) return;
    const result = await mutation.run((_, signal) =>
      followUp
        ? leadApi.updateFollowUp(
            targetLeadId,
            followUp.id,
            {
              title,
              scheduledDate,
              scheduledTime,
              replaceNotes: notes || null,
              ...(can("crm.leads.assign") &&
              assignedMembershipId &&
              assignedMembershipId !== followUp.assignedMembershipId
                ? { assignedMembershipId }
                : {}),
            },
            signal,
          )
        : leadApi.createFollowUp(
            targetLeadId,
            {
              title,
              scheduledDate,
              scheduledTime,
              notes,
              ...(assignedMembershipId ? { assignedMembershipId } : {}),
            },
            signal,
          ),
    );
    if (result) {
      toast.success(followUp ? "Follow-up updated" : "Follow-up scheduled");
      onSuccess();
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={followUp ? "Edit follow-up" : "Add follow-up"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {!followUp && !initialLeadId && (
          <div className="space-y-2">
            <Input
              id="follow-up-lead-search"
              label="Find a lead"
              value={leadSearch}
              onChange={(event) => setLeadSearch(event.target.value)}
              placeholder="Search lead name or code"
            />
            {leads.error && (
              <p role="alert" className="text-xs text-red-700">
                {leads.error.message}
              </p>
            )}
            {!can("crm.leads.view") && (
              <p className="text-xs text-slate-600">
                Lead access is required to schedule a follow-up.
              </p>
            )}
            <Select
              label="Lead"
              value={leadId}
              onChange={(event) => setLeadId(event.target.value)}
              placeholder="Select a lead"
              searchable
              options={
                leads.data?.items.map((lead) => ({
                  value: lead.id,
                  label: lead.businessName || lead.name,
                  sublabel: lead.leadCode,
                })) ?? []
              }
            />
            {!leads.loading &&
              leads.data?.items.length === 0 &&
              can("crm.leads.view") && (
                <p className="text-xs text-slate-500">
                  No leads found. Try another search.
                </p>
              )}
          </div>
        )}
        {!followUp && initialLeadId && (
          <p className="text-xs text-slate-600">
            Lead: <strong>{initialLeadName ?? "Current lead"}</strong>
          </p>
        )}
        {followUp && (
          <p className="text-xs text-slate-600">
            Lead:{" "}
            <strong>{followUp.lead.businessName || followUp.lead.name}</strong>
          </p>
        )}
        <Input
          id="follow-up-title"
          label="Purpose"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={300}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            id="follow-up-date"
            label="Date"
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            required
          />
          <Input
            id="follow-up-time"
            label="Time"
            type="time"
            value={scheduledTime}
            onChange={(event) => setScheduledTime(event.target.value)}
            required
          />
        </div>
        {can("crm.leads.assign") && (
          <Select
            label="Assign to"
            value={assignedMembershipId}
            onChange={(event) => setAssignedMembershipId(event.target.value)}
            options={[
              {
                value: "",
                label: followUp
                  ? `Keep ${followUp.assignedMembership?.user.fullName || followUp.assignedToName}`
                  : "Assign to me",
              },
              ...(owners.data?.items.map((owner) => ({
                value: owner.id,
                label: owner.displayName,
              })) ?? []),
            ]}
          />
        )}
        <div>
          <label
            htmlFor="follow-up-notes"
            className="block text-xs font-bold text-slate-700"
          >
            Notes
          </label>
          <textarea
            id="follow-up-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-800 focus:outline-none"
          />
        </div>
        {mutation.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
          >
            {mutation.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            isLoading={mutation.pending}
            disabled={
              readOnly ||
              !canManage ||
              !Boolean(followUp?.leadId ?? initialLeadId ?? leadId)
            }
          >
            {followUp ? "Save changes" : "Schedule follow-up"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
