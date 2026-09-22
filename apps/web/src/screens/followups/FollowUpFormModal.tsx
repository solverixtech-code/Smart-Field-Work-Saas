import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Briefcase, MapPin, Phone, RotateCcw, User } from "lucide-react";
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
  const [type, setType] = useState("PHONE_CALL");
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
  const leadDetails = followUp?.lead || selectedLead;

  const targetName = followUp
    ? followUp.lead.businessName || followUp.lead.name
    : initialLeadId
      ? initialLeadName || "Current lead"
      : selectedLead?.businessName || selectedLead?.name;

  useEffect(() => {
    if (!isOpen) return;
    setLeadId(followUp?.leadId ?? initialLeadId ?? "");
    setTitle(followUp?.title ?? "");
    setType(followUp?.type ?? "PHONE_CALL");
    setScheduledDate(followUp?.scheduledDate ?? localDateKey());
    setScheduledTime(followUp?.scheduledTime ?? "09:00 AM");
    setNotes(followUp?.notes ?? "");
    setAssignedMembershipId("");
    mutation.clearError();
  }, [isOpen, followUp, initialLeadId]);

  useEffect(() => {
    if (mutation.error) {
      toast.error(mutation.error.message);
    }
  }, [mutation.error]);

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
              type,
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
              type,
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
        <span className="flex items-center gap-2.5 text-left">
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
      panelClassName="sm:min-h-[640px] sm:flex sm:flex-col sm:justify-between"
    >
      <form
        onSubmit={submit}
        className="flex min-h-0 flex-1 flex-col justify-between space-y-4 text-xs font-semibold text-left"
      >
        <div className="space-y-4">
          {!followUp && !initialLeadId && (
            <div className="space-y-3.5">
              {!can("crm.leads.view") && (
                <p className="text-xs font-medium text-slate-500">
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
                    sublabel: `${lead.leadCode}${lead.city ? ` · ${lead.city}` : ""}${lead.contactName ? ` · ${lead.contactName}` : ""}`,
                    badge: { text: "LEAD", variant: "purple" },
                  })) ?? []
                }
              />
            </div>
          )}

          {/* Auto-Populating Selected Business Details Card (VISIBLO Rule 1.3) */}
          {targetName && (
            <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-white text-[#0D1F3D] border border-slate-200/80 shadow-xs shrink-0">
                    <Briefcase className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <span className="block font-extrabold text-[#0D1F3D] text-xs leading-tight">
                      {targetName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 mt-0.5">
                      <span>{leadDetails?.leadCode || "Selected lead"}</span>
                      {leadDetails?.priority && (
                        <>
                          <span>•</span>
                          <span className="rounded-xs bg-slate-200/70 px-1.5 py-0.2 font-bold uppercase text-[9.5px] text-slate-700">
                            {leadDetails.priority} Priority
                          </span>
                        </>
                      )}
                      {leadDetails?.status && (
                        <>
                          <span>•</span>
                          <span className="rounded-xs bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.2 font-bold uppercase text-[9.5px]">
                            {leadDetails.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {(leadDetails?.addressLine1 || leadDetails?.city) && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-sm border border-slate-200/60 shadow-2xs">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{[leadDetails.addressLine1, leadDetails.city].filter(Boolean).join(", ")}</span>
                  </span>
                )}
              </div>

              {(leadDetails?.contactName || leadDetails?.phone || leadDetails?.email) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60">
                  {leadDetails?.contactName && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Contact: <strong className="text-[#0D1F3D] font-bold">{leadDetails.contactName}</strong>
                      </span>
                    </div>
                  )}
                  {leadDetails?.phone && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-mono font-semibold">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{leadDetails.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
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
            <div>
              <Select
                label="Follow-up type *"
                value={type}
                onChange={(e) => setType(e.target.value)}
                searchable={true}
                options={[
                  { value: "PHONE_CALL", label: "Outbound Phone Call", sublabel: "Telephonic check-in call", badge: { text: "CALL", variant: "emerald" } },
                  { value: "FIELD_VISIT", label: "In-Person Field Visit", sublabel: "Physical store consultation", badge: { text: "VISIT", variant: "blue" } },
                  { value: "DEMO_FOLLOWUP", label: "Virtual Demo / Meeting", sublabel: "Online screen share demo", badge: { text: "DEMO", variant: "purple" } },
                  { value: "WHATSAPP", label: "WhatsApp / Chat", sublabel: "Messaging or chat update", badge: { text: "CHAT", variant: "emerald" } },
                  { value: "QUOTE_FOLLOWUP", label: "Quotation Review", sublabel: "Commercial quote discussion", badge: { text: "QUOTE", variant: "amber" } },
                  { value: "PAYMENT_FOLLOWUP", label: "Payment Collection", sublabel: "Invoice payment collection", badge: { text: "PAYMENT", variant: "purple" } },
                ]}
              />
            </div>
            <DatePicker
              id="follow-up-date"
              label="Follow-up date"
              value={scheduledDate}
              onChange={setScheduledDate}
              required
              triggerClassName="h-10"
            />
            <ClockTimePickerModal
              label="Follow-up time *"
              value={scheduledTime}
              onChange={setScheduledTime}
              triggerClassName="h-10"
            />
            {can("crm.leads.assign") && (
              <div className="sm:col-span-2">
                <Select
                  label="Assign executive"
                  value={assignedMembershipId}
                  onChange={(event) => setAssignedMembershipId(event.target.value)}
                  searchable={true}
                  options={[
                    {
                      value: "",
                      label: followUp
                        ? `Keep ${followUp.assignedMembership?.user.fullName || followUp.assignedToName}`
                        : "Assign to me",
                      sublabel: followUp
                        ? "Current Assignee"
                        : "Self Assignment",
                      avatar: followUp?.assignedMembership?.user.avatarUrl ?? undefined,
                      avatarFallback: true,
                    },
                    ...(owners.data?.items.map((owner) => ({
                      value: owner.id,
                      label: owner.displayName,
                      sublabel: owner.role ? `${owner.role} • Team` : "Field Executive",
                      avatar: owner.avatarUrl ?? undefined,
                      avatarFallback: !owner.avatarUrl,
                    })) ?? []),
                  ]}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="follow-up-notes"
              className="block text-xs font-semibold text-slate-700"
            >
              Follow-up purpose &amp; discussion notes
            </label>
            <textarea
              id="follow-up-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3.5}
              placeholder="Enter customer discussion notes or next steps..."
              className="w-full rounded-md border border-slate-200 bg-[#F8FAFC] p-2.5 text-xs font-medium text-[#0D1F3D] placeholder:text-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] transition-all"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
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

