import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Target,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Building2,
  BarChart3,
  Clock,
  Download,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

export interface SalesTeamItem {
  id: string;
  name: string;
  code: string;
  avatarBg: string;
  avatarText: string;
  region: string;
  leaderName: string;
  leaderCode: string;
  leaderAvatar: string;
  memberCount: number;
  department: string;
  monthlyTarget: number;
  achievedAmount: number;
  achievedPercent: number;
  status: 'Active' | 'Inactive';
}

const mockTeams: SalesTeamItem[] = [
  {
    id: 'MN-001',
    name: 'Mumbai North Team',
    code: 'MN-001',
    avatarBg: 'bg-blue-100 text-blue-700',
    avatarText: 'MN',
    region: 'North Mumbai Region',
    leaderName: 'Sanjay Yadav',
    leaderCode: 'TL-1003',
    leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    memberCount: 8,
    department: 'Sales',
    monthlyTarget: 1500000,
    achievedAmount: 1245000,
    achievedPercent: 83,
    status: 'Active',
  },
  {
    id: 'MW-002',
    name: 'Mumbai West Team',
    code: 'MW-002',
    avatarBg: 'bg-purple-100 text-purple-700',
    avatarText: 'MW',
    region: 'Western Suburbs',
    leaderName: 'Priya Mehta',
    leaderCode: 'TL-1007',
    leaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    memberCount: 6,
    department: 'Sales',
    monthlyTarget: 1200000,
    achievedAmount: 910000,
    achievedPercent: 76,
    status: 'Active',
  },
  {
    id: 'ME-003',
    name: 'Mumbai East Team',
    code: 'ME-003',
    avatarBg: 'bg-emerald-100 text-emerald-700',
    avatarText: 'ME',
    region: 'Eastern Suburbs',
    leaderName: 'Rohit Singh',
    leaderCode: 'TL-1011',
    leaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    memberCount: 7,
    department: 'Sales',
    monthlyTarget: 1300000,
    achievedAmount: 1060000,
    achievedPercent: 82,
    status: 'Active',
  },
  {
    id: 'TH-004',
    name: 'Thane Team',
    code: 'TH-004',
    avatarBg: 'bg-amber-100 text-amber-700',
    avatarText: 'TH',
    region: 'Thane & Navi Mumbai',
    leaderName: 'Karan Patil',
    leaderCode: 'TL-1009',
    leaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    memberCount: 6,
    department: 'Sales',
    monthlyTarget: 1000000,
    achievedAmount: 780000,
    achievedPercent: 78,
    status: 'Active',
  },
  {
    id: 'PU-005',
    name: 'Pune Team',
    code: 'PU-005',
    avatarBg: 'bg-rose-100 text-rose-700',
    avatarText: 'PU',
    region: 'Pune City & PCMC',
    leaderName: 'Neha Deshpande',
    leaderCode: 'TL-1014',
    leaderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    memberCount: 5,
    department: 'Sales',
    monthlyTarget: 900000,
    achievedAmount: 670000,
    achievedPercent: 74,
    status: 'Active',
  },
  {
    id: 'NG-006',
    name: 'Nagpur Team',
    code: 'NG-006',
    avatarBg: 'bg-indigo-100 text-indigo-700',
    avatarText: 'NG',
    region: 'Nagpur Region',
    leaderName: 'Amit Kale',
    leaderCode: 'TL-1016',
    leaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    memberCount: 4,
    department: 'Sales',
    monthlyTarget: 700000,
    achievedAmount: 420000,
    achievedPercent: 60,
    status: 'Active',
  },
  {
    id: 'SU-007',
    name: 'Surat Team',
    code: 'SU-007',
    avatarBg: 'bg-slate-200 text-slate-700',
    avatarText: 'SU',
    region: 'Surat & South Gujarat',
    leaderName: 'Vishal Shah',
    leaderCode: 'TL-1017',
    leaderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    memberCount: 4,
    department: 'Sales',
    monthlyTarget: 600000,
    achievedAmount: 310000,
    achievedPercent: 52,
    status: 'Inactive',
  },
  {
    id: 'BA-008',
    name: 'Bangalore Team',
    code: 'BA-008',
    avatarBg: 'bg-slate-200 text-slate-700',
    avatarText: 'BA',
    region: 'Bangalore Region',
    leaderName: 'Megha Iyer',
    leaderCode: 'TL-1018',
    leaderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    memberCount: 6,
    department: 'Sales',
    monthlyTarget: 1100000,
    achievedAmount: 0,
    achievedPercent: 0,
    status: 'Inactive',
  },
];

const teamDistributionData = [
  { name: 'Mumbai Region', value: 3, color: '#0D1F3D' },
  { name: 'Thane & Navi Mumbai', value: 1, color: '#10B981' },
  { name: 'Pune Region', value: 1, color: '#2563EB' },
  { name: 'Nagpur Region', value: 1, color: '#F59E0B' },
  { name: 'South Gujarat', value: 1, color: '#E20613' },
  { name: 'Bangalore Region', value: 1, color: '#8B5CF6' },
];

export default function SalesTeamsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [teams] = useState<SalesTeamItem[]>(mockTeams);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'All' || t.region.includes(regionFilter);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTeams.map((t) => t.id));
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
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Sales Teams Management</h1>
          <p className="text-xs font-normal text-slate-500">
            Configure sales team structures, assign team leaders, track monthly targets, and monitor overall performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Teams Data...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export Data
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/teams/create')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        </div>
      </div>

      {/* 5 Top Metric KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Teams"
          value="8"
          subValue="Active & Operational"
          timeframe=""
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Total Members"
          value="56"
          subValue="Active Field Staff"
          timeframe=""
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Active Teams"
          value="7"
          subValue="87.5% Active"
          timeframe=""
          icon={Target}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Avg Team Size"
          value="7 Staff"
          subValue="Staff Per Team"
          timeframe=""
          icon={UserCheck}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total Deals (This Month)"
          value="142 Deals"
          change="+16%"
          changeType="positive"
          timeframe="vs last month"
          icon={BarChart3}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
      </div>

      {/* Main Table Section */}
      <div className="space-y-3">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams by name, code, leader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Region Dropdown */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Thane">Thane</option>
            <option value="Pune">Pune</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Bangalore">Bangalore</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table Card Container */}
        <div className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-semibold text-slate-800">
                    <th className="p-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredTeams.length && filteredTeams.length > 0}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Team Name</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Team Leader</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[90px]">Members</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[120px]">Department</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[140px]">Monthly Target</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[160px]">Achieved (This Month)</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[130px]">Performance</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[100px]">Status</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredTeams.map((t) => {
                    const isSelected = selectedIds.includes(t.id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(t.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>

                        {/* Team Name */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${t.avatarBg}`}>
                              {t.avatarText}
                            </div>
                            <div>
                              <button
                                onClick={() => navigate(`/admin/teams/${t.id}`)}
                                className="font-semibold text-slate-900 hover:text-blue-700 hover:underline text-left block whitespace-nowrap"
                              >
                                {t.name}
                              </button>
                              <p className="text-xs text-slate-600 font-normal whitespace-nowrap">{t.region}</p>
                            </div>
                          </div>
                        </td>

                        {/* Team Leader */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={t.leaderAvatar}
                              alt={t.leaderName}
                              className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 whitespace-nowrap">{t.leaderName}</p>
                              <p className="text-xs text-slate-600 font-mono whitespace-nowrap">{t.leaderCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Members */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div>
                            <span className="font-semibold text-slate-900">{t.memberCount}</span>
                            <button
                              onClick={() => navigate(`/admin/teams/${t.id}/members`)}
                              className="block text-xs text-blue-700 font-medium hover:underline whitespace-nowrap mx-auto"
                            >
                              View Members
                            </button>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                          {t.department}
                        </td>

                        {/* Target (Monthly) - Aligned Right */}
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap text-right">
                          ₹{t.monthlyTarget.toLocaleString()}
                        </td>

                        {/* Achieved (This Month) - Aligned Right */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div>
                            <p className="font-semibold text-slate-900">₹{t.achievedAmount.toLocaleString()}</p>
                            <p className={`text-xs font-semibold ${t.achievedPercent >= 75 ? 'text-emerald-700' : t.achievedPercent >= 50 ? 'text-amber-700' : 'text-rose-600'}`}>
                              {t.achievedPercent}%
                            </p>
                          </div>
                        </td>

                        {/* Performance Bar */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="w-24 mx-auto">
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  t.achievedPercent >= 75
                                    ? 'bg-emerald-600'
                                    : t.achievedPercent >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-600'
                                }`}
                                style={{ width: `${Math.min(t.achievedPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold border ${
                              t.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Actions Column with Floating Dropdown Menu */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/teams/${t.id}`)}
                              title="View Team Details"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === t.id ? null : t.id);
                                }}
                                title="Team Actions Menu"
                                className={`p-1.5 rounded-lg transition-colors border shadow-xs ${
                                  activeMenuId === t.id
                                    ? 'bg-[#0D1F3D] text-white border-[#0D1F3D]'
                                    : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#0D1F3D]'
                                }`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {/* Floating Dropdown Action Menu */}
                              {activeMenuId === t.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 text-left animate-fadeIn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/leader`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#0D1F3D] hover:bg-red-50 hover:text-[#E20613] transition-colors"
                                  >
                                    <UserCheck className="h-4 w-4 text-[#E20613]" />
                                    <span>Assign / Change Leader</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/members`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span>Manage Members ({t.memberCount})</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/performance`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                                    <span>View Team Performance</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/targets`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Target className="h-4 w-4 text-purple-600" />
                                    <span>Manage Team Targets</span>
                                  </button>

                                  <div className="border-t border-slate-100 pt-1">
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        navigate(`/admin/teams/${t.id}`);
                                      }}
                                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                      <Eye className="h-4 w-4 text-slate-500" />
                                      <span>Team Full Details</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-medium bg-slate-50">
            <p>Showing 1 to {filteredTeams.length} of {teams.length} teams</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                  1
                </span>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <select className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900">
                <option>10 / page</option>
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Distribution + Top Performing Teams + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Distribution Donut Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Team Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {teamDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Teams`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">8</span>
                <span className="text-xs font-normal text-slate-600">Total Teams</span>
              </div>
            </div>

            <div className="mt-2 w-full space-y-1.5 text-xs font-medium text-slate-700">
              {teamDistributionData.map((d) => (
                <div key={d.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate text-slate-700">{d.name}</span>
                  </span>
                  <span className="font-semibold text-slate-900 ml-2">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Teams Leaderboard */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Top Performing Teams</h3>
            <span className="text-xs font-normal text-slate-600">This Month</span>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'Mumbai North Team', pct: 83, amount: '₹12,45,000 / ₹15,00,000', color: 'bg-emerald-600' },
              { rank: 2, name: 'Mumbai East Team', pct: 82, amount: '₹10,60,000 / ₹13,00,000', color: 'bg-emerald-600' },
              { rank: 3, name: 'Thane Team', pct: 78, amount: '₹7,80,000 / ₹10,00,000', color: 'bg-amber-500' },
              { rank: 4, name: 'Mumbai West Team', pct: 76, amount: '₹9,10,000 / ₹12,00,000', color: 'bg-amber-500' },
              { rank: 5, name: 'Pune Team', pct: 74, amount: '₹6,70,000 / ₹9,00,000', color: 'bg-amber-500' },
            ].map((t) => (
              <div key={t.rank} className="space-y-1.5 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200">
                      {t.rank}
                    </span>
                    <span className="font-semibold text-slate-900">{t.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{t.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                </div>
                <p className="text-xs text-right text-slate-600 font-normal">{t.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/teams/create')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="h-4 w-4 text-slate-900" />
                <div>
                  <p className="font-bold text-slate-900">Create New Team</p>
                  <p className="text-xs text-slate-600 font-normal">Add a new sales team</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => navigate('/admin/teams/targets')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-slate-900" />
                <div>
                  <p className="font-bold text-slate-900">Team Targets Matrix</p>
                  <p className="text-xs text-slate-600 font-normal">View overall target structure & performance</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Notice Footer */}
      <div className="flex items-center justify-center gap-2 pt-2 text-center text-xs font-normal text-slate-600">
        <Clock className="h-4 w-4 text-slate-500" />
        <span>Team targets and performance are updated in real-time.</span>
      </div>
    </div>
  );
}
