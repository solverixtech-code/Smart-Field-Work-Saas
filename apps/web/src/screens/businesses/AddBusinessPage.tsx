import React from "react";
import { useParams } from "react-router-dom";
import { useCrmQuery } from "../../features/crm/CrmContext";
import { AccountForm } from "../../features/crm/CrmForms";
import { CrmFailure } from "../../features/crm/CrmControls";
function EditBusiness({ id }: { id: string }) {
  const result = useCrmQuery(`account:${id}`, (service, signal) =>
    service.account(id, signal),
  );
  if (result.error)
    return <CrmFailure error={result.error} retry={result.reload} />;
  if (!result.data) return <p role="status">Loading business...</p>;
  return <AccountForm key={result.data.id} initial={result.data} />;
}
export default function AddBusinessPage({
  isEdit = false,
}: {
  isEdit?: boolean;
}) {
  const { businessId } = useParams();
  return isEdit ? <EditBusiness id={businessId ?? ""} /> : <AccountForm />;
}
