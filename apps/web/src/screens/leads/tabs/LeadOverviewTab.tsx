import React from "react";
import { Building2, User, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { LeadDto } from "../../../features/crm/lead.types";
export function LeadOverviewTab({ lead }: { lead: LeadDto }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-8">
        <Card variant="panel" className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#0D1F3D]">
            <Building2 className="h-4 w-4 text-blue-600" />
            Company & Primary Contact Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            {[
              ["Name", lead.name],
              ["Contact Person", lead.contactName],
              ["Official Email", lead.email],
              ["Phone Number", lead.phone],
              [
                "Address",
                [
                  lead.addressLine1,
                  lead.addressLine2,
                  lead.city,
                  lead.state,
                  lead.postalCode,
                  lead.countryCode,
                ]
                  .filter(Boolean)
                  .join(", "),
              ],
              ["Lead Source", lead.source],
              ["Linked Business", lead.accountId],
              ["Linked Contact", lead.contactId],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="break-words font-semibold text-slate-900">
                  {value || "Not set"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card variant="panel" className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#0D1F3D]">
            <FileText className="h-4 w-4 text-purple-600" />
            Lead Description
          </h2>
          <p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs">
            {lead.description || "No description recorded."}
          </p>
        </Card>
      </div>
      <div className="space-y-3 lg:col-span-4">
        <Card variant="panel" className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#0D1F3D]">
            <User className="h-4 w-4 text-emerald-600" />
            Assigned Sales Representative
          </h2>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="font-bold text-[#0D1F3D]">
              {lead.assignee?.displayName || "Unassigned"}
            </p>
            <p className="text-xs text-slate-600">
              Owner: {lead.owner.displayName}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Team and territory scope are unavailable.
          </p>
        </Card>
        <Card variant="panel" className="space-y-3">
          <h2 className="text-sm font-bold text-[#0D1F3D]">Record History</h2>
          <p className="text-xs">
            Created: {new Date(lead.createdAt).toLocaleString()}
          </p>
          <p className="text-xs">
            Updated: {new Date(lead.updatedAt).toLocaleString()}
          </p>
          {lead.convertedAt && (
            <div className="space-y-2 text-xs">
              <p>Converted: {new Date(lead.convertedAt).toLocaleString()}</p>
              <p className="break-all">
                Business: {lead.convertedAccountId || "None"}
              </p>
              <p className="break-all">
                Contact: {lead.convertedContactId || "None"}
              </p>
              <p className="break-all">
                Conversion actor: {lead.convertedByMembershipId}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
