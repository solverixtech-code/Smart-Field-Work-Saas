import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  useCrm,
  useCrmMutation,
  useCrmQuery,
} from "../../features/crm/CrmContext";
import { followUpApi } from "../../features/crm/follow-up.api";
import { leadApi } from "../../features/crm/lead.api";
import { FollowUpFormModal } from "./FollowUpFormModal";

type Action = "complete" | "cancel" | "reopen" | "delete";

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
  const canEdit =
    (can("crm.followups.manage") || can("crm.leads.update")) && !readOnly;

  async function confirm() {
    if (!item || !action) return;
    const changed = await mutation.run(async (_, signal) => {
      if (action === "delete")
        await leadApi.deleteFollowUp(item.leadId, item.id, signal);
      else
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
    <div className="min-h-screen space-y-4 bg-slate-50/50 p-2 pb-16 text-left font-sans">
      <Link
        to="/admin/follow-ups"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0D1F3D]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to follow-ups
      </Link>
      {result.loading && (
        <p
          role="status"
          className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
        >
          Loading follow-up...
        </p>
      )}
      {result.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
          {result.error.message}{" "}
          <Button size="sm" variant="outline" onClick={result.reload}>
            Reload
          </Button>
        </div>
      )}
      {item && !result.loading && !result.error && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-slate-500">
                {item.status}
              </p>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
                {item.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Created {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
                {item.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => setAction("complete")}
                    >
                      Mark completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAction("cancel")}
                    >
                      Cancel follow-up
                    </Button>
                  </>
                )}
                {item.status !== "Pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAction("reopen")}
                  >
                    Reopen
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAction("delete")}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#0D1F3D]">
                Schedule and assignment
              </h2>
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <CalendarDays className="h-4 w-4" /> {item.scheduledDate}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Clock3 className="h-4 w-4" /> {item.scheduledTime}
              </p>
              <p className="text-sm text-slate-700">
                Assigned to:{" "}
                <strong>
                  {item.assignedMembership?.user.fullName ||
                    item.assignedToName}
                </strong>
                {item.assignedMembership?.team &&
                  ` · ${item.assignedMembership.team.name}`}
              </p>
              <p className="text-sm text-slate-700">
                Notes: {item.notes || "No notes recorded."}
              </p>
            </section>
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#0D1F3D]">Lead</h2>
              {can("crm.leads.view") ? (
                <Link
                  to={`/admin/leads/${item.leadId}`}
                  className="text-sm font-bold text-[#0D1F3D] hover:underline"
                >
                  {item.lead.businessName || item.lead.name} ·{" "}
                  {item.lead.leadCode}
                </Link>
              ) : (
                <p className="text-sm text-slate-700">
                  {item.lead.businessName || item.lead.name}
                </p>
              )}
              <p className="text-sm text-slate-700">
                {item.lead.contactName || "No contact recorded"}
              </p>
              {item.lead.phone && (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4" /> {item.lead.phone}
                </p>
              )}
              {item.lead.email && (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="h-4 w-4" /> {item.lead.email}
                </p>
              )}
              {(item.lead.addressLine1 || item.lead.city) && (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <MapPin className="h-4 w-4" />{" "}
                  {[item.lead.addressLine1, item.lead.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </section>
          </div>
          <FollowUpFormModal
            isOpen={editing}
            onClose={() => setEditing(false)}
            onSuccess={result.reload}
            followUp={item}
          />
          <Modal
            isOpen={action !== null}
            onClose={() => {
              if (!mutation.pending) setAction(null);
            }}
            title={
              action === "delete"
                ? "Delete follow-up"
                : action === "complete"
                  ? "Complete follow-up"
                  : action === "reopen"
                    ? "Reopen follow-up"
                    : "Cancel follow-up"
            }
            maxWidth="max-w-sm"
          >
            <p className="text-sm text-slate-600">
              {action === "delete"
                ? "Delete this follow-up permanently?"
                : action === "complete"
                  ? "Mark this follow-up as completed?"
                  : action === "reopen"
                    ? "Reopen this follow-up as pending? If it is overdue, a reminder may be sent when push notifications are enabled."
                    : "Cancel this follow-up?"}
            </p>
            {mutation.error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
              >
                {mutation.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={mutation.pending}
                onClick={() => setAction(null)}
              >
                Keep follow-up
              </Button>
              <Button
                variant="accent"
                size="sm"
                isLoading={mutation.pending}
                onClick={confirm}
              >
                Confirm
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
