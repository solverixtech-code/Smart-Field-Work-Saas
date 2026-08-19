import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  MoreVertical,
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { mockBusinesses, BusinessItem } from './businessesData';

const statusDistributionData = [
  { name: 'Active', value: 5102, color: '#10B981' },
  { name: 'Inactive', value: 540, color: '#F59E0B' },
  { name: 'Blocked', value: 200, color: '#E20613' },
];

const sourceDistribution = [
  { name: 'Website', count: 1420, pct: '24.3%', color: 'bg-blue-600' },
  { name: 'Referral', count: 1080, pct: '18.5%', color: 'bg-emerald-500' },
  { name: 'Google Ads', count: 890, pct: '15.2%', color: 'bg-amber-500' },
  { name: 'Justdial', count: 760, pct: '13.0%', color: 'bg-purple-500' },
  { name: 'Facebook', count: 620, pct: '10.6%', color: 'bg-indigo-500' },
  { name: 'Others', count: 1072, pct: '18.4%', color: 'bg-slate-400' },
];

export default function AllBusinessesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const filteredBusinesses = mockBusinesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm);
    const matchesType = typeFilter === 'All' || b.businessType.includes(typeFilter);
    const matchesCity = cityFilter === 'All' || b.city === cityFilter;
    const matchesSource = sourceFilter === 'All' || b.source === sourceFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesType && matchesCity && matchesSource && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBusinesses.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-3 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">All Businesses</h1>
          <p className="text-xs font-normal text-slate-500">
            Manage and view all registered business accounts and merchant profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting business directory...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('Opening New Business Form...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {/* 5 Top Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Businesses"
          value="5,842"
          subValue="All time"
          timeframe=""
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Businesses"
          value="5,102"
          subValue="87.3% of total"
          timeframe=""
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Inactive Businesses"
          value="540"
          subValue="9.2% of total"
          timeframe=""
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Blocked Businesses"
          value="200"
          subValue="3.4% of total"
          timeframe=""
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value="148"
          change="+12.6%"
          changeType="positive"
          timeframe="vs last month"
          icon={RefreshCw}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 text-xs font-semibold">
          {/* Search Input */}
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { label: 'All Business Types', value: 'All' },
              { label: 'Gym / Fitness', value: 'Gym' },
              { label: 'Food & Beverage', value: 'Food' },
              { label: 'Security Services', value: 'Security' },
              { label: 'Construction', value: 'Construction' },
              { label: 'Retail Supermarket', value: 'Retail' },
              { label: 'Beauty & Salon', value: 'Beauty' },
            ]}
          />

          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            options={[
              { label: 'All Cities', value: 'All' },
              { label: 'Mumbai', value: 'Mumbai' },
              { label: 'Pune', value: 'Pune' },
              { label: 'Thane', value: 'Thane' },
              { label: 'Navi Mumbai', value: 'Navi Mumbai' },
            ]}
          />

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            options={[
              { label: 'All Sources', value: 'All' },
              { label: 'Website', value: 'Website' },
              { label: 'Referral', value: 'Referral' },
              { label: 'Google Ads', value: 'Google Ads' },
              { label: 'Justdial', value: 'Justdial' },
              { label: 'Cold Call', value: 'Cold Call' },
              { label: 'Instagram', value: 'Instagram' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Blocked', value: 'Blocked' },
            ]}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('All');
                setCityFilter('All');
                setSourceFilter('All');
                setStatusFilter('All');
              }}
              className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 text-xs font-bold"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Table (Left 9 Cols) + Charts & Quick Actions Sidebar (Right 3 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Table Container (9 Cols) */}
        <div className="lg:col-span-9 space-y-3">
          <div className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-bold text-[#0D1F3D]">
                    <th className="p-3 text-center w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                        className="rounded border-slate-300 text-[#0D1F3D] focus:ring-[#0D1F3D]"
                      />
                    </th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[200px]">Business Details</th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[140px]">Business Type</th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[140px]">Contact Person</th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[150px]">Contact Info</th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[110px]">Source</th>
                    <th className="px-3.5 py-3 whitespace-nowrap min-w-[150px]">Assigned To</th>
                    <th className="px-3.5 py-3 whitespace-nowrap text-center min-w-[90px]">Status</th>
                    <th className="px-3.5 py-3 whitespace-nowrap text-right min-w-[90px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBusinesses.map((b) => {
                    const isSelected = selectedIds.includes(b.id);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(b.id)}
                            className="rounded border-slate-300 text-[#0D1F3D] focus:ring-[#0D1F3D]"
                          />
                        </td>

                        {/* Business Details */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {b.logoUrl ? (
                              <img
                                src={b.logoUrl}
                                alt={b.name}
                                className="h-8 w-8 rounded-md object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className={`flex h-8 w-8 items-center justify-center rounded-md font-bold text-xs shrink-0 ${b.logoBg}`}>
                                {b.logoText}
                              </div>
                            )}
                            <div>
                              <button
                                onClick={() => navigate(`/admin/businesses/${b.id}`)}
                                className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline text-left block whitespace-nowrap"
                              >
                                {b.name}
                              </button>
                              <p className="text-[11px] text-slate-500 font-normal whitespace-nowrap">
                                {b.city}, Maharashtra • <span className="font-mono text-[10px] text-slate-400">ID: {b.id}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Business Type */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100">
                            {b.businessType}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <p className="font-bold text-[#0D1F3D]">{b.contactPerson}</p>
                          <p className="text-[11px] text-slate-500 font-normal">{b.contactRole}</p>
                        </td>

                        {/* Contact Info */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{b.phone}</p>
                          <p className="text-[11px] text-slate-500">{b.email}</p>
                        </td>

                        {/* Source */}
                        <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-700">
                          {b.source}
                        </td>

                        {/* Assigned To */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={b.assignedToAvatar}
                              alt={b.assignedToName}
                              className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-[#0D1F3D]">{b.assignedToName}</p>
                              <p className="text-[10px] text-slate-500">{b.assignedToRole}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                              b.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : b.status === 'Inactive'
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/businesses/${b.id}`)}
                              className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
                              title="View Business Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === b.id ? null : b.id);
                              }}
                              className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-500">
              <span>Showing 1 to {filteredBusinesses.length} of 5,842 businesses</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs">Prev</Button>
                <Button variant="accent" size="sm" className="h-7 px-2.5 text-xs bg-[#0D1F3D]">1</Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">2</Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">3</Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Next</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Charts & Quick Actions (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Donut Chart: Businesses by Status */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Businesses by Status</h3>
            <div className="flex items-center justify-center">
              <div className="h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Businesses`, 'Count']}
                      contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-600">
              {statusDistributionData.map((s) => (
                <div key={s.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{s.value.toLocaleString()} ({((s.value / 5842) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bars: Businesses by Source */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Businesses by Source</h3>
            <div className="space-y-2.5 text-xs font-semibold">
              {sourceDistribution.map((src) => (
                <div key={src.name} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>{src.name}</span>
                    <span className="font-bold text-[#0D1F3D]">{src.count.toLocaleString()} ({src.pct})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${src.color} rounded-full`} style={{ width: src.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Quick Actions</h3>
            <div className="space-y-2 text-xs font-semibold">
              <button
                onClick={() => toast.info('Opening Add Business Form...')}
                className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Add New Business</p>
                    <p className="text-[10px] text-slate-400">Manually add a new merchant</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => toast.info('Select Excel file to import businesses...')}
                className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Import Businesses</p>
                    <p className="text-[10px] text-slate-400">Bulk import from CSV/Excel</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => toast.success('Exporting business list...')}
                className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Export Businesses</p>
                    <p className="text-[10px] text-slate-400">Download business list</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
