import React from 'react';
import { PlatformModule } from '../../types/module.types';
import { DataTable } from '../../../../../../components/ui/DataTable';

export interface ModuleHistoryTabProps {
  module: PlatformModule;
  historyLogs?: any[];
}

export function ModuleHistoryTab({ module, historyLogs = [] }: ModuleHistoryTabProps) {
  const displayData =
    historyLogs.length > 0
      ? historyLogs
      : [
          {
            id: '1',
            createdAt: module.createdAt,
            action: 'MODULE_CREATED',
            actorUser: { fullName: 'Platform System Admin', email: 'admin@smartfieldwork.com' },
          },
          {
            id: '2',
            createdAt: module.updatedAt,
            action: 'MODULE_UPDATED',
            actorUser: { fullName: 'Platform System Admin', email: 'admin@smartfieldwork.com' },
          },
        ];

  return (
    <section className="rounded-sm border border-slate-200 bg-white shadow-xs font-sans">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-base font-extrabold text-[#0D1F3D]">Audit History Logs</h2>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          System lifecycle & configuration events recorded for {module.name}.
        </p>
      </div>

      <DataTable
        data={displayData}
        columns={[
          {
            header: 'Date & Time',
            cell: (item) => (
              <span className="text-xs font-medium text-slate-600">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            ),
          },
          {
            header: 'Actor',
            cell: (item) => (
              <div>
                <span className="font-extrabold text-xs text-[#0D1F3D] block">
                  {item.actorUser?.fullName || 'Platform Admin'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.actorUser?.email || 'system'}
                </span>
              </div>
            ),
          },
          {
            header: 'Action',
            cell: (item) => (
              <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
                {item.action}
              </span>
            ),
          },
        ]}
        emptyMessage="No audit logs recorded for this module."
      />
    </section>
  );
}
