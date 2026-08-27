import React from 'react';
import { FileText, Shield, Search } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../components/ui';
import { MOCK_AUDIT_LOGS } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { PlatformAuditLog } from '../../features/platform/tenants/types/platform.types';

export function AuditLogsPage() {
  const columns: ColumnDef<PlatformAuditLog>[] = [
    {
      header: 'Timestamp',
      cell: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.timestamp}</span>,
    },
    {
      header: 'Platform User',
      cell: (r) => (
        <div>
          <p className="font-extrabold text-[#0D1F3D] text-xs">{r.actorName}</p>
          <p className="text-[10px] text-slate-500 font-mono">{r.actorEmail}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: (r) => <span className="bg-slate-100 text-[#0D1F3D] font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-sm border border-slate-200">{r.action}</span>,
    },
    {
      header: 'Target Tenant',
      cell: (r) => <span className="font-bold text-xs text-indigo-700">{r.targetTenantName || '—'}</span>,
    },
    {
      header: 'IP Address',
      cell: (r) => <span className="font-mono text-xs text-slate-600">{r.ipAddress}</span>,
    },
    {
      header: 'Event Details',
      cell: (r) => <span className="text-xs text-slate-600 font-medium">{r.details}</span>,
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">Platform Operational Audit Logs</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Immutable audit log of all tenant provisioning, status updates, and security events.</p>
        </div>
      </div>

      {/* Datatable */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={MOCK_AUDIT_LOGS} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}
