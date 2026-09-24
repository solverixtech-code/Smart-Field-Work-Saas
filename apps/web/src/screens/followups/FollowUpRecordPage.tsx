import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useCrm, useCrmMutation, useCrmQuery } from "../../features/crm/CrmContext";
import { followUpApi } from "../../features/crm/follow-up.api";
import { leadApi } from "../../features/crm/lead.api";
import { FollowUpFormModal } from "./FollowUpFormModal";

type Action = "complete" | "cancel" | "reopen" | "delete";

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:items-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="min-w-0 text-sm font-semibold text-[#0D1F3D]">{children}</div>
    </div>
  );
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatScheduledDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-600",
} as const;

export default function FollowUpRecordPage() {
  const { followupId = "" } = useParams();
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const result = useCrmQuery(`follow-up:${followupId}`, (_, signal) =>
    followUpApi.get(followupId, signal),
  );
  const mutation = useCrmMutation();
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const item = result.data;
  const canEdit = (can("crm.followups.manage") || can("crm.leads.update")) && !readOnly;

  async function confirm() {
    if (!item || !action) return;
    const changed = await mutation.run(async (_, signal) => {
      if (action === "delete") {
        await leadApi.deleteFollowUp(item.leadId, item.id, signal);
      } else {
        await leadApi.updateFollowUp(
          item.leadId,
          item.id,
          {
            status:
              action === "complete"
                ? "Completed"
                : action === "reopen"
                  ? "Pending"
                  : "Cancelled",
          },
          signal,
        );
      }
      return true;
    });
    if (!changed) return;
    toast.success(
      action === "delete"
        ? "Follow-up deleted"
        : action === "complete"
          ? "Follow-up completed"
          : action === "reopen"
            ? "Follow-up reopened"
            : "Follow-up cancelled",
    );
    setAction(null);
    if (action === "delete") navigate("/admin/follow-ups");
    else result.reload();
  }

  return (
    <div className="min-h-screen space-y-5 bg-slate-50/50 p-2 pb-16 text-left font-sans">
      <Link
        to="/admin/follow-ups"
        className="inline-flex min-h-9 items-center gap-2 rounded-md px-1 text-xs font-bold text-slate-600 transition-colors hover:text-[#0D1F3D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D1F3D]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to follow-ups
      </Link>

      {result.loading && (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-100" />
        </div>
      )}

      {result.error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <span>{result.error.message}</span>
          <Button size="sm" variant="outline" onClick={result.reload}>Reload</Button>
        </div>
      )}

      {item && !result.loading && !result.error && (
        <>
          <header className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarCheck2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase ${statusClasses[item.status]}`}>
                  {item.status}
                </span>
                <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-[#0D1F3D] md:text-3xl">
                  {item.title}
                </h1>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Created {formatCreatedAt(item.createdAt)}
                  {item.type ? ` · ${item.type.replace(/_/g, " ")}` : ""}
                </p>
              </div>
            </div>

            {canEdit && (
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                {item.status === "Pending" ? (
                  <>
                    <Button size="sm" variant="accent" onClick={() => setAction("complete")} className="gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Mark completed
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAction("cancel")} className="gap-2">
                      <Ban className="h-4 w-4" /> Cancel follow-up
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setAction("reopen")} className="gap-2">
                    <CalendarCheck2 className="h-4 w-4" /> Reopen
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setAction("delete")} className="gap-2 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            )}
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6 lg:col-span-5" aria-labelledby="schedule-heading">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="schedule-heading" className="text-base font-extrabold text-[#0D1F3D]">Schedule and assignment</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Follow-up schedule and assigned employee</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 pt-1">
                <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Scheduled date">
                  <time dateTime={item.scheduledDate}>{formatScheduledDate(item.scheduledDate)}</time>
                </DetailRow>
                <DetailRow icon={<Clock3 className="h-4 w-4" />} label="Time">
                  <span className="tabular-nums">{item.scheduledTime}</span>
                </DetailRow>
                <DetailRow icon={<UserRound className="h-4 w-4" />} label="Assigned to">
                  {item.assignedMembershipId ? (
                    <Link
                      to={`/admin/employees/${item.assignedMembershipId}`}
                      aria-label={`View ${item.assignedMembership?.user.fullName || item.assignedToName}'s profile`}
                      className="group flex w-fit items-center gap-3 rounded-lg py-1 pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D1F3D]"
                    >
                      <Avatar
                        name={item.assignedMembership?.user.fullName || item.assignedToName}
                        src={item.assignedMembership?.user.avatarUrl}
                        sizeClassName="h-11 w-11"
                        className="ring-2 ring-white shadow-sm group-hover:ring-blue-200"
                      />
                      <span>
                        <span className="block font-extrabold text-[#0D1F3D] group-hover:text-blue-700 group-hover:underline">
                          {item.assignedMembership?.user.fullName || item.assignedToName}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-slate-500">
                          {item.assignedMembership?.designation || item.assignedMembership?.team?.name || "Field executive"}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <span className="text-slate-500">Unassigned</span>
                  )}
                </DetailRow>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6 lg:col-span-7" aria-labelledby="lead-heading">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="lead-heading" className="text-base font-extrabold text-[#0D1F3D]">Related lead</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Lead information and contact details</p>
                  </div>
                </div>
                {can("crm.leads.view") && (
                  <Link
                    to={`/admin/leads/${item.leadId}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" /> Open lead
                  </Link>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <Avatar name={item.lead.businessName || item.lead.name} sizeClassName="h-11 w-11" className="border-blue-100 bg-blue-50 text-xs text-blue-700" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-extrabold text-[#0D1F3D]">{item.lead.businessName || item.lead.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{item.lead.leadCode} · {item.lead.status}</p>
                </div>
              </div>

              <div className="mt-2 divide-y divide-slate-100">
                <DetailRow icon={<UserRound className="h-4 w-4" />} label="Contact person">
                  {item.lead.contactName || <span className="font-medium text-slate-500">Not recorded</span>}
                </DetailRow>
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
                  {item.lead.phone ? <a href={`tel:${item.lead.phone}`} className="text-blue-700 hover:underline">{item.lead.phone}</a> : <span className="font-medium text-slate-500">Not recorded</span>}
                </DetailRow>
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                  {item.lead.email ? <a href={`mailto:${item.lead.email}`} className="break-all text-blue-700 hover:underline">{item.lead.email}</a> : <span className="font-medium text-slate-500">Not recorded</span>}
                </DetailRow>
                <DetailRow icon={<MapPin className="h-4 w-4" />} label="Location">
                  {[item.lead.addressLine1, item.lead.city].filter(Boolean).join(", ") || <span className="font-medium text-slate-500">Not recorded</span>}
                </DetailRow>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card md:p-6 lg:col-span-12" aria-labelledby="notes-heading">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="notes-heading" className="text-base font-extrabold text-[#0D1F3D]">Notes</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Follow-up context and discussion details</p>
                </div>
              </div>
              {item.notes ? (
                <p className="max-w-4xl whitespace-pre-wrap pt-4 text-sm leading-6 text-slate-700">{item.notes}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-slate-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-slate-600">No notes recorded</p>
                  <p className="mt-1 text-xs text-slate-500">Use Edit to add context for this follow-up.</p>
                </div>
              )}
            </section>
          </div>

          <FollowUpFormModal isOpen={editing} onClose={() => setEditing(false)} onSuccess={result.reload} followUp={item} />
          <Modal
            isOpen={action !== null}
            onClose={() => { if (!mutation.pending) setAction(null); }}
            title={action === "delete" ? "Delete follow-up" : action === "complete" ? "Complete follow-up" : action === "reopen" ? "Reopen follow-up" : "Cancel follow-up"}
            maxWidth="max-w-sm"
          >
            <p className="text-sm text-slate-600">
              {action === "delete" ? "Delete this follow-up permanently?" : action === "complete" ? "Mark this follow-up as completed?" : action === "reopen" ? "Reopen this follow-up as pending? If it is overdue, a reminder may be sent when push notifications are enabled." : "Cancel this follow-up?"}
            </p>
            {mutation.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{mutation.error.message}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" disabled={mutation.pending} onClick={() => setAction(null)}>Keep follow-up</Button>
              <Button variant="accent" size="sm" isLoading={mutation.pending} onClick={confirm}>Confirm</Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
