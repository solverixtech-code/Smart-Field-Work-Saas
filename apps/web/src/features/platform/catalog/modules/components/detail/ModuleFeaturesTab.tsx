import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone } from 'lucide-react';
import { PlatformModule } from '../../types/module.types';
import { DataTable } from '../../../../../../components/ui/DataTable';
import { Button } from '../../../../../../components/ui/Button';

export interface ModuleFeaturesTabProps {
  module: PlatformModule;
}

export function ModuleFeaturesTab({ module }: ModuleFeaturesTabProps) {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-slate-200 bg-white shadow-xs font-sans">
      <div className="border-b border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#0D1F3D]">
            Registered Code-Backed Features ({module.features?.length || 0})
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Software capabilities implemented in Smart Field Work codebase bundled under {module.name}.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/platform/modules/features')}
          className="font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
        >
          View Feature Registry
        </Button>
      </div>

      <DataTable
        data={module.features || []}
        columns={[
          {
            header: 'Feature Name & Description',
            cell: (feat) => (
              <div className="min-w-[220px]">
                <span className="font-extrabold text-xs text-[#0D1F3D] block">{feat.name}</span>
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-sm block">{feat.description}</span>
              </div>
            ),
          },
          {
            header: 'Implementation Key',
            cell: (feat) => (
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
                {feat.code}
              </span>
            ),
          },
          {
            header: 'Platform Support',
            cell: (feat) => (
              <div className="flex items-center gap-1.5">
                {(feat.supportsWeb ?? true) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                    <Globe className="h-3 w-3" /> Web
                  </span>
                )}
                {(feat.supportsMobile ?? true) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                    <Smartphone className="h-3 w-3" /> Mobile
                  </span>
                )}
              </div>
            ),
          },
          {
            header: 'Status',
            cell: (feat) => (
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {feat.status}
              </span>
            ),
          },
        ]}
        emptyMessage="No coded features registered for this module yet."
      />
    </section>
  );
}
