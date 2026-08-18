import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle2,
  TrendingUp,
  Target,
  ChevronRight,
  UserCheck,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Clock,
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
  const [teams] = useState<SalesTeamItem[]>(mockTeams);

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Sales Teams Management</h1>
          <p className="text-xs font-medium text-slate-500">
            Configure sales team structures, assign team leaders, track monthly targets, and monitor overall performance.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate('/admin/teams/create')}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>

      {/* 5 Top Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Teams"
          value="8"
          change="+2"
          changeType="positive"
          timeframe="vs last month"
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Total Members"
          value="56"
          change="+12"
          changeType="positive"
          timeframe="vs last month"
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Active Teams"
          value="7"
          change="+1"
          changeType="positive"
          timeframe="vs last month"
          icon={Target}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Avg Team Size"
          value="7 Staff"
          change="-1"
          changeType="positive"
          timeframe="vs last month"
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

      {/* Main Row: Teams List Table (Left 8 Cols) + Distribution & Leaderboard (Right 4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Teams List Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-8 overflow-hidden flex flex-col justify-between">
          <div>
            {/* Toolbar Header */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Teams List</h2>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search teams, leaders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('Filtering options...')}
                  className="flex items-center gap-1.5 font-bold"
                >
                  <Filter className="h-3.5 w-3.5 text-slate-500" /> More Filters
                </Button>
              </div>
            </div>

            {/* Teams Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3.5">Team Name</th>
                    <th className="px-4 py-3.5">Team Leader</th>
                    <th className="px-4 py-3.5">Members</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Target (Monthly)</th>
                    <th className="px-4 py-3.5">Achieved (This Month)</th>
                    <th className="px-4 py-3.5">Performance</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTeams.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Team Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-extrabold ${t.avatarBg}`}>
                            {t.avatarText}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate(`/admin/teams/${t.id}`)}
                              className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline text-left block"
                            >
                              {t.name}
                            </button>
                            <p className="text-[10px] text-slate-400 font-medium">{t.region}</p>
                          </div>
                        </div>
                      </td>

                      {/* Team Leader */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={t.leaderAvatar}
                            alt={t.leaderName}
                            className="h-7 w-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-[#0D1F3D]">{t.leaderName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{t.leaderCode}</p>
                          </div>
                        </div>
                      </td>

                      {/* Members */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-extrabold text-[#0D1F3D]">{t.memberCount}</span>
                          <button
                            onClick={() => navigate(`/admin/teams/${t.id}/members`)}
                            className="block text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            View Members
                          </button>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 font-bold text-slate-600">
                        {t.department}
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3.5 font-bold text-[#0D1F3D]">
                        ₹{t.monthlyTarget.toLocaleString()}
                      </td>

                      {/* Achieved */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-extrabold text-[#0D1F3D]">₹{t.achievedAmount.toLocaleString()}</p>
                          <p className={`text-[10px] font-bold ${t.achievedPercent >= 75 ? 'text-emerald-600' : t.achievedPercent >= 50 ? 'text-amber-600' : 'text-[#E20613]'}`}>
                            {t.achievedPercent}%
                          </p>
                        </div>
                      </td>

                      {/* Performance Bar */}
                      <td className="px-4 py-3.5">
                        <div className="w-20">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.achievedPercent >= 75
                                  ? 'bg-emerald-500'
                                  : t.achievedPercent >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-[#E20613]'
                              }`}
                              style={{ width: `${Math.min(t.achievedPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                            t.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/teams/${t.id}`)}
                            title="View Team Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/teams/${t.id}/leader`)}
                            title="Assign Leader"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50/40">
            <p>Showing 1 to {filteredTeams.length} of {teams.length} teams</p>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 font-bold text-[#0D1F3D]">1</span>
              <span>10 / page</span>
            </div>
          </div>
        </div>

        {/* Right Column: Team Distribution + Top Performing Teams + Quick Actions */}
        <div className="space-y-6 lg:col-span-4">
          {/* Team Distribution Donut Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Distribution</h3>
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
                  <span className="text-xl font-extrabold text-[#0D1F3D]">8</span>
                  <span className="text-[10px] font-bold text-slate-400">Total Teams</span>
                </div>
              </div>

              <div className="mt-2 w-full space-y-1.5 text-[11px] font-semibold text-slate-600">
                {teamDistributionData.map((d) => (
                  <div key={d.name} className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="font-extrabold text-[#0D1F3D] ml-2">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Teams Leaderboard */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Performing Teams</h3>
              <span className="text-[10px] font-bold text-slate-400">This Month</span>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, name: 'Mumbai North Team', pct: 83, amount: '₹12,45,000 / ₹15,00,000', color: 'bg-emerald-500' },
                { rank: 2, name: 'Mumbai East Team', pct: 82, amount: '₹10,60,000 / ₹13,00,000', color: 'bg-emerald-500' },
                { rank: 3, name: 'Thane Team', pct: 78, amount: '₹7,80,000 / ₹10,00,000', color: 'bg-amber-500' },
                { rank: 4, name: 'Mumbai West Team', pct: 76, amount: '₹9,10,000 / ₹12,00,000', color: 'bg-amber-500' },
                { rank: 5, name: 'Pune Team', pct: 74, amount: '₹6,70,000 / ₹9,00,000', color: 'bg-amber-500' },
              ].map((t) => (
                <div key={t.rank} className="space-y-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-[#0D1F3D]">
                        {t.rank}
                      </span>
                      <span className="font-extrabold text-[#0D1F3D]">{t.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-700">{t.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-medium">{t.amount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/teams/create')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="h-4 w-4 text-[#E20613]" />
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Create New Team</p>
                    <p className="text-[10px] text-slate-400 font-medium">Add a new sales team</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/teams/targets')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Team Targets Matrix</p>
                    <p className="text-[10px] text-slate-400 font-medium">View overall target structure & performance</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Notice Footer */}
      <div className="flex items-center justify-center gap-2 pt-2 text-center text-xs font-semibold text-slate-400">
        <Clock className="h-4 w-4 text-slate-400" />
        <span>Team targets and performance are updated in real-time.</span>
      </div>
    </div>
  );
}
