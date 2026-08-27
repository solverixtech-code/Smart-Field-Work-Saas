import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronDown,
  Search,
  CheckCircle2,
  Users,
  Shield,
  Plus,
  MoreVertical,
  Download,
  Filter,
  RotateCcw,
  Check,
  Building2,
  UserPlus,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isYou?: boolean;
  roleLabel: string;
  roleBg: string;
  roleColor: string;
  department: string;
  status: 'Active' | 'Suspended' | 'Invited';
  joinedOn: string;
  lastActive: string;
  twoFactor: boolean;
  sessions: number;
}

const seatChartData = [
  { name: 'Active Users', value: 112, color: '#4F46E5' },
  { name: 'Invited', value: 4, color: '#3B82F6' },
  { name: 'Suspended', value: 2, color: '#EF4444' },
  { name: 'Available Seats', value: 24, color: '#E2E8F0' },
];

export function TenantUsersPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all-users';
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const usersList: UserRow[] = [
    {
      id: 'u1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isYou: true,
      roleLabel: 'Tenant Owner',
      roleBg: 'bg-purple-100',
      roleColor: 'text-purple-700',
      department: 'Executive Management',
      status: 'Active',
      joinedOn: '24 May 2026',
      lastActive: '2 minutes ago',
      twoFactor: true,
      sessions: 2,
    },
    {
      id: 'u2',
      name: 'Priya Mehta',
      email: 'priya.mehta@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Tenant Admin',
      roleBg: 'bg-blue-100',
      roleColor: 'text-blue-700',
      department: 'Operations',
      status: 'Active',
      joinedOn: '24 May 2026',
      lastActive: '15 minutes ago',
      twoFactor: true,
      sessions: 1,
    },
    {
      id: 'u3',
      name: 'Vikram Singh',
      email: 'vikram.singh@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Sales Manager',
      roleBg: 'bg-indigo-100',
      roleColor: 'text-indigo-700',
      department: 'Sales',
      status: 'Active',
      joinedOn: '24 May 2026',
      lastActive: '1 hour ago',
      twoFactor: true,
      sessions: 1,
    },
    {
      id: 'u4',
      name: 'Anita Desai',
      email: 'anita.desai@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Finance Manager',
      roleBg: 'bg-amber-100',
      roleColor: 'text-amber-800',
      department: 'Finance',
      status: 'Active',
      joinedOn: '24 May 2026',
      lastActive: '3 hours ago',
      twoFactor: false,
      sessions: 1,
    },
    {
      id: 'u5',
      name: 'Sandeep Patel',
      email: 'sandeep.patel@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Field Operations Lead',
      roleBg: 'bg-emerald-100',
      roleColor: 'text-emerald-700',
      department: 'Field Operations',
      status: 'Active',
      joinedOn: '24 May 2026',
      lastActive: '5 hours ago',
      twoFactor: true,
      sessions: 2,
    },
    {
      id: 'u6',
      name: 'Neha Kapoor',
      email: 'neha.kapoor@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Team Leader',
      roleBg: 'bg-teal-100',
      roleColor: 'text-teal-700',
      department: 'Field Operations',
      status: 'Active',
      joinedOn: '25 May 2026',
      lastActive: '1 day ago',
      twoFactor: true,
      sessions: 1,
    },
    {
      id: 'u7',
      name: 'Arjun Nair',
      email: 'arjun.nair@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Field Executive',
      roleBg: 'bg-emerald-100',
      roleColor: 'text-emerald-700',
      department: 'Field Operations',
      status: 'Active',
      joinedOn: '25 May 2026',
      lastActive: '2 days ago',
      twoFactor: false,
      sessions: 1,
    },
    {
      id: 'u8',
      name: 'Megha Iyer',
      email: 'megha.iyer@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Data Entry Operator',
      roleBg: 'bg-purple-100',
      roleColor: 'text-purple-700',
      department: 'Operations',
      status: 'Active',
      joinedOn: '25 May 2026',
      lastActive: '2 days ago',
      twoFactor: false,
      sessions: 1,
    },
    {
      id: 'u9',
      name: 'Rohit Verma',
      email: 'rohit.verma@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Support Specialist',
      roleBg: 'bg-indigo-100',
      roleColor: 'text-indigo-700',
      department: 'Customer Support',
      status: 'Suspended',
      joinedOn: '23 May 2026',
      lastActive: '8 days ago',
      twoFactor: false,
      sessions: 0,
    },
    {
      id: 'u10',
      name: 'Karan Malhotra',
      email: 'karan.malhotra@sunrisehealthcare.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Field Executive',
      roleBg: 'bg-emerald-100',
      roleColor: 'text-emerald-700',
      department: 'Field Operations',
      status: 'Invited',
      joinedOn: '25 May 2026',
      lastActive: '—',
      twoFactor: false,
      sessions: 0,
    },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* 1. Header Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <button type="button" onClick={() => navigate('/platform/dashboard')} className="hover:text-[#0D1F3D]">Dashboard</button>
            <span>›</span>
            <button type="button" onClick={() => navigate('/platform/tenants')} className="hover:text-[#0D1F3D]">Tenants</button>
            <span>›</span>
            <button type="button" onClick={() => navigate('/platform/tenants')} className="hover:text-[#0D1F3D]">All Tenants</button>
            <span>›</span>
            <button type="button" onClick={() => navigate(`/platform/tenants/${tenantId}`)} className="hover:text-[#0D1F3D]">Sunrise Healthcare Pvt Ltd</button>
            <span>›</span>
            <span className="font-extrabold text-[#0D1F3D]">Users & Memberships</span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">Tenant Users & Memberships</h1>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-purple-100 text-purple-700">
              <Users className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage users, roles and access for this tenant. Invite, activate or suspend members and control their permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform/tenants/${tenantId}`)} className="gap-1.5 font-bold text-slate-700">
            ← Back to Tenant
          </Button>

          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowMoreActions(!showMoreActions)} className="gap-1.5 font-bold text-slate-700">
              More Actions <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl text-xs font-semibold space-y-1">
                <button type="button" onClick={() => { setShowMoreActions(false); navigate(`/platform/tenants/${tenantId}/modules`); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xs">Manage Modules</button>
                <button type="button" onClick={() => { setShowMoreActions(false); navigate('/platform/audit'); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xs">Audit Logs</button>
              </div>
            )}
          </div>

          <Button variant="accent" size="sm" onClick={() => setShowInviteModal(true)} className="gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <UserPlus className="h-4 w-4" /> Invite User
          </Button>
        </div>
      </div>

      {/* 2. Top Tenant Banner Card (3 Columns) */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-amber-200 bg-amber-50 text-amber-700 font-extrabold text-lg">
            <Building2 className="h-7 w-7 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Sunrise Healthcare Pvt Ltd</h2>
              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Active</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Industry: <strong className="text-slate-800">Pharma & Healthcare</strong> • Plan: <strong className="text-slate-800">Professional (Yearly)</strong>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Tenant Code: <strong className="font-mono text-slate-800">SRHC-TNT</strong> • Users: <strong className="text-slate-800">126 / 150</strong>
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 border-l border-slate-100 pl-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Subscription Status</span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Active</span>
          </div>
          <p className="text-xs font-extrabold text-[#0D1F3D]">24 May 2026 – 23 May 2027</p>
          <p className="text-[11px] text-slate-400 font-medium">29 days elapsed</p>
        </div>

        <div className="lg:col-span-3 border-l border-slate-100 pl-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Auto Renewal</span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Enabled</span>
          </div>
          <p className="text-xs font-extrabold text-[#0D1F3D]">24 Jun 2026</p>
          <p className="text-[11px] font-mono font-bold text-slate-600">₹4,24,786 (Yearly)</p>
        </div>
      </div>

      {/* 3. Main Grid Layout (2/3 Left Main, 1/3 Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT MAIN AREA */}
        <div className="lg:col-span-8 space-y-5">
          {/* Sub-Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab('all-users')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === 'all-users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Users
            </button>
            <button
              type="button"
              onClick={() => setTab('platform-access')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === 'platform-access' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Platform Managed Access (3)
            </button>
            <button
              type="button"
              onClick={() => setTab('pending-invitations')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === 'pending-invitations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending Invitations (4)
            </button>
            <button
              type="button"
              onClick={() => setTab('suspended-users')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === 'suspended-users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Suspended Users (2)
            </button>
            <button
              type="button"
              onClick={() => setTab('access-requests')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                activeTab === 'access-requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Access Requests (1)
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-sm border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs font-medium focus:border-indigo-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="w-32">
              <Select value="All Roles" onChange={() => {}} options={[{ value: 'All Roles', label: 'All Roles' }]} />
            </div>
            <div className="w-32">
              <Select value="All Status" onChange={() => {}} options={[{ value: 'All Status', label: 'All Status' }]} />
            </div>
            <div className="w-36">
              <Select value="All Departments" onChange={() => {}} options={[{ value: 'All Departments', label: 'All Departments' }]} />
            </div>
            <div className="w-28">
              <Select value="2FA: All" onChange={() => {}} options={[{ value: '2FA: All', label: '2FA: All' }]} />
            </div>

            <Button variant="outline" size="sm" className="h-9 text-xs font-bold text-slate-700 gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" /> More Filters
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs font-bold text-slate-700">
              Reset
            </Button>
          </div>

          {/* Summary Stats Strip */}
          <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6 divide-x divide-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold">Total Users</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">126 / 150</span>
                <span className="text-[10px] text-slate-400 block font-medium">84% of seat limit used</span>
              </div>
              <div className="pl-6">
                <span className="text-slate-400 text-[10px] block font-bold">Active Users</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">112</span>
                <span className="text-[10px] text-slate-400 block font-medium">88.9% ⓘ</span>
              </div>
              <div className="pl-6">
                <span className="text-slate-400 text-[10px] block font-bold">Invited</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">4</span>
                <span className="text-[10px] text-slate-400 block font-medium">3.2% ⓘ</span>
              </div>
              <div className="pl-6">
                <span className="text-slate-400 text-[10px] block font-bold">Suspended</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">2</span>
                <span className="text-[10px] text-slate-400 block font-medium">1.6% ⓘ</span>
              </div>
              <div className="pl-6">
                <span className="text-slate-400 text-[10px] block font-bold">Platform Access</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">3</span>
                <span className="text-[10px] text-slate-400 block font-medium">2.4% ⓘ</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-slate-700">Bulk Actions ∨</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-slate-700 gap-1.5"><Download className="h-3.5 w-3.5 text-slate-400" /> Export</Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-3 w-8"><Checkbox checked={false} onChange={() => {}} /></th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role & Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Joined On</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-3">2FA</th>
                  <th className="py-3 px-3">Sessions</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3"><Checkbox checked={false} onChange={() => {}} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#0D1F3D]">{u.name}</span>
                            {u.isYou && <span className="rounded-sm bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700">You</span>}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded-xs px-2 py-0.5 text-[10px] font-extrabold ${u.roleBg} ${u.roleColor}`}>
                        {u.roleLabel}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-medium mt-0.5">{u.department}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        u.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">{u.joinedOn}</td>
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {u.lastActive.includes('ago') ? (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {u.lastActive}
                        </span>
                      ) : (
                        u.lastActive
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {u.twoFactor ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-slate-300" />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {u.sessions > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700"><Lock className="h-3 w-3 text-slate-400" /> {u.sessions}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR AREA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: User Seats & Usage */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">User Seats & Usage</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={seatChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={48}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {seatChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xs font-extrabold text-[#0D1F3D] leading-tight">126 / 150</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">84% Used</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Active Users</span>
                  <span className="font-extrabold text-[#0D1F3D]">112</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-blue-500" /> Invited</span>
                  <span className="font-extrabold text-[#0D1F3D]">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-rose-500" /> Suspended</span>
                  <span className="font-extrabold text-[#0D1F3D]">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-slate-300" /> Available Seats</span>
                  <span className="font-extrabold text-[#0D1F3D]">24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Platform Managed Access */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-1">
                  Platform Managed Access <Info className="h-3.5 w-3.5 text-slate-400" />
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Users from platform with access to this tenant</p>
              </div>
              <button type="button" onClick={() => setTab('platform-access')} className="text-xs font-bold text-indigo-600 hover:underline">View All (3)</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">AS</div>
                  <div>
                    <p className="font-bold text-slate-800">Amit Sharma</p>
                    <p className="text-[10px] text-slate-400">Platform Operations</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">SR</div>
                  <div>
                    <p className="font-bold text-slate-800">Sneha Reddy</p>
                    <p className="text-[10px] text-slate-400">Platform Support</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">RI</div>
                  <div>
                    <p className="font-bold text-slate-800">Rakesh Iyer</p>
                    <p className="text-[10px] text-slate-400">Platform Auditor</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button type="button" onClick={() => setTab('platform-access')} className="text-xs font-bold text-indigo-600 hover:underline">View Access Details</button>
            </div>
          </div>

          {/* Card 3: Role Distribution */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Role Distribution</h3>
              <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" /> Tenant Owner</span><span className="font-extrabold">1</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Tenant Admin</span><span className="font-extrabold">2</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" /> Sales Manager</span><span className="font-extrabold">3</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Finance Manager</span><span className="font-extrabold">2</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Field Operations Lead</span><span className="font-extrabold">1</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-500" /> Team Leader</span><span className="font-extrabold">6</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" /> Field Executive</span><span className="font-extrabold">78</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" /> Others</span><span className="font-extrabold">33</span></div>
            </div>
          </div>

          {/* Card 4: Security Overview */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Security Overview</h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 2FA Enabled Users</span>
                <span className="font-extrabold text-[#0D1F3D]">102 (81%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active Sessions</span>
                <span className="font-extrabold text-[#0D1F3D]">89</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Inactive &gt; 30 Days</span>
                <span className="font-extrabold text-[#0D1F3D]">5</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Suspicious Logins (7 Days)</span>
                <span className="font-extrabold text-[#0D1F3D]">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Invite User to Tenant Workspace</h3>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <Input label="Full Name *" placeholder="Enter full name" />
              <Input label="Email Address *" type="email" placeholder="user@company.com" />
              <Select label="Role *" value="Field Executive" onChange={() => {}} searchable={true} options={[{ value: 'Field Executive', label: 'Field Executive' }, { value: 'Sales Manager', label: 'Sales Manager' }, { value: 'Team Leader', label: 'Team Leader' }]} />
              <Select label="Department / Zone *" value="West Zone" onChange={() => {}} searchable={true} options={[{ value: 'West Zone', label: 'West Zone' }, { value: 'East Zone', label: 'East Zone' }, { value: 'North Zone', label: 'North Zone' }]} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button variant="accent" size="sm" onClick={() => { toast.success('Invitation sent'); setShowInviteModal(false); }}>Send Invitation</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
