import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  Edit,
  Plus,
  ShieldCheck,
  Info,
  CheckCircle,
  Sparkles,
  BarChart3,
  ShoppingCart,
  Receipt,
  MapPin,
  Users,
} from 'lucide-react';
import { Plan } from '../../types/plan.types';
import { PlatformModule } from '../../../modules/types/module.types';
import { Select } from '../../../../../../components/ui/Select';
import { Button } from '../../../../../../components/ui/Button';

export interface PlanModulesTabProps {
  plan: Plan;
  includedModules: PlatformModule[];
}

export function PlanModulesTab({ plan, includedModules }: PlanModulesTabProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Module category icon mapping matching reference image
  const getModuleIcon = (code: string) => {
    if (code.includes('crm')) return { icon: Users, bg: 'bg-blue-50 text-blue-600' };
    if (code.includes('visit')) return { icon: MapPin, bg: 'bg-emerald-50 text-emerald-600' };
    if (code.includes('order')) return { icon: ShoppingCart, bg: 'bg-amber-50 text-amber-600' };
    if (code.includes('collection')) return { icon: Receipt, bg: 'bg-purple-50 text-purple-600' };
    if (code.includes('report') || code.includes('analytics')) return { icon: BarChart3, bg: 'bg-cyan-50 text-cyan-600' };
    return { icon: Layers, bg: 'bg-indigo-50 text-indigo-600' };
  };

  const filteredModules = useMemo(() => {
    return includedModules.filter((mod) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        mod.name.toLowerCase().includes(q) ||
        mod.code.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q);

      const matchCat = selectedCategory === 'All' || mod.category === selectedCategory;
      const matchType = selectedType === 'All' || (selectedType === 'Core' ? mod.requiredBySystem : !mod.requiredBySystem);

      return matchSearch && matchCat && matchType;
    });
  }, [includedModules, searchTerm, selectedCategory, selectedType]);

  const coreModules = useMemo(() => filteredModules.filter((m) => m.requiredBySystem), [filteredModules]);
  const advancedModules = useMemo(() => filteredModules.filter((m) => !m.requiredBySystem), [filteredModules]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner matching screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Included Modules</h3>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              {includedModules.length} Modules Included
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            These modules are included in this plan and available to all tenants.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate(`/platform/plans/create?planId=${plan.id}&step=modules`)}
          className="gap-2 font-bold shadow-xs shrink-0 bg-[#1D4ED8] hover:bg-blue-700 text-white border-none"
        >
          <Edit className="h-4 w-4" /> Edit Modules
        </Button>
      </div>

      {/* Main Grid: Left Column (2 Cols) + Right Column (1 Col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter Controls */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="w-44">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    { value: 'CRM', label: 'CRM' },
                    { value: 'Field Operations', label: 'Field Operations' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Analytics', label: 'Analytics' },
                    { value: 'Automation', label: 'Automation' },
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Types' },
                    { value: 'Core', label: 'Core' },
                    { value: 'Advanced', label: 'Advanced' },
                  ]}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                }}
                className="gap-1.5 font-bold text-slate-700 h-10"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" /> Reset
              </Button>
            </div>
          </div>

          {/* Group 1: Core Modules */}
          {coreModules.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                Core Modules ({coreModules.length})
              </h4>
              <div className="space-y-3">
                {coreModules.map((mod) => {
                  const iconConfig = getModuleIcon(mod.code);
                  const Icon = iconConfig.icon;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconConfig.bg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-[#0D1F3D]">{mod.name}</span>
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                              Core
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{mod.description}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Code: <span className="font-mono font-bold text-slate-800">{mod.code.toUpperCase()}</span> • Type: <span className="text-slate-800 font-semibold">Core</span> • Category: <span className="text-slate-800 font-semibold">{mod.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Included
                        </span>
                        <button type="button" className="text-slate-400 hover:text-slate-700 p-1">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Advanced Modules */}
          {advancedModules.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                Advanced Modules ({advancedModules.length})
              </h4>
              <div className="space-y-3">
                {advancedModules.map((mod) => {
                  const iconConfig = getModuleIcon(mod.code);
                  const Icon = iconConfig.icon;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconConfig.bg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-[#0D1F3D]">{mod.name}</span>
                            <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
                              Advanced
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{mod.description}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Code: <span className="font-mono font-bold text-slate-800">{mod.code.toUpperCase()}</span> • Type: <span className="text-slate-800 font-semibold">Advanced</span> • Category: <span className="text-slate-800 font-semibold">{mod.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Included
                        </span>
                        <button type="button" className="text-slate-400 hover:text-slate-700 p-1">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dotted Action Button matching screenshot */}
          <button
            type="button"
            onClick={() => navigate(`/platform/plans/create?planId=${plan.id}&step=modules`)}
            className="w-full py-3.5 rounded-sm border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 text-indigo-600 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Modules to this Plan
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 1: Modules Summary */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0D1F3D] border-b border-slate-100 pb-3">Modules Summary</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Modules</span>
                <span className="font-extrabold text-[#0D1F3D]">{includedModules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Core Modules</span>
                <span className="font-extrabold text-[#0D1F3D]">{coreModules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Advanced Modules</span>
                <span className="font-extrabold text-[#0D1F3D]">{advancedModules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Premium Modules</span>
                <span className="font-extrabold text-[#0D1F3D]">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Custom Modules</span>
                <span className="font-extrabold text-[#0D1F3D]">0</span>
              </div>
            </div>
          </div>

          {/* Card 2: Included by Category */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0D1F3D]">Included by Category</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> CRM
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Field Operations
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5 text-amber-600" /> Sales
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-purple-600" /> Finance
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-cyan-600" /> Analytics
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50/50">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" /> Automation
                </span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
            </div>
          </div>

          {/* Card 3: About Modules in this Plan */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0D1F3D]">About Modules in this Plan</h4>
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>All included modules are available to tenants based on their subscription.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Module limits are defined in the Limits tab.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>System required modules cannot be removed.</span>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 font-medium space-y-1.5 pt-3">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Need more capabilities?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Consider adding Add-ons or upgrading to a higher plan.
              </p>
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1 pt-1"
              >
                View Add-ons →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
