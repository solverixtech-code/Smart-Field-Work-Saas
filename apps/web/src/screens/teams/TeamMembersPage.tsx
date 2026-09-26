import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Target,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AddMemberModal } from '../../components/teams/AddMemberModal';
import { Avatar } from '../../components/ui/Avatar';
import { useTeamWorkspace, teamApi } from './teams.api';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { extractErrorMessage } from '../../common/api';

interface TeamMemberItem {
  id: string;
  name: string;
  avatar: string;
  employeeId: string;
  role: string;
  roleBadgeColor: string;
  joinedOn: string;
  monthlyDealsTarget: number;
  monthlyAmountTarget: number;
  performancePercent: number;
  status: 'Active' | 'Inactive';
}

export default function TeamMembersPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { data, refresh } = useTeamWorkspace(teamId);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMemberItem | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [confirmBulkRemove, setConfirmBulkRemove] = useState(false);
  const membersData: TeamMemberItem[] = (data?.members ?? []).map((member) => ({
    id: member.id, name: member.name, avatar: member.avatarUrl ?? '', employeeId: member.employeeCode ?? 'Not assigned',
    role: member.designation, roleBadgeColor: member.roleCode.includes('leader') ? 'bg-purple-50 text-purple-700 border border-purple-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    joinedOn: new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    monthlyDealsTarget: member.dealsTarget, monthlyAmountTarget: member.target, performancePercent: member.achievementPercent, status: member.status,
  }));
  const roleDistributionData = [...new Set(membersData.map((member) => member.role))].map((role, index) => ({
    name: role, value: membersData.filter((member) => member.role === role).length,
    color: ['#8B5CF6', '#10B981', '#2563EB', '#F59E0B'][index % 4],
  }));

  const filteredMembers = membersData.filter((m) => {
    const matchesFilter = activeFilter === 'All' || m.status === activeFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMembers.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!teamId || !memberToRemove) return;
    setIsRemovingMember(true);
    try {
      await teamApi.removeMember(teamId, memberToRemove.id);
      toast.success(`${memberToRemove.name} removed from ${data?.team.name ?? 'team'}`);
      setMemberToRemove(null);
      refresh();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to remove member from team.'));
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleConfirmBulkRemove = async () => {
    if (!teamId || selectedIds.length === 0) return;
    setIsRemovingMember(true);
    try {
      await Promise.all(selectedIds.map((id) => teamApi.removeMember(teamId, id)));
      toast.success(`Removed ${selectedIds.length} member(s) from ${data?.team.name ?? 'team'}`);
      setSelectedIds([]);
      setConfirmBulkRemove(false);
      refresh();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to remove selected members.'));
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Team Members — {data?.team.name ?? 'Team'}</h1>
          <p className="text-xs font-medium text-slate-500">
            View executive roster, individual targets, performance scores, and role breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId ?? ''}`)}
            className="flex items-center gap-2 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Team Details
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* Team Meta Header Card */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-100 text-blue-700 text-lg font-extrabold">
              {(data?.team.name ?? 'Team').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#0D1F3D]">{data?.team.name ?? 'Loading team...'}</h2>
                <span className="rounded-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                  {data?.team.status ?? 'Active'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">Team Leader: <span className="font-bold text-[#0D1F3D]">{data?.leader ? `${data.leader.name} (${data.leader.employeeCode ?? 'No code'})` : 'Not assigned'}</span></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Department</span>
              <span className="font-extrabold text-[#0D1F3D]">{data?.team.department ?? '—'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Region / Area</span>
              <span className="font-extrabold text-[#0D1F3D]">{data?.team.region ?? 'Not assigned'}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Members</span>
              <span className="font-extrabold text-[#0D1F3D]">{data?.summary.totalMembers ?? 0} Executive Staff</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Team Code</span>
              <span className="font-mono font-extrabold text-[#0D1F3D]">{data?.team.code ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Members"
          value={String(data?.summary.totalMembers ?? 0)}
          subValue="Active Roster"
          timeframe=""
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Members"
          value={String(data?.summary.activeMembers ?? 0)}
          subValue={`${data?.summary.totalMembers ? ((data.summary.activeMembers / data.summary.totalMembers) * 100).toFixed(1) : '0.0'}% Active`}
          timeframe=""
          icon={UserCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Inactive Members"
          value={String(data?.summary.inactiveMembers ?? 0)}
          subValue={`${data?.summary.totalMembers ? ((data.summary.inactiveMembers / data.summary.totalMembers) * 100).toFixed(1) : '0.0'}% Inactive`}
          timeframe=""
          icon={UserX}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value={String(data?.summary.newThisMonth ?? 0)}
          subValue={`${data?.summary.totalMembers ? ((data.summary.newThisMonth / data.summary.totalMembers) * 100).toFixed(1) : '0.0'}% New Joins`}
          timeframe=""
          icon={UserPlus}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
      </div>

      {/* Full-Width Main Data Table Section */}
      <div className="space-y-4">
        {/* Toolbar & Filters matching All Executives Page */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmBulkRemove(true)}
              className="flex items-center gap-1.5 font-bold text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Selected ({selectedIds.length})
            </Button>
          )}
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm text-xs font-extrabold">
            {(['All', 'Active', 'Inactive'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-white text-[#0D1F3D] shadow-xs'
                    : 'text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                {tab === 'All' ? `All (${data?.summary.totalMembers ?? 0})` : tab === 'Active' ? `Active (${data?.summary.activeMembers ?? 0})` : `Inactive (${data?.summary.inactiveMembers ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card Container */}
        <div className="overflow-hidden rounded-sm border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                    <th className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                        className="rounded-sm border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Member</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Employee ID</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Role</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Joined On</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Targets (Monthly)</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Performance</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMembers.map((m) => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(m.id)}
                            className="rounded-sm border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/admin/executives/${m.id}`)}>
                            <Avatar name={m.name} src={m.avatar || undefined} sizeClassName="h-8 w-8" />
                            <p className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline cursor-pointer whitespace-nowrap">{m.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 font-bold whitespace-nowrap">{m.employeeId}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${m.roleBadgeColor}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-500 whitespace-nowrap">{m.joinedOn}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div>
                            <p className="font-extrabold text-[#0D1F3D]">
                              {m.monthlyDealsTarget} Deals / ₹{m.monthlyAmountTarget.toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-xs ${m.performancePercent >= 75 ? 'text-emerald-600' : m.performancePercent >= 50 ? 'text-amber-600' : 'text-[#E20613]'}`}>
                              {m.performancePercent}%
                            </span>
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.performancePercent >= 75 ? 'bg-emerald-500' : m.performancePercent >= 50 ? 'bg-amber-500' : 'bg-[#E20613]'}`}
                                style={{ width: `${m.performancePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-sm px-2.5 py-0.5 text-[10px] font-extrabold ${
                              m.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                : 'bg-red-50 text-[#E20613] border border-red-200/60'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="View Profile"
                              onClick={() => navigate(`/admin/executives/${m.id}`)}
                              className="p-1.5 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <RowActionsMenu
                              items={[
                                {
                                  label: 'View Profile',
                                  icon: Eye,
                                  onClick: () => navigate(`/admin/executives/${m.id}`),
                                },
                                {
                                  label: 'Edit Executive',
                                  icon: Edit,
                                  onClick: () => navigate(`/admin/executives/${m.id}/edit`),
                                },
                                {
                                  label: 'Remove from Team',
                                  icon: UserX,
                                  danger: true,
                                  divider: true,
                                  onClick: () => setMemberToRemove(m),
                                },
                              ]}
                            />



                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer Pagination matching All Executives Page */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50/40">
            <p>Showing 1 to {filteredMembers.length} of {membersData.length} members</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-xs font-bold text-white">
                  1
                </span>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <select className="rounded-sm border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#0D1F3D]">
                <option>10 / page</option>
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Summary + Quick Actions + Role Donut (3 Column Grid below table) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Summary Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 text-xs">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Summary</h3>
          <div className="space-y-2 font-semibold text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Team Leader</span>
              <span className="font-extrabold text-[#0D1F3D]">{data?.leader ? `${data.leader.name} (${data.leader.employeeCode ?? 'No code'})` : 'Not assigned'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Department</span>
              <span className="font-bold text-slate-700">{data?.team.department ?? '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Region / Area</span>
              <span className="font-bold text-slate-700">{data?.team.region ?? 'Not assigned'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Team Type</span>
              <span className="font-bold text-slate-700">{data?.team.teamType ?? '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Created On</span>
              <span className="font-bold text-slate-700">{data ? new Date(data.team.createdAt).toLocaleDateString('en-IN') : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Last Updated</span>
              <span className="font-bold text-slate-700">{data ? new Date(data.team.updatedAt).toLocaleString('en-IN') : '—'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Add New Member</p>
                  <p className="text-[10px] text-slate-400 font-medium">Add a new executive to this team</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => toast.info('Select Excel file to import team members...')}
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Import Members</p>
                  <p className="text-[10px] text-slate-400 font-medium">Bulk import members via Excel</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}/targets`)}
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-[#E20613]" />
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Update Targets</p>
                  <p className="text-[10px] text-slate-400 font-medium">Set or update monthly targets</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => toast.success('Exporting team members list...')}
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Download className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Export Members</p>
                  <p className="text-[10px] text-slate-400 font-medium">Download members list as Excel</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Role Distribution Donut Chart */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Role Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val) => [`${val ?? 0} Staff`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-[#0D1F3D]">{membersData.length}</span>
                <span className="text-[10px] font-bold text-slate-400">Total Staff</span>
              </div>
            </div>

            <div className="mt-2 w-full space-y-1.5 text-[11px] font-semibold text-slate-600">
              {roleDistributionData.map((r) => (
                <div key={r.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </span>
                  <span className="font-extrabold text-[#0D1F3D]">{r.value} ({(membersData.length ? (r.value / membersData.length) * 100 : 0).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Single Member Removal Modal */}
      {memberToRemove && (
        <Modal
          isOpen={Boolean(memberToRemove)}
          title="Remove Member from Team"
          onClose={() => {
            if (!isRemovingMember) setMemberToRemove(null);
          }}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-slate-600 font-medium leading-relaxed">
              Are you sure you want to remove <strong className="text-[#0D1F3D]">{memberToRemove.name}</strong> from <strong className="text-[#0D1F3D]">{data?.team.name ?? 'this team'}</strong>?
            </p>
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-sm">
              <p className="text-xs font-semibold text-[#0D1F3D]">
                This executive will no longer be listed in this team's active roster or receive team targets.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isRemovingMember}
                onClick={() => setMemberToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isRemovingMember}
                onClick={handleConfirmRemoveMember}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isRemovingMember ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Member Removal Modal */}
      {confirmBulkRemove && (
        <Modal
          isOpen={confirmBulkRemove}
          title="Bulk Remove Team Members"
          onClose={() => {
            if (!isRemovingMember) setConfirmBulkRemove(false);
          }}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-slate-600 font-medium leading-relaxed">
              Are you sure you want to remove <strong className="text-rose-600">{selectedIds.length} selected member(s)</strong> from <strong className="text-[#0D1F3D]">{data?.team.name ?? 'this team'}</strong>?
            </p>
            <div className="bg-rose-50 border border-rose-200/80 p-3 rounded-sm">
              <p className="text-xs font-semibold text-rose-800">
                This will unassign all selected executives from this team and revoke active team targets.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={isRemovingMember}
                onClick={() => setConfirmBulkRemove(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isRemovingMember}
                onClick={handleConfirmBulkRemove}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isRemovingMember ? 'Removing...' : `Remove ${selectedIds.length} Members`}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        teamId={teamId}
        teamName={data?.team.name ?? 'Team'}
        candidates={data?.candidates ?? []}
        onMembersAdded={refresh}
      />
    </div>
  );
}
