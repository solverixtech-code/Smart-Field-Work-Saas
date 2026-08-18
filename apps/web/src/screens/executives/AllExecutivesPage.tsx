import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  MapPin,
  Calendar,
  UserX,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Upload,
  UserPlus2,
  FileSpreadsheet,
  Edit,
  ShieldAlert,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const teamOverviewData = [
  { name: 'Active', value: 128, color: '#10B981' },
  { name: 'On Field', value: 96, color: '#3B82F6' },
  { name: 'On Leave', value: 12, color: '#F59E0B' },
  { name: 'Inactive', value: 16, color: '#EF4444' },
];

const mockExecutives = [
  {
    id: 'FE-1001',
    name: 'Rahul Verma',
    team: 'Mumbai North Team',
    region: 'Mumbai',
    mobile: '+91 98765 43210',
    status: 'Active',
    visits: '8 Visits',
    leads: '3 Leads',
    joinDate: '12 Apr 2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1002',
    name: 'Priya Mehta',
    team: 'Mumbai West Team',
    region: 'Mumbai',
    mobile: '+91 98765 43211',
    status: 'Active',
    visits: '6 Visits',
    leads: '2 Leads',
    joinDate: '18 Apr 2024',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1003',
    name: 'Sanjay Yadav',
    team: 'Mumbai East Team',
    region: 'Mumbai',
    mobile: '+91 98765 43212',
    status: 'On Field',
    visits: '10 Visits',
    leads: '4 Leads',
    joinDate: '02 May 2024',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1004',
    name: 'Kavita Singh',
    team: 'Thane Central',
    region: 'Thane',
    mobile: '+91 98765 43213',
    status: 'On Leave',
    visits: '0 Visits',
    leads: '0 Leads',
    joinDate: '10 Mar 2024',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1005',
    name: 'Arun Kumar',
    team: 'Navi Mumbai Hub',
    region: 'Navi Mumbai',
    mobile: '+91 98765 43214',
    status: 'Active',
    visits: '7 Visits',
    leads: '2 Leads',
    joinDate: '25 Apr 2024',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1006',
    name: 'Imran Shaikh',
    team: 'Mumbai South',
    region: 'Mumbai',
    mobile: '+91 98765 43215',
    status: 'Inactive',
    visits: '0 Visits',
    leads: '0 Leads',
    joinDate: '15 Feb 2024',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1007',
    name: 'Neha Patil',
    team: 'Pune Central',
    region: 'Pune',
    mobile: '+91 98765 43216',
    status: 'Active',
    visits: '9 Visits',
    leads: '3 Leads',
    joinDate: '05 May 2024',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1008',
    name: 'Vikram Joshi',
    team: 'Kalyan Region',
    region: 'Thane',
    mobile: '+91 98765 43217',
    status: 'On Field',
    visits: '11 Visits',
    leads: '5 Leads',
    joinDate: '22 Apr 2024',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1009',
    name: 'Pooja Sharma',
    team: 'Borivali Team',
    region: 'Mumbai',
    mobile: '+91 98765 43218',
    status: 'Active',
    visits: '5 Visits',
    leads: '1 Lead',
    joinDate: '30 Apr 2024',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'FE-1010',
    name: 'Dinesh Gupta',
    team: 'Andheri West',
    region: 'Mumbai',
    mobile: '+91 98765 43219',
    status: 'On Leave',
    visits: '0 Visits',
    leads: '0 Leads',
    joinDate: '11 Mar 2024',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
];

export default function AllExecutivesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredExecutives = mockExecutives.filter((exec) => {
    const matchesSearch =
      exec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exec.mobile.includes(searchTerm);
    const matchesRegion = regionFilter === 'All' || exec.region === regionFilter;
    const matchesStatus = statusFilter === 'All' || exec.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredExecutives.map((x) => x.id));
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
    <div className="space-y-3 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">All Field Executives</h1>
          <p className="text-xs font-medium text-slate-500">
            Manage field staff, view live statuses, performance stats, and territory teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Executives Data...')}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Data
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/executives/new')}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Add Executive
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 sm:grid-cols-3">
        <KpiCard
          title="Total Executives"
          value="156"
          subValue="Active Roster"
          timeframe=""
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Executives"
          value="128"
          subValue="82.05% Active"
          timeframe=""
          icon={UserCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="On Field"
          value="96"
          subValue="61.54% On Field"
          timeframe=""
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="On Leave"
          value="12"
          subValue="7.69% On Leave"
          timeframe=""
          icon={Calendar}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Inactive"
          value="16"
          subValue="10.26% Inactive"
          timeframe=""
          icon={UserX}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value="8"
          subValue="5.13% New Joins"
          timeframe=""
          icon={UserPlus}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Full-Width Main Data Table Section */}
      <div className="space-y-3">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search executives by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Region Dropdown */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Thane">Thane</option>
            <option value="Navi Mumbai">Navi Mumbai</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Field">On Field</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table Card Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                    <th className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredExecutives.length && filteredExecutives.length > 0}
                        className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Executive</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Team & Region</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Mobile</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Today's Activity</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Join Date</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExecutives.map((exec) => {
                    const isSelected = selectedIds.includes(exec.id);
                    return (
                      <tr key={exec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(exec.id)}
                            className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={exec.avatar}
                              alt={exec.name}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <NavLink
                                to={`/admin/executives/${exec.id}`}
                                className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline whitespace-nowrap"
                              >
                                {exec.name}
                              </NavLink>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-500 whitespace-nowrap">{exec.id}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div>
                            <p className="font-bold text-[#0D1F3D] whitespace-nowrap">{exec.team}</p>
                            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{exec.region}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600 whitespace-nowrap">{exec.mobile}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${
                              exec.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                : exec.status === 'On Field'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                                  : exec.status === 'On Leave'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                                    : 'bg-red-50 text-[#E20613] border border-red-200/60'
                            }`}
                          >
                            {exec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div>
                            <p className="font-extrabold text-[#0D1F3D] whitespace-nowrap">{exec.visits}</p>
                            <p className="text-[10px] font-semibold text-[#E20613] whitespace-nowrap">{exec.leads}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap">{exec.joinDate}</td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 relative">
                            <NavLink
                              to={`/admin/executives/${exec.id}`}
                              title="View Executive Profile"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0D1F3D] transition duration-150"
                            >
                              <Eye className="h-4 w-4" />
                            </NavLink>

                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === exec.id ? null : exec.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Quick Actions */}
                            {activeMenuId === exec.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 text-left">
                                <NavLink
                                  to={`/admin/executives/${exec.id}`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Eye className="h-3.5 w-3.5 text-blue-600" /> View Profile
                                </NavLink>
                                <NavLink
                                  to={`/admin/executives/${exec.id}/edit`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Edit className="h-3.5 w-3.5 text-emerald-600" /> Edit Profile
                                </NavLink>
                                <NavLink
                                  to={`/admin/executives/${exec.id}/suspend`}
                                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#E20613] hover:bg-red-50"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" /> Access Control
                                </NavLink>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 bg-slate-50/40">
            <span>Showing 1 to {filteredExecutives.length} of 156 results</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 p-1 hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-lg bg-[#0D1F3D] px-3 py-1 font-bold text-white">1</span>
              <span className="px-1 text-slate-400">2</span>
              <span className="px-1 text-slate-400">3</span>
              <button className="rounded-lg border border-slate-200 p-1 hover:bg-slate-100 text-slate-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Overview Donut, Top Performers, Quick Actions (3 Column Grid below table) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Team Overview Donut Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Overview</h3>
            <span className="text-[11px] font-bold text-[#E20613]">156 Total</span>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamOverviewData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {teamOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-[#0D1F3D]">156</span>
              <span className="text-[10px] font-bold text-slate-400">Total Team</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1 border-t border-slate-100">
            {teamOverviewData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}:</span>
                <span className="font-bold text-[#0D1F3D]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers This Month */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Performers</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">This Month</span>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'Sanjay Yadav', leads: '43 Leads', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
              { rank: 2, name: 'Vikram Joshi', leads: '35 Leads', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
              { rank: 3, name: 'Rahul Verma', leads: '29 Leads', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
              { rank: 4, name: 'Neha Patil', leads: '27 Leads', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
              { rank: 5, name: 'Arun Kumar', leads: '24 Leads', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
            ].map((perf) => (
              <div key={perf.rank} className="flex items-center justify-between rounded-xl bg-slate-50/70 p-2.5 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    perf.rank === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{perf.rank}
                  </span>
                  <img src={perf.avatar} alt={perf.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                  <span className="text-xs font-bold text-[#0D1F3D]">{perf.name}</span>
                </div>
                <span className="text-xs font-extrabold text-[#E20613]">{perf.leads}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/executives/new')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1F3D]/10 text-[#0D1F3D]">
                <UserPlus2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Add Executive</span>
            </button>

            <button
              onClick={() => alert('Bulk Upload Dialog')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Bulk Upload</span>
            </button>

            <button
              onClick={() => alert('Assign Leads')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-[#E20613]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Assign Leads</span>
            </button>

            <button
              onClick={() => alert('Exporting Data...')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
