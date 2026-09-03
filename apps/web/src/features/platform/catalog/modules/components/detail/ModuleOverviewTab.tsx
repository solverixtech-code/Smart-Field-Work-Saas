import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Code,
  GitBranch,
  CheckCircle2,
  Edit,
  Shield,
  Layers,
} from 'lucide-react';
import { PlatformModule, PlatformModuleCategory } from '../../types/module.types';
import { ModuleCategoryBadge } from '../ModuleCategoryBadge';
import { ModuleStatusBadge } from '../ModuleStatusBadge';
import { Button } from '../../../../../../components/ui/Button';

export interface ModuleOverviewTabProps {
  module: PlatformModule;
}

export function ModuleOverviewTab({ module }: ModuleOverviewTabProps) {
  const navigate = useNavigate();

  const formattedCreated = module.createdAt ? new Date(module.createdAt).toLocaleDateString() : '—';
  const formattedUpdated = module.updatedAt ? new Date(module.updatedAt).toLocaleDateString() : '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Card 1: Module Information */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600 shrink-0" /> Module Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Module Name</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">{module.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Identifier Code</span>
                <span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200 inline-block mt-0.5">
                  {module.code}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Category</span>
                <div className="mt-0.5">
                  <ModuleCategoryBadge category={module.category} />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Lifecycle Status</span>
                <div className="mt-0.5">
                  <ModuleStatusBadge status={module.status} />
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">System Protection</span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                {module.requiredBySystem ? 'Protected System Module (True)' : 'Optional Addon Capability (False)'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Capability Description</span>
              <div className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-200 leading-relaxed">
                {module.description}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
          className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
        >
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit Specifications
        </Button>
      </div>

      {/* Card 2: Technical Architecture */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-indigo-600 shrink-0" /> Technical Architecture
          </h3>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">API Prefix</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200 text-[11px]">
                /platform/modules/{module.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Database Schema</span>
              <span className="font-mono text-slate-700 text-[11px]">PlatformModule</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">System Protection</span>
              <span className="font-bold text-slate-800">
                {module.requiredBySystem ? 'Protected' : 'Optional'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Created Date</span>
              <span className="font-bold text-slate-700">{formattedCreated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Last Modified</span>
              <span className="font-bold text-slate-700">{formattedUpdated}</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/platform/modules/${module.id}/features`)}
          className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
        >
          <Layers className="h-3.5 w-3.5 mr-1" /> Inspect Code Features
        </Button>
      </div>

      {/* Card 3: Dependency Graph & Impact */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-indigo-600 shrink-0" /> Dependency Graph
            </h3>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Guarded
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Prerequisite Parents</span>
              <span className="font-mono font-extrabold text-indigo-700">
                {module.dependencyCodes?.length || 0} Modules
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Downstream Dependents</span>
              <span className="font-mono font-extrabold text-purple-700">
                {module.dependentCodes?.length || 0} Modules
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Cycle Protection
              </span>
              <span className="font-extrabold text-emerald-700">DFS Active</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/platform/modules/dependencies')}
          className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
        >
          <GitBranch className="h-3.5 w-3.5 mr-1" /> Explore Dependency Map
        </Button>
      </div>
    </div>
  );
}
