import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, CheckCircle } from 'lucide-react';
import { PlatformModule } from '../../types/module.types';
import { Button } from '../../../../../../components/ui/Button';
import { usePlatformPermissions } from '../../../../tenants/hooks/usePlatformPermissions';

export interface ModuleDependenciesTabProps {
  module: PlatformModule;
}

export function ModuleDependenciesTab({ module }: ModuleDependenciesTabProps) {
  const navigate = useNavigate();
  const { canUpdateModule } = usePlatformPermissions();

  const parents = module.dependencyCodes || [];
  const dependents = module.dependentCodes || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      {/* Prerequisite Parents */}
      <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-[#0D1F3D]">Prerequisite Parent Modules</h2>
            <p className="text-xs font-medium text-slate-500">
              Modules required before {module.name} can operate.
            </p>
          </div>

          {canUpdateModule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
              className="font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
            >
              Edit Dependencies
            </Button>
          )}
        </div>

        {parents.length > 0 ? (
          <div className="space-y-2">
            {parents.map((depCode) => (
              <div
                key={depCode}
                className="p-3 rounded-sm border border-indigo-200 bg-indigo-50/70 text-xs font-mono font-bold text-indigo-800 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  <span>{depCode}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                  <span>Required Parent</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-semibold italic bg-slate-50 p-4 rounded-sm border border-slate-100 text-center">
            This is a Root Module (No Prerequisite Parent Dependencies).
          </p>
        )}
      </section>

      {/* Downstream Dependents */}
      <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-[#0D1F3D]">Downstream Dependent Modules</h2>
            <p className="text-xs font-medium text-slate-500">
              Modules that rely on {module.name}.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/modules/dependencies')}
            className="font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
          >
            View Full Graph
          </Button>
        </div>

        {dependents.length > 0 ? (
          <div className="space-y-2">
            {dependents.map((dCode) => (
              <div
                key={dCode}
                className="p-3 rounded-sm border border-purple-200 bg-purple-50/70 text-xs font-mono font-bold text-purple-800 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span>{dCode}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Downstream Dependent</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-semibold italic bg-slate-50 p-4 rounded-sm border border-slate-100 text-center">
            No downstream modules currently depend on this module.
          </p>
        )}
      </section>
    </div>
  );
}
