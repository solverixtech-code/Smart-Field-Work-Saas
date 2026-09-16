import React from "react";
import { useParams } from "react-router-dom";
import { LeadForm } from "../../features/crm/LeadForms";
import { useCrmQuery } from "../../features/crm/CrmContext";
import { CrmFailure } from "../../features/crm/CrmControls";
export default function EditLeadPage() {
  const { leadId = "" } = useParams();
  const result = useCrmQuery("lead-edit:" + leadId, (s, signal) =>
    s.leads.get(leadId, signal),
  );
  if (result.error)
    return <CrmFailure error={result.error} retry={result.reload} />;
  if (!result.data) return <p role="status">Loading lead...</p>;
  return <LeadForm key={result.data.id} initial={result.data} />;
}
