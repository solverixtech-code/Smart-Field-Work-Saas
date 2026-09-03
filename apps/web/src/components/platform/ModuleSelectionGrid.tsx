import React, { useState, useMemo } from 'react';
import {
  Info,
  Layers,
  Check,
  Search,
  X,
  Briefcase,
  Users,
  Clock,
  FileText,
  Camera,
  BarChart3,
  Target,
  Bell,
  MessageSquare,
  BookOpen,
  MapPin,
  CreditCard,
  Receipt,
  Mail,
  Code,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export interface ModuleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  requiredBySystem?: boolean;
}

export interface ModuleSelectionGridProps {
  modules: ModuleItem[];
  selectedCodes: string[];
  mandatoryCodes?: string[];
  onChange: (codes: string[]) => void;
  infoBannerText?: string;
  selectedPlanName?: string;
}

// Module Icon & Color Mapper matching design system
const MODULE_STYLING: Record<
  string,
  { icon: React.ElementType; iconBgClass: string; iconColorClass: string }
> = {
  core_crm: { icon: Briefcase, iconBgClass: 'bg-purple-50 border-purple-100', iconColorClass: 'text-purple-600' },
  field_visits: { icon: Users, iconBgClass: 'bg-blue-50 border-blue-100', iconColorClass: 'text-blue-600' },
  attendance_plus: { icon: Clock, iconBgClass: 'bg-amber-50 border-amber-100', iconColorClass: 'text-amber-600' },
  custom_forms: { icon: FileText, iconBgClass: 'bg-emerald-50 border-emerald-100', iconColorClass: 'text-emerald-600' },
  photos_docs: { icon: Camera, iconBgClass: 'bg-pink-50 border-pink-100', iconColorClass: 'text-pink-600' },
  reports_analytics: { icon: BarChart3, iconBgClass: 'bg-teal-50 border-teal-100', iconColorClass: 'text-teal-600' },
  demo_scheduler: { icon: Target, iconBgClass: 'bg-purple-50 border-purple-100', iconColorClass: 'text-purple-600' },
  order_management: { icon: Receipt, iconBgClass: 'bg-emerald-50 border-emerald-100', iconColorClass: 'text-emerald-600' },
  notifications: { icon: Bell, iconBgClass: 'bg-amber-50 border-amber-100', iconColorClass: 'text-amber-600' },
  chat_messaging: { icon: MessageSquare, iconBgClass: 'bg-blue-50 border-blue-100', iconColorClass: 'text-blue-600' },
  knowledge_base: { icon: BookOpen, iconBgClass: 'bg-teal-50 border-teal-100', iconColorClass: 'text-teal-600' },
  gps_tracking: { icon: MapPin, iconBgClass: 'bg-emerald-50 border-emerald-100', iconColorClass: 'text-emerald-600' },
  payroll_engine: { icon: CreditCard, iconBgClass: 'bg-purple-50 border-purple-100', iconColorClass: 'text-purple-600' },
  whatsapp_automation: { icon: MessageSquare, iconBgClass: 'bg-emerald-50 border-emerald-100', iconColorClass: 'text-emerald-600' },
  ai_copilot: { icon: Sparkles, iconBgClass: 'bg-indigo-50 border-indigo-100', iconColorClass: 'text-indigo-600' },
  api_access: { icon: Code, iconBgClass: 'bg-blue-50 border-blue-100', iconColorClass: 'text-blue-600' },
};

export function ModuleSelectionGrid({
  modules,
  selectedCodes,
  mandatoryCodes = [],
  onChange,
  infoBannerText = 'You can enable or disable modules anytime from the tenant settings.',
  selectedPlanName,
}: ModuleSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase().trim();
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [modules, searchQuery]);

  // Map filtered modules into 3 Canonical Categories
  const categoryGroups = useMemo(() => {
    const core: ModuleItem[] = [];
    const advanced: ModuleItem[] = [];
    const integrations: ModuleItem[] = [];

    filteredModules.forEach((mod) => {
      const catLower = (mod.category || '').toLowerCase();
      if (catLower === 'core' || mod.requiredBySystem || mandatoryCodes.includes(mod.code)) {
        core.push(mod);
      } else if (catLower === 'automation' || catLower === 'enterprise' || catLower.includes('integration')) {
        integrations.push(mod);
      } else {
        advanced.push(mod);
      }
    });

    return [
      { title: 'Core Modules', items: core },
      { title: 'Advanced Modules', items: advanced },
      { title: 'Optional Integrations', items: integrations },
    ].filter((g) => g.items.length > 0);
  }, [filteredModules, mandatoryCodes]);

  const allSelectableCodes = useMemo(() => {
    return modules.map((m) => m.code);
  }, [modules]);

  const isAllSelected = useMemo(() => {
    return allSelectableCodes.every((c) => selectedCodes.includes(c));
  }, [allSelectableCodes, selectedCodes]);

  const handleToggleAll = () => {
    if (isAllSelected) {
      // Keep only mandatory codes
      onChange(mandatoryCodes);
    } else {
      onChange(Array.from(new Set([...selectedCodes, ...allSelectableCodes])));
    }
  };

  const handleToggleModule = (code: string, isMandatory: boolean) => {
    if (isMandatory) return;
    const isSelected = selectedCodes.includes(code);
    if (isSelected) {
      onChange(selectedCodes.filter((c) => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  // Counts for summary bar
  const summaryCounts = useMemo(() => {
    // Map totals from unfiltered modules for accurate catalog summary
    const coreTotal = modules.filter(
      (m) =>
        (m.category || '').toLowerCase() === 'core' ||
        m.requiredBySystem ||
        mandatoryCodes.includes(m.code)
    ).length;

    const integrationsTotal = modules.filter((m) => {
      const c = (m.category || '').toLowerCase();
      return c === 'automation' || c === 'enterprise' || c.includes('integration');
    }).length;

    const advancedTotal = modules.length - coreTotal - integrationsTotal;

    const coreEnabled = modules
      .filter(
        (m) =>
          ((m.category || '').toLowerCase() === 'core' ||
            m.requiredBySystem ||
            mandatoryCodes.includes(m.code)) &&
          selectedCodes.includes(m.code)
      ).length;

    const integrationsEnabled = modules.filter((m) => {
      const c = (m.category || '').toLowerCase();
      return (
        (c === 'automation' || c === 'enterprise' || c.includes('integration')) &&
        selectedCodes.includes(m.code)
      );
    }).length;

    const advancedEnabled = selectedCodes.length - coreEnabled - integrationsEnabled;

    return [
      { title: 'Core Modules', enabled: coreEnabled, total: coreTotal },
      { title: 'Advanced Modules', enabled: Math.max(0, advancedEnabled), total: Math.max(0, advancedTotal) },
      { title: 'Integrations', enabled: integrationsEnabled, total: integrationsTotal },
    ];
  }, [modules, selectedCodes, mandatoryCodes]);

  const totalEnabled = selectedCodes.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Row with Info Box */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
            {selectedPlanName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                Plan: {selectedPlanName}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500">
            These modules are included by the selected plan and are shown read-only for this tenant.
          </p>

          {/* Search Input Bar */}
          <div className="relative w-full max-w-sm pt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 mt-0.5" />
            <input
              type="text"
              placeholder="Search modules by name, code, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-9 text-xs font-semibold rounded-sm border border-slate-200 bg-[#F8FAFC] text-[#0D1F3D] placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 mt-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-sm bg-purple-50 px-3.5 py-2.5 text-xs text-purple-900 font-semibold border border-purple-100/80 flex items-center gap-2.5 shrink-0 max-w-md">
          <Info className="h-4 w-4 text-purple-600 shrink-0" />
          <span className="leading-snug">{infoBannerText}</span>
        </div>
      </div>

      {/* Categorized Sections */}
      {categoryGroups.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-sm font-extrabold text-[#0D1F3D]">No Modules Match Your Search</p>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            No modules match the filter "{searchQuery}". Try searching with a different keyword.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="font-bold text-slate-700">
            Clear Search Filter
          </Button>
        </div>
      ) : (
        categoryGroups.map((group, groupIdx) => (
          <div key={group.title} className="space-y-3">
            {/* Section Header with Select All Toggle on First Section */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                {group.title} ({group.items.length})
              </h4>

              {groupIdx === 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Select All Modules</span>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAllSelected ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isAllSelected ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* 5-Column Grid Card Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {group.items.map((mod) => {
                const isChecked = selectedCodes.includes(mod.code);
                const isMandatory = Boolean(mod.requiredBySystem || mandatoryCodes.includes(mod.code));
                const style = MODULE_STYLING[mod.code] || {
                  icon: Layers,
                  iconBgClass: 'bg-indigo-50 border-indigo-100',
                  iconColorClass: 'text-indigo-600',
                };
                const IconComponent = style.icon;

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.code, isMandatory)}
                    className={`rounded-lg border p-4 shadow-xs flex flex-col justify-between items-center text-center relative transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? 'border-[#0D1F3D] bg-white ring-1 ring-[#0D1F3D]/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    } ${isMandatory ? 'opacity-95' : ''}`}
                  >
                    {/* Top-Left Reusable Checkbox */}
                    <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleModule(mod.code, isMandatory)}
                        disabled={isMandatory}
                      />
                    </div>

                    {/* Top-Right Mandatory Lock Icon */}
                    {isMandatory && (
                      <div className="absolute top-3 right-3 text-slate-400" title="Locked by Plan">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Centered Top Icon Container */}
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 mt-1 shadow-2xs border ${style.iconBgClass}`}
                    >
                      <IconComponent className={`h-6 w-6 ${style.iconColorClass}`} />
                    </div>

                    {/* Content */}
                    <div className="space-y-1 w-full">
                      <h5 className="text-xs font-extrabold text-[#0D1F3D] text-center leading-snug line-clamp-1">
                        {mod.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium text-center line-clamp-2 leading-relaxed min-h-[32px]">
                        {mod.description}
                      </p>
                    </div>

                    {/* Bottom Status Pill Badge */}
                    <div className="mt-3 pt-2 w-full border-t border-slate-100 flex justify-center">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200/80">Included by plan</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Bottom Modules Summary Bar (Identical to User Image Mockup) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 font-sans">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-[#0D1F3D] block">
            Modules Summary
          </span>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            {summaryCounts.map((sc) => {
              const isAllEnabled = sc.enabled === sc.total && sc.total > 0;
              return (
                <div key={sc.title} className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">{sc.title}:</span>
                  <span className={`font-extrabold ${isAllEnabled ? 'text-emerald-700' : 'text-[#0D1F3D]'}`}>
                    {sc.enabled} / {sc.total} Enabled
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#0D1F3D] block">Total Enabled</span>
            <span className="text-base font-extrabold text-indigo-700 leading-none">
              {totalEnabled} Modules
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
