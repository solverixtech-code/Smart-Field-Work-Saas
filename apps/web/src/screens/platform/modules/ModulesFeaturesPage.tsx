import React, { useCallback, useEffect, useState } from 'react';
import { Archive, Boxes, CheckCircle2, GitBranch, Layers, Package, Plus, RefreshCw, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { RowActionsMenu } from '../../../components/ui/RowActionsMenu';
import { Select } from '../../../components/ui/Select';
import { moduleService, PaginatedModulesResponse } from '../../../features/platform/catalog/modules/services/module.service';
import { PlatformModule, PlatformModuleCategory, PlatformModuleStatus } from '../../../features/platform/catalog/modules/types/module.types';
import { usePlatformPermissions } from '../../../features/platform/tenants/hooks/usePlatformPermissions';

const categoryLabel: Record<PlatformModuleCategory, string> = { CORE: 'Core', SALES: 'Sales', FIELD_OPS: 'Field Operations', AUTOMATION: 'Automation', ENTERPRISE: 'Enterprise' };

export function ModulesFeaturesPage() {
  const navigate = useNavigate();
  const { canCreateModule, canUpdateModule, canArchiveModule } = usePlatformPermissions();
  const [result, setResult] = useState<PaginatedModulesResponse>({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } });
  const [summary, setSummary] = useState({ totalModules: 0, activeModules: 0, registeredFeatures: 0, dependencyLinks: 0 });
  const [search, setSearch] = useState(''); const [category, setCategory] = useState<PlatformModuleCategory | ''>(''); const [status, setStatus] = useState<PlatformModuleStatus | ''>(''); const [loading, setLoading] = useState(true);
  const load = useCallback(async (page = result.meta.page) => { setLoading(true); try { const [modules, counts] = await Promise.all([moduleService.getModulesPaginated({ page, limit: 20, search: search || undefined, category: category || undefined, status: status || undefined }), moduleService.getSummary()]); setResult(modules); setSummary(counts); } catch { toast.error('Unable to load the modules catalog.'); } finally { setLoading(false); } }, [category, result.meta.page, search, status]);
  useEffect(() => { const timeout = window.setTimeout(() => { void load(1); }, 300); return () => window.clearTimeout(timeout); }, [load]);
  const changeStatus = async (module: PlatformModule, archived: boolean) => { try { if (archived) await moduleService.archiveModule(module.id); else await moduleService.restoreModule(module.id); toast.success(archived ? 'Module archived.' : 'Module restored.'); await load(); } catch (error: unknown) { const message = typeof error === 'object' && error !== null && 'response' in error ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : undefined; toast.error(message ?? 'The module lifecycle change was not saved.'); } };
  const columns = [
    { header: 'Module', cell: (module: PlatformModule) => <button type="button" onClick={() => navigate(`/platform/modules/${module.id}`)} className="flex items-center gap-3 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-[#0D1F3D]"><Package className="h-4 w-4" /></span><span><span className="block font-extrabold text-[#0D1F3D]">{module.name}</span><span className="block max-w-xs truncate text-xs font-medium text-slate-600">{module.description}</span></span></button> },
    { header: 'Code', cell: (module: PlatformModule) => <span className="font-mono text-xs font-bold text-slate-800">{module.code}</span> },
    { header: 'Category', cell: (module: PlatformModule) => categoryLabel[module.category] },
    { header: 'Features', cell: (module: PlatformModule) => module.features.length },
    { header: 'Dependencies', cell: (module: PlatformModule) => module.dependencyCodes.length },
    { header: 'Status', cell: (module: PlatformModule) => <span className="text-xs font-bold text-slate-700">{module.status.charAt(0) + module.status.slice(1).toLowerCase()}</span> },
    { header: 'Updated', cell: (module: PlatformModule) => new Date(module.updatedAt).toLocaleDateString() },
    { header: 'Actions', cell: (module: PlatformModule) => <RowActionsMenu items={[{ label: 'View Details', onClick: () => navigate(`/platform/modules/${module.id}`) }, ...(canUpdateModule && module.status !== 'ARCHIVED' ? [{ label: 'Edit Module', onClick: () => navigate(`/platform/modules/${module.id}/edit`) }] : []), ...(canArchiveModule ? [{ label: module.status === 'ARCHIVED' ? 'Restore Module' : 'Archive Module', danger: module.status !== 'ARCHIVED', onClick: () => void changeStatus(module, module.status !== 'ARCHIVED') }] : [])]} /> },
  ];
  return <div className="space-y-6 pb-12 font-sans"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-extrabold text-[#0D1F3D]">Modules &amp; Features</h1><p className="text-xs font-medium text-slate-600">Manage platform capability modules and the coded features that power Smart Field Work experiences.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-1 h-4 w-4" />Refresh</Button>{canCreateModule && <Button variant="primary" size="sm" onClick={() => navigate('/platform/modules/create')}><Plus className="mr-1 h-4 w-4" />Create Module</Button>}</div></div><div className="rounded-sm border border-slate-200 bg-white p-4"><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search Modules" value={search} onChange={(event) => setSearch(event.target.value)} /><Select value={category} onChange={(event) => setCategory(event.target.value as PlatformModuleCategory | '')} options={[{ value: '', label: 'All Categories' }, ...Object.entries(categoryLabel).map(([value, label]) => ({ value, label }))]} /><Select value={status} onChange={(event) => setStatus(event.target.value as PlatformModuleStatus | '')} options={[{ value: '', label: 'All Statuses' }, ...(['DRAFT', 'ACTIVE', 'BETA', 'DEPRECATED', 'ARCHIVED'] as PlatformModuleStatus[]).map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))]} /><Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}>Reset</Button></div></div><div className="rounded-sm border border-slate-200 bg-white shadow-xs"><DataTable data={result.data} columns={columns} isLoading={loading} emptyMessage="No modules match the selected filters." pagination={{ currentPage: result.meta.page, totalPages: result.meta.totalPages, onPageChange: (page) => void load(page) }} /></div><div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4"><KpiCard title="Total Modules" value={summary.totalModules} icon={Layers} /><KpiCard title="Active Modules" value={summary.activeModules} icon={CheckCircle2} /><KpiCard title="Registered Features" value={summary.registeredFeatures} icon={Boxes} /><KpiCard title="Dependency Links" value={summary.dependencyLinks} icon={GitBranch} /></div></div>;
}
