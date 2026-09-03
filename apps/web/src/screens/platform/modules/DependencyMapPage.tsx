import React, { useState, useEffect, useMemo } from 'react';
import {
  GitBranch,
  Search,
  RefreshCw,
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { ModuleSectionNavigation } from '../../../components/platform/ModuleSectionNavigation';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import { PlatformModule } from '../../../features/platform/catalog/modules/types/module.types';
import { toast } from 'react-hot-toast';

export function DependencyMapPage() {
  const [modules, setModules] = useState<PlatformModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchCatalog = async () => {
    setError(null);
    try {
      const data = await moduleService.getModules();
      setModules(data);
    } catch {
      setError('Unable to load dependency graph. Service unreachable.');
      toast.error('Failed to fetch module dependency map from platform service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCatalog();
  };

  // Metrics
  const metrics = useMemo(() => {
    let totalLinks = 0;
    let rootCount = 0;
    let dependentCount = 0;

    for (const m of modules) {
      const parentDeps = m.dependencyCodes || [];
      const childDeps = m.dependentCodes || [];
      totalLinks += parentDeps.length;
      if (parentDeps.length === 0) rootCount++;
      if (childDeps.length > 0) dependentCount++;
    }

    return {
      totalModules: modules.length,
      totalLinks,
      rootCount,
      dependentCount,
    };
  }, [modules]);

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        m.code.toLowerCase().includes(search.toLowerCase().trim());

      const matchesCat =
        selectedCategory === 'ALL' || m.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [modules, search, selectedCategory]);

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Modules & Features</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <GitBranch className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Prerequisite dependency graph and downstream module relationship explorer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 font-bold text-slate-700 bg-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh Dependency Map
          </Button>
        </div>
      </div>

      {/* Section Navigation */}
      <ModuleSectionNavigation />

      {/* Filter Toolbar */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-12 sm:col-span-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search module name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'CORE', label: 'CORE — Base Infrastructure' },
                { value: 'SALES', label: 'SALES — Sales Engine' },
                { value: 'FIELD_OPS', label: 'FIELD_OPS — Field Operations' },
                { value: 'AUTOMATION', label: 'AUTOMATION — Automation & AI' },
                { value: 'ENTERPRISE', label: 'ENTERPRISE — Enterprise Suite' },
              ]}
            />
          </div>

          <div className="col-span-12 sm:col-span-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
              }}
              className="w-full font-bold text-slate-600 justify-center"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Dependency Graph Grid Cards */}
      {error ? (
        <div className="rounded-sm border border-rose-200 bg-white p-8 text-center space-y-3 max-w-md mx-auto shadow-xs">
          <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Unable to Load Dependency Map</h3>
          <p className="text-xs text-slate-500 font-medium">{error}</p>
          <Button variant="accent" size="sm" onClick={handleRefresh} className="font-extrabold bg-indigo-600 text-white">
            Retry Loading
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((mod) => {
            const parents = mod.dependencyCodes || [];
            const dependents = mod.dependentCodes || [];

            return (
              <div
                key={mod.code}
                className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 font-sans"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#0D1F3D]">{mod.name}</h4>
                        <span className="font-mono text-xs font-bold text-indigo-600">{mod.code}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                      {mod.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
                    {/* Prerequisite Parent Requirements */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Required Parents ({parents.length}):</span>
                      {parents.length > 0 ? (
                        <div className="space-y-1">
                          {parents.map((pCode) => (
                            <div
                              key={pCode}
                              className="px-2.5 py-1 rounded-sm bg-indigo-50/60 border border-indigo-100 text-[11px] font-mono font-bold text-indigo-700 flex items-center justify-between"
                            >
                              <span>{pCode}</span>
                              <ArrowRight className="h-3 w-3 text-indigo-500" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium italic">Root Module (No Prerequisite Parents)</p>
                      )}
                    </div>

                    {/* Downstream Dependents */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Downstream Dependents ({dependents.length}):</span>
                      {dependents.length > 0 ? (
                        <div className="space-y-1">
                          {dependents.map((dCode) => (
                            <div
                              key={dCode}
                              className="px-2.5 py-1 rounded-sm bg-purple-50/60 border border-purple-100 text-[11px] font-mono font-bold text-purple-700 flex items-center justify-between"
                            >
                              <span>{dCode}</span>
                              <CheckCircle className="h-3 w-3 text-purple-500" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium italic">No Downstream Dependents</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics KPI Row at Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <KpiCard
          title="Total Catalog Modules"
          value={metrics.totalModules}
          icon={Package}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Dependency Links"
          value={metrics.totalLinks}
          icon={GitBranch}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Root Parent Modules"
          value={metrics.rootCount}
          icon={ShieldCheck}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Dependent Modules"
          value={metrics.dependentCount}
          icon={Layers}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
      </div>
    </div>
  );
}
