import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
} from "../../features/crm/CrmContext";
import { CrmFailure } from "../../features/crm/CrmControls";
import {
  LeadConversionModal,
  LeadAssignment,
  LeadDeferred,
} from "../../features/crm/LeadForms";
import { leadLabel } from "../../features/crm/lead.types";
import { LeadOverviewTab } from "./tabs/LeadOverviewTab";
import { LeadTimelineTab } from "./tabs/LeadTimelineTab";
export default function LeadDetailsPage() {
  const { leadId = "" } = useParams();
  return <LeadDetailsContent key={leadId} />;
}
function LeadDetailsContent() {
  const { leadId = "" } = useParams(),
    navigate = useNavigate(),
    location = useLocation(),
    { can, readOnly } = useCrm();
  const [converting, setConverting] = useState(false),
    [deleting, setDeleting] = useState(false);
  const mutation = useCrmMutation();
  const result = useCrmQuery("lead-detail:" + leadId, (s, signal) =>
    s.leads.get(leadId, signal),
  );
  const active = location.pathname.split("/").at(-1),
    overview = active === leadId;
  const lead = result.data;
  if (result.error)
    return <CrmFailure error={result.error} retry={result.reload} />;
  if (!lead) return <p role="status">Loading lead...</p>;
  const mutable = ["OPEN", "QUALIFIED"].includes(lead.status);
  const close = () => {
    setConverting(false);
    result.reload();
  };
  return (
    <div className="space-y-4 pb-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/admin/leads")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Leads
      </Button>
      <Card variant="panel">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
                {lead.name}
              </h1>
              <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {leadLabel(lead.status)}
              </span>
              <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                {leadLabel(lead.priority)}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {lead.contactName || "Contact name not set"} /{" "}
              {lead.source || "Source not set"}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {lead.phone || "Phone not set"}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {lead.email || "Email not set"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {lead.city || "City not set"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!mutable || readOnly || !can("crm.leads.update")}
              onClick={() => navigate("/admin/leads/" + lead.id + "/edit")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Lead
            </Button>
            <Button
              size="sm"
              disabled={
                lead.status !== "QUALIFIED" ||
                readOnly ||
                !can("crm.leads.convert")
              }
              onClick={() => setConverting(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Convert Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                lead.status === "CONVERTED" ||
                readOnly ||
                !can("crm.leads.delete")
              }
              onClick={() => setDeleting(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
      <nav
        aria-label="Lead details"
        className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-lg"
      >
        {[
          ["overview", "Overview"],
          ["timeline", "Timeline"],
          ["visits", "Visits"],
          ["follow-ups", "Follow-ups"],
          ["demos", "Demos"],
          ["communications", "Communications"],
          ["payments", "Payments"],
          ["assignment", "Assignment"],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className="shrink-0 whitespace-nowrap"
            aria-current={
              (id === "overview" ? overview : active === id)
                ? "page"
                : undefined
            }
            onClick={() =>
              navigate(
                "/admin/leads/" + lead.id + (id === "overview" ? "" : "/" + id),
              )
            }
          >
            {label}
          </Button>
        ))}
      </nav>
      {overview ? (
        <LeadOverviewTab lead={lead} />
      ) : active === "timeline" ? (
        <LeadTimelineTab leadId={lead.id} />
      ) : active === "assignment" ? (
        <LeadAssignment
          key={lead.id}
          lead={lead}
          onSaved={() => navigate("/admin/leads")}
        />
      ) : (
        <LeadDeferred title={active ?? "Lead details"} />
      )}
      {converting && (
        <LeadConversionModal
          lead={lead}
          onClose={() => setConverting(false)}
          onSaved={close}
        />
      )}
      {deleting && (
        <Modal
          isOpen
          title="Delete Lead"
          onClose={() => {
            if (!mutation.pending) setDeleting(false);
          }}
        >
          <p className="text-sm">
            Delete {lead.name}? The record will be removed from the active
            workspace.
          </p>
          {mutation.error && <CrmFailure error={mutation.error} />}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={mutation.pending}
              onClick={() => setDeleting(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={mutation.pending || Boolean(mutation.error?.conflict)}
              onClick={async () => {
                const outcome = await mutation.run(async (s, signal) => {
                  await s.leads.remove(lead.id, lead.revision, signal);
                  return true;
                });
                if (outcome) navigate("/admin/leads");
              }}
            >
              Delete Lead
            </Button>
            {mutation.error?.conflict && (
              <Button
                variant="outline"
                onClick={() => {
                  setDeleting(false);
                  result.reload();
                }}
              >
                Reload current revision
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
