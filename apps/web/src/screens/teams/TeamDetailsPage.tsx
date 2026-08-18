import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  UserCheck,
  MoreVertical,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Phone,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  MapPin,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const salesTrendData = [
  { date: '14 May', sales: 620000, target: 1125000 },
  { date: '15 May', sales: 750000, target: 1125000 },
  { date: '16 May', sales: 920000, target: 1125000 },
  { date: '17 May', sales: 880000, target: 1125000 },
  { date: '18 May', sales: 980000, target: 1125000 },
  { date: '19 May', sales: 1150000, target: 1125000 },
  { date: '20 May', sales: 1245000, target: 1125000 },
];

const leadSourceData = [
  { name: 'Website', value: 32, count: 398, color: '#0D1F3D' },
  { name: 'Meta Ads', value: 24, count: 299, color: '#2563EB' },
  { name: 'Cold Calling', value: 18, count: 224, color: '#F59E0B' },
  { name: 'Referral', value: 12, count: 149, color: '#10B981' },
  { name: 'Justdial', value: 8, count: 100, color: '#8B5CF6' },
  { name: 'Others', value: 6, count: 75, color: '#E20613' },
];

const teamMembers = [
  { id: '1', name: 'Rahul Sharma', code: 'FE-1001', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Andheri', leads: 189, deals: 18, sales: 285000, achv: 95, status: 'Active' },
  { id: '2', name: 'Priya Mehta', code: 'FE-1002', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Borivali', leads: 165, deals: 14, sales: 245000, achv: 87, status: 'Active' },
  { id: '3', name: 'Amit Patil', code: 'FE-1003', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Malad', leads: 158, deals: 12, sales: 220000, achv: 82, status: 'Active' },
  { id: '4', name: 'Neha Singh', code: 'FE-1004', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Kandivali', leads: 142, deals: 11, sales: 198000, achv: 79, status: 'Active' },
  { id: '5', name: 'Rohit Gupta', code: 'FE-1005', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Goregaon', leads: 136, deals: 10, sales: 185000, achv: 77, status: 'Active' },
  { id: '6', name: 'Karan Desai', code: 'FE-1006', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Andheri', leads: 128, deals: 9, sales: 165000, achv: 73, status: 'Active' },
  { id: '7', name: 'Sneha Kulkarni', code: 'FE-1007', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Malad', leads: 112, deals: 8, sales: 145000, achv: 69, status: 'Active' },
  { id: '8', name: 'Vishal More', code: 'FE-1008', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', role: 'Field Executive', location: 'Borivali', leads: 115, deals: 7, sales: 132000, achv: 66, status: 'On Leave' },
];

export default function TeamDetailsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* UNIFIED PAGE HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/teams')}
              className="text-slate-500 hover:text-slate-900 transition-colors"
              title="Back to Teams"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Mumbai North Team</h1>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Active
            </span>
            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              MN-001
            </span>
          </div>
          <p className="mt-1 text-sm font-normal text-slate-600">
            Sales & business development for North Mumbai region (Andheri, Borivali, Malad).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Editing team info...')}
            className="flex items-center gap-2 font-semibold text-slate-800 border-slate-300 shadow-none hover:bg-slate-50"
          >
            <Edit className="h-4 w-4 text-slate-700" /> Edit Team
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}/members`)}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Users className="h-4 w-4" /> Manage Members
          </Button>
        </div>
      </div>

      {/* TEAM LEADER & QUICK SUMMARY BAR */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="lg:col-span-6 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:pr-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Team Leader"
            className="h-11 w-11 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="text-xs min-w-0 flex-1">
            <span className="text-xs font-medium text-slate-500 block mb-0.5">Team Leader</span>
            <p className="font-semibold text-slate-900 truncate">
              Sanjay Yadav <span className="text-xs font-mono font-semibold text-slate-600">(TL-1003)</span>
            </p>
            <p className="text-xs font-normal text-slate-600 flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-slate-500" /> +91 98765 43210
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}/leader`)}
            className="!px-2.5 !py-1 text-xs font-semibold text-slate-800 border-slate-300 shrink-0"
          >
            Reassign
          </Button>
        </div>

        <div className="lg:col-span-6 flex items-center justify-between text-xs text-slate-700 px-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-xs font-medium text-slate-500 block">Department</span>
              <span className="font-semibold text-slate-900">Sales</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-xs font-medium text-slate-500 block">Region</span>
              <span className="font-semibold text-slate-900">North Mumbai</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 block">Created On</span>
            <span className="font-semibold text-slate-900">12 Apr 2024</span>
          </div>
        </div>
      </div>

      {/* 4 ESSENTIAL KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Team Members"
          value="8 Staff"
          subValue="7 Active Field Execs"
          icon={Users}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-800"
        />
        <KpiCard
          title="Monthly Target"
          value="₹15,00,000"
          subValue="83% Target Achieved"
          icon={Target}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Total Sales Achieved"
          value="₹12,45,000"
          change="+22%"
          changeType="positive"
          timeframe="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Deals Closed"
          value="89 Deals"
          subValue="1,245 Total Leads"
          icon={CheckCircle2}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
      </div>

      {/* RELEVANT CORE NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {[
          'Overview',
          'Team Members',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* Sales Performance Trend Area Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sales Performance Trend</h3>
                  <p className="text-xs text-slate-600 font-normal">Monthly revenue progression</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-blue-700 font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Team Sales</span>
                  <span className="flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Target</span>
                </div>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="teamSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                    <Tooltip
                      position={{ y: -15 }}
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                      labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                      formatter={(val: any, name: any) => [`₹${Number(val || 0).toLocaleString()}`, name]}
                    />
                    <Area type="monotone" dataKey="sales" name="Team Sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#teamSalesGrad)" />
                    <Area type="monotone" dataKey="target" name="Target" stroke="#94A3B8" strokeWidth={2} strokeDasharray="3 3" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads by Source Donut Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-900">Leads by Source</h3>
              <div className="flex flex-col items-center">
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        position={{ y: -15 }}
                        wrapperStyle={{ zIndex: 100 }}
                        contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                        labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                        formatter={(val: any) => [`${val}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-slate-900">1,245</span>
                    <span className="text-xs font-normal text-slate-600">Total Leads</span>
                  </div>
                </div>

                <div className="w-full space-y-1 text-xs font-medium text-slate-700 mt-1">
                  {leadSourceData.map((s) => (
                    <div key={s.name} className="flex justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="font-semibold text-slate-900">{s.value}% <span className="text-slate-500 font-normal">({s.count})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deal Stage Funnel */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-900">Deal Stage Funnel</h3>
              <div className="space-y-2 pt-1">
                {[
                  { stage: 'New Leads', count: '1,245', pct: '100%', color: 'bg-slate-900' },
                  { stage: 'Contacted', count: '892', pct: '72%', color: 'bg-blue-600' },
                  { stage: 'Qualified', count: '546', pct: '44%', color: 'bg-teal-600' },
                  { stage: 'Proposal', count: '312', pct: '25%', color: 'bg-amber-500' },
                  { stage: 'Negotiation', count: '156', pct: '13%', color: 'bg-purple-600' },
                  { stage: 'Closed Won', count: '89', pct: '7%', color: 'bg-emerald-600' },
                ].map((f) => (
                  <div key={f.stage} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{f.stage}</span>
                      <span>{f.count} ({f.pct})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div className={`h-full ${f.color} rounded-full`} style={{ width: f.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members Table & Leaderboard Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Team Members Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-8 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">Team Members Performance</h3>

                  <div className="flex items-center gap-3">
                    <div className="relative w-56">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="font-semibold text-slate-800 border-slate-300 flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="font-semibold text-slate-800 border-slate-300 flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-semibold text-slate-800">
                        <th className="px-4 py-3 w-8 text-center whitespace-nowrap">#</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Member Name</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[130px]">Role</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Location</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[90px]">Active Leads</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[90px]">Deals Won</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap min-w-[140px]">Sales (This Month)</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[100px]">Target Achv.</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[110px]">Status</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap min-w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredMembers.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-semibold text-center whitespace-nowrap">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <img src={m.avatar} alt={m.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-900 whitespace-nowrap">{m.name}</p>
                                <p className="text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">{m.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-normal whitespace-nowrap">{m.role}</td>
                          <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{m.location}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">{m.leads}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">{m.deals}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 text-right whitespace-nowrap">₹{m.sales.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`font-semibold ${m.achv >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {m.achv}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap ${
                              m.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : m.status === 'On Leave'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button className="text-slate-600 hover:text-slate-900 p-1 border border-slate-200 rounded-md bg-white shadow-xs">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
                <span className="text-slate-600 font-normal">Showing 1 to {filteredMembers.length} of {teamMembers.length} members</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}/members`)}
                  className="font-semibold text-slate-800 border-slate-300 flex items-center gap-1"
                >
                  View All Members <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Right: Top Performers */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Top Performers</h3>
                  <span className="text-xs font-normal text-slate-600">This Month</span>
                </div>

                <div className="space-y-3">
                  {filteredMembers.slice(0, 5).map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200">
                          {idx + 1}
                        </span>
                        <img src={m.avatar} alt={m.name} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-semibold text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-600 font-normal">{m.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">₹{m.sales.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-emerald-700">{m.achv}% Target</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEAM MEMBERS */}
      {activeTab === 'Team Members' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Team Roster</h3>
              <p className="text-xs text-slate-600">All field executives assigned to Mumbai North Team</p>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}/members`)}
              className="flex items-center gap-1.5 font-semibold"
            >
              <Plus className="h-4 w-4" /> Add Executive
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-600 font-mono">{m.code}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t border-slate-200 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium">{m.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sales Achieved:</span>
                    <span className="font-semibold text-slate-900">₹{m.sales.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
