import React from "react";
import { useOutletContext } from "react-router-dom";
import { BusinessContext } from "./BusinessLayoutWrapper";
import { statusLabel } from "../../features/crm/CrmControls";
export default function BusinessDetailsPage() {
  const { business: b } = useOutletContext<BusinessContext>();
  const fields = [
    ["Business name", b.name],
    ["Business type", b.businessType],
    ["Category", b.categoryLabel],
    ["Source", b.source],
    ["Status", statusLabel(b.status)],
    ["Owner", b.owner.displayName],
    ["Established year", b.establishedYear],
    ["GSTIN", b.gstin],
    ["Website", b.website],
  ];
  const address = [
    b.addressLine1,
    b.addressLine2,
    b.city,
    b.state,
    b.postalCode,
    b.countryCode,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
        <h2 className="text-lg font-semibold">Business information</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-600">{label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900">
                {value || "Not set"}
              </dd>
            </div>
          ))}
        </dl>
        <h2 className="text-lg font-semibold">Address</h2>
        <p className="break-words text-sm">
          {address || "No address provided."}
        </p>
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-wrap break-words text-sm">
          {b.description || "No description provided."}
        </p>
      </section>
      <aside className="space-y-4">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Primary contact</h2>
          {b.primaryContact === undefined ? (
            <p className="text-sm text-slate-600">
              Contact access is required.
            </p>
          ) : b.primaryContact ? (
            <div className="space-y-2 break-words text-sm">
              <p className="font-semibold">{b.primaryContact.name}</p>
              <p>{b.primaryContact.phone || "No phone provided"}</p>
              <p>{b.primaryContact.email || "No email provided"}</p>
              <p>{b.primaryContact.role || "No role selected"}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No primary contact selected.
            </p>
          )}
        </section>
        <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-5 text-sm">
          <h2 className="text-lg font-semibold">Record history</h2>
          <p>Created: {new Date(b.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(b.updatedAt).toLocaleString()}</p>
        </section>
      </aside>
    </div>
  );
}
