import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Briefcase, RotateCcw, User } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ClockTimePickerModal } from "../../components/ui/ClockTimePickerModal";
import { DatePicker } from "../../components/ui/DatePicker";
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

function localDateKey() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
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
  const selectedLead = leads.data?.items.find((lead) => lead.id === leadId);
  const targetName = followUp
    ? followUp.lead.businessName || followUp.lead.name
    : initialLeadId
      ? initialLeadName || "Current lead"
      : selectedLead?.businessName || selectedLead?.name;

  useEffect(() => {
    if (!isOpen) return;
    setLeadId(followUp?.leadId ?? initialLeadId ?? "");
    setTitle(followUp?.title ?? "");
    setScheduledDate(followUp?.scheduledDate ?? localDateKey());
    setScheduledTime(followUp?.scheduledTime ?? "09:00 AM");
    setNotes(followUp?.notes ?? "");
    setAssignedMembershipId("");
  }, [isOpen, followUp, initialLeadId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const targetLeadId = followUp?.leadId ?? initialLeadId ?? leadId;
    if (!targetLeadId) {
      toast.error("Select a lead before scheduling the follow-up.");
      return;
    }
    if (!title.trim() || !scheduledDate || !scheduledTime) {
      toast.error("Enter the follow-up purpose, date and time.");
      return;
    }
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
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-red-200/60 bg-red-50 text-red-600 shadow-xs">
            <RotateCcw className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-extrabold leading-tight text-[#0D1F3D]">
              {followUp ? "Edit follow-up" : "Add new follow-up"}
            </span>
            <span className="block text-[11px] font-semibold text-slate-500">
              {followUp
                ? "Update the scheduled action and discussion details."
                : "Schedule an action for an existing lead or business."}
            </span>
          </span>
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4 text-xs font-semibold">
        {!followUp && !initialLeadId && (
          <div className="space-y-3">
            <Input
              id="follow-up-lead-search"
              label="Find a lead or business"
              value={leadSearch}
              onChange={(event) => setLeadSearch(event.target.value)}
              placeholder="Search by lead name, business or code"
              leftIcon={<Briefcase className="h-4 w-4" />}
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
              label="Select target lead *"
              value={leadId}
              onChange={(event) => setLeadId(event.target.value)}
              placeholder="Select a lead"
              searchable
              options={
                leads.data?.items.map((lead) => ({
                  value: lead.id,
                  label: lead.businessName || lead.name,
                  sublabel: `${lead.leadCode}${lead.city ? ` · ${lead.city}` : ""}`,
                  badge: { text: "LEAD", variant: "purple" },
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
        {targetName && (
          <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-slate-500 shadow-xs">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <span className="block font-extrabold text-[#0D1F3D]">{targetName}</span>
                  <span className="block text-[10px] font-medium text-slate-500">
                    {followUp?.lead.leadCode || selectedLead?.leadCode || "Selected lead"}
                  </span>
                </div>
              </div>
              {(followUp?.lead.contactName || selectedLead?.contactName) && (
                <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {followUp?.lead.contactName || selectedLead?.contactName}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              id="follow-up-title"
              label="Follow-up purpose *"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="For example, quotation review or product demo"
              required
              maxLength={300}
            />
          </div>
          <DatePicker
            id="follow-up-date"
            label="Follow-up date"
            value={scheduledDate}
            onChange={setScheduledDate}
            required
          />
          <ClockTimePickerModal
            label="Follow-up time *"
            value={scheduledTime}
            onChange={setScheduledTime}
          />
          {can("crm.leads.assign") && (
            <div className="sm:col-span-2">
              <Select
                label="Assign executive"
                value={assignedMembershipId}
                onChange={(event) => setAssignedMembershipId(event.target.value)}
                searchable
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
                    sublabel: owner.role ?? undefined,
                    avatar: owner.avatarUrl ?? undefined,
                  })) ?? []),
                ]}
              />
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="follow-up-notes"
            className="block text-xs font-bold text-slate-700"
          >
            Follow-up purpose &amp; discussion notes
          </label>
          <textarea
            id="follow-up-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Enter customer discussion notes or next steps..."
            className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0D1F3D] focus:outline-none focus:ring-1 focus:ring-[#0D1F3D]"
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
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
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
