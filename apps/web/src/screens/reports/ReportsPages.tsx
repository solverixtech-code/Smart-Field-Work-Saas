import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Search,
  ChevronRight,
  Plus,
  Eye,
  MoreVertical,
  Clock,
  Award,
  Layers,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CreditCard,
  Building2,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { Button, DataTable, Input, Select, type ColumnDef } from '../../components/ui';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { KpiCard } from '../../components/dashboard/KpiCard';

type ReportKind = 'dashboard' | 'sales' | 'executives' | 'visits' | 'territories' | 'conversions' | 'revenue' | 'payments' | 'attendance' | 'incentives' | 'categories';

const executiveSelectOptions = [
  {
    value: 'all_executives',
    label: 'All Field Executives',
    sublabel: '326 Active Field Sales Reps',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  },
  {
    value: 'rahul_verma',
    label: 'Rahul Verma',
    sublabel: 'FE-1001 • Mumbai North Zone',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    value: 'priya_mehta',
    label: 'Priya Mehta',
    sublabel: 'FE-1002 • Western Suburbs Zone',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    value: 'sanjay_yadav',
    label: 'Sanjay Yadav',
    sublabel: 'TL-1003 • Eastern Suburbs (Team Leader)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    value: 'karan_patil',
    label: 'Karan Patil',
    sublabel: 'FE-1009 • Thane Team',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

const territorySelectOptions = [
  { value: 'all', label: 'All Territories', sublabel: '14 Active Zones' },
  { value: 'mumbai_west', label: 'Mumbai West Zone', sublabel: '24 Executives • ₹14.8L Sales' },
  { value: 'mumbai_north', label: 'Mumbai North Zone', sublabel: '18 Executives • ₹11.2L Sales' },
  { value: 'pune_central', label: 'Pune Central Zone', sublabel: '12 Executives • ₹8.4L Sales' },
  { value: 'thane_team', label: 'Thane Sales Team', sublabel: '15 Executives • ₹6.9L Sales' },
];

function ReportHeader({ title, description, kind }: { title: string; description: string; kind: ReportKind }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-3 font-sans">
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <button onClick={() => navigate('/admin/reports')} className="hover:text-[#0D1F3D] cursor-pointer">
            Reports & Analytics
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#0D1F3D] font-bold">{title}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">{title}</h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DateRangePicker />
        <Button variant="outline" size="sm" onClick={() => toast.success(`${title} downloaded as PDF`)} className="gap-1.5 font-bold shadow-xs">
          <Download className="h-3.5 w-3.5" /> Export PDF
        </Button>
        <Button variant="accent" size="sm" onClick={() => toast.success(`${title} downloaded as Excel CSV`)} className="gap-1.5 font-bold shadow-xs">
          <Download className="h-3.5 w-3.5" /> Export Excel
        </Button>
      </div>
    </div>
  );
}

function ReportFilterBar({ searchableExecutive = true }: { searchableExecutive?: boolean }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs space-y-3 font-sans">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value="all"
          onChange={() => {}}
          options={territorySelectOptions}
          searchable={true}
          placeholder="Filter Territory / Zone..."
        />

        {searchableExecutive && (
          <Select
            value="all_executives"
            onChange={() => {}}
            options={executiveSelectOptions}
            searchable={true}
            placeholder="Select Executive..."
          />
        )}

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Performance Tiers' },
            { value: 'top', label: 'Top Performers (>90%)' },
            { value: 'average', label: 'Average (70-90%)' },
            { value: 'underperforming', label: 'Needs Improvement (<70%)' },
          ]}
          searchable={true}
          placeholder="Filter Performance Tier..."
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Payment Modes' },
            { value: 'upi', label: 'UPI / QR Code' },
            { value: 'razorpay', label: 'Razorpay Gateway' },
            { value: 'netbanking', label: 'Net Banking' },
            { value: 'cash', label: 'Cash on Delivery' },
          ]}
          searchable={true}
          placeholder="Filter Payment Method..."
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-xs font-semibold text-slate-500">Showing aggregated report data for selected range.</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Report filters reset')} className="font-bold">
            Reset Filters
          </Button>
          <Button variant="accent" size="sm" onClick={() => toast.success('Report updated')} className="font-bold shadow-xs">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

// SCREEN 168: REPORTS DASHBOARD (/admin/reports)
export function ReportsDashboardPage() {
  const navigate = useNavigate();

  const reportCards = [
    { title: 'Daily Sales Report', desc: 'Detailed breakdown of daily revenues, sales orders and top closing executives.', path: '/admin/reports/daily-sales', icon: DollarSign, badge: 'Daily' },
    { title: 'Executive Performance Report', desc: 'Productivity scores, visit targets, closures and ranking of all field reps.', path: '/admin/reports/executives', icon: Users, badge: 'Team' },
    { title: 'Field Visit Report', desc: 'GPS-verified field check-ins, duration logs, and visit outcome completion rate.', path: '/admin/reports/visits', icon: MapPin, badge: 'Visits' },
    { title: 'Territory & Zone Report', desc: 'Regional sales penetration, territory target vs actuals and coverage stats.', path: '/admin/reports/territories', icon: Layers, badge: 'Regional' },
    { title: 'Lead Conversion Report', desc: 'Funnel conversion rates from lead capture to final demo and sale closure.', path: '/admin/reports/conversions', icon: TrendingUp, badge: 'Funnel' },
    { title: 'Revenue & Growth Report', desc: 'Monthly gross sales, recurring revenues, discounts and net profit margins.', path: '/admin/reports/revenue', icon: BarChart3, badge: 'Finance' },
    { title: 'Payment Collection Report', desc: 'UPI, Gateway and cash collection logs, pending dues aging and fees.', path: '/admin/reports/payments', icon: CreditCard, badge: 'Ledger' },
    { title: 'Executive Attendance Report', desc: 'Muster roll, punctuality scores, late check-ins and geo-fence audit logs.', path: '/admin/reports/attendance', icon: CalendarCheck, badge: 'HR' },
    { title: 'Incentive & Payout Report', desc: 'Earned commission tiers, target slabs, and payout approval statuses.', path: '/admin/reports/incentives', icon: Award, badge: 'Payouts' },
    { title: 'Category ROI Report', desc: 'Category-wise margin analysis, travel spend ROI and growth opportunities.', path: '/admin/reports/categories', icon: PieChart, badge: 'ROI' },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="dashboard" title="Reports & Analytics Dashboard" description="Centralized reporting suite for field sales, revenues, territory performance and HR muster." />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Sales Revenue"
          value="₹42,85,400"
          subValue="↑ 18.4% vs last month"
          icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Visits Completed"
          value="1,842"
          subValue="↑ 12.1% (97.6% Verified)"
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Lead Conversion Rate"
          value="32.4%"
          subValue="↑ 4.2% vs last month"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Revenue Collected"
          value="₹38,20,000"
          subValue="89.1% Settled"
          icon={CreditCard}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Active Field Reps"
          value="128"
          subValue="94.8% Present Today"
          icon={Users}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.path} className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wide">
                    {r.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0D1F3D]">{r.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => navigate(r.path)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  View Full Report <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toast.success(`Downloading ${r.title}`)}
                  className="p-1.5 text-slate-400 hover:text-[#0D1F3D] cursor-pointer"
                  title="Quick Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SCREEN 169: DAILY SALES REPORT (/admin/reports/daily-sales)
export function DailySalesReportPage() {
  const salesRows = [
    { id: 'TXN-901', customer: 'Apex Electronics', category: 'Retail Tech', exec: 'Rahul Verma', mode: 'UPI QR', amount: '₹48,500', time: '10:30 AM', status: 'Settled' },
    { id: 'TXN-902', customer: 'Metro Supermarket', category: 'FMCG Supply', exec: 'Priya Mehta', mode: 'Bank Transfer', amount: '₹1,24,000', time: '11:15 AM', status: 'Settled' },
    { id: 'TXN-903', customer: 'Vanguard Pharma', category: 'Healthcare', exec: 'Sanjay Yadav', mode: 'Razorpay', amount: '₹85,000', time: '01:45 PM', status: 'Settled' },
    { id: 'TXN-904', customer: 'Karan Hardware', category: 'Construction', exec: 'Karan Patil', mode: 'UPI QR', amount: '₹32,400', time: '03:20 PM', status: 'Settled' },
  ];

  const columns: ColumnDef<typeof salesRows[0]>[] = [
    { header: 'Txn ID', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.id}</span> },
    { header: 'Customer / Merchant', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.customer}</span> },
    { header: 'Category', cell: (r) => <span className="text-xs font-semibold text-slate-600">{r.category}</span> },
    { header: 'Sales Executive', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.exec}</span> },
    { header: 'Payment Mode', cell: (r) => <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 rounded-sm">{r.mode}</span> },
    { header: 'Amount', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.amount}</span> },
    { header: 'Time', cell: (r) => <span className="text-xs font-semibold text-slate-500">{r.time}</span> },
    { header: 'Status', cell: () => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold rounded-sm">● Settled</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="sales" title="Daily Sales Report" description="Track real-time sales transactions, daily closures and payment modes." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Daily Sales Revenue"
          value="₹1,48,500"
          subValue="Across 4 active zones"
          icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Orders / Closures"
          value="42 Orders"
          subValue="Daily deals won"
          icon={CheckCircle2}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Avg Order Value"
          value="₹3,535"
          subValue="Per transaction"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Top Performer Today"
          value="Rahul Verma"
          subValue="6 Deals closed"
          icon={Award}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Highest Category"
          value="Retail Tech"
          subValue="₹64,000 Revenue"
          icon={Layers}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={salesRows} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 170: EXECUTIVE REPORT (/admin/reports/executives)
export function ExecutiveReportPage() {
  const execRows = [
    { id: 'FE-1001', name: 'Rahul Verma', zone: 'Mumbai North Zone', leads: 42, visits: 38, demos: 18, sales: 12, revenue: '₹3,45,000', score: '94.2%' },
    { id: 'FE-1002', name: 'Priya Mehta', zone: 'Western Suburbs Zone', leads: 38, visits: 35, demos: 15, sales: 10, revenue: '₹2,90,000', score: '91.0%' },
    { id: 'FE-1003', name: 'Sanjay Yadav', zone: 'Eastern Suburbs Zone', leads: 35, visits: 30, demos: 12, sales: 8, revenue: '₹2,20,000', score: '86.5%' },
    { id: 'FE-1009', name: 'Karan Patil', zone: 'Thane Sales Team', leads: 28, visits: 24, demos: 9, sales: 5, revenue: '₹1,45,000', score: '78.2%' },
  ];

  const columns: ColumnDef<typeof execRows[0]>[] = [
    { header: 'Executive Name', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.name}</span> },
    { header: 'Employee Code', cell: (r) => <span className="font-mono text-xs font-semibold text-slate-600">{r.id}</span> },
    { header: 'Territory Zone', cell: (r) => <span className="text-xs font-semibold text-slate-700">{r.zone}</span> },
    { header: 'Leads', cell: (r) => <span className="font-mono text-xs font-bold">{r.leads}</span> },
    { header: 'Visits', cell: (r) => <span className="font-mono text-xs font-bold">{r.visits}</span> },
    { header: 'Demos', cell: (r) => <span className="font-mono text-xs font-bold">{r.demos}</span> },
    { header: 'Deals Closed', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.sales}</span> },
    { header: 'Total Revenue', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.revenue}</span> },
    { header: 'Productivity Score', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.score}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="executives" title="Executive Performance Report" description="Productivity ranking, lead conversions, and revenue contribution per field executive." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Active Field Reps"
          value="128 Reps"
          subValue="94.8% Present"
          icon={Users}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Avg Productivity"
          value="88.4%"
          subValue="Target > 85%"
          icon={TrendingUp}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Total Visits"
          value="842 Visits"
          subValue="This month"
          icon={MapPin}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Demos Logged"
          value="324 Demos"
          subValue="47.6% Converted"
          icon={Zap}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Top Sales Rep"
          value="Rahul Verma"
          subValue="₹3.45L Generated"
          icon={Award}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={execRows} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 171: VISIT REPORT (/admin/reports/visits)
export function VisitReportPage() {
  const visitRows = [
    { id: 'VST-5001', exec: 'Rahul Verma', client: 'Apex Electronics', time: '10:15 AM', duration: '28 mins', geo: 'GPS Verified (12m)', outcome: 'Demo Conducted' },
    { id: 'VST-5002', exec: 'Priya Mehta', client: 'Metro Supermarket', time: '11:30 AM', duration: '45 mins', geo: 'GPS Verified (8m)', outcome: 'Sale Closed' },
    { id: 'VST-5003', exec: 'Sanjay Yadav', client: 'Vanguard Pharma', time: '02:00 PM', duration: '18 mins', geo: 'GPS Verified (15m)', outcome: 'Follow-up Scheduled' },
  ];

  const columns: ColumnDef<typeof visitRows[0]>[] = [
    { header: 'Visit ID', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.id}</span> },
    { header: 'Field Executive', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.exec}</span> },
    { header: 'Merchant / Client', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.client}</span> },
    { header: 'Check-In Time', cell: (r) => <span className="text-xs font-semibold text-slate-600">{r.time}</span> },
    { header: 'Duration', cell: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.duration}</span> },
    { header: 'Geo Verification', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold rounded-sm">✓ {r.geo}</span> },
    { header: 'Outcome', cell: (r) => <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.outcome}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="visits" title="Field Visit Report" description="GPS audit logs, check-in accuracy and field visit completion metrics." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Visits"
          value="1,842"
          subValue="↑ 12.1% MTD"
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="GPS Verified %"
          value="98.2%"
          subValue="Within 50m radius"
          icon={ShieldCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Avg Meeting Time"
          value="32 Mins"
          subValue="Productive duration"
          icon={Clock}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Closures on Visit"
          value="24.6%"
          subValue="Instant conversion"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Out of Bounds"
          value="1.8%"
          subValue="Flagged check-ins"
          icon={AlertCircle}
          iconBgColor="bg-rose-500/10"
          iconTextColor="text-rose-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={visitRows} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 172: TERRITORY REPORT (/admin/reports/territories)
export function TerritoryReportPage() {
  const territoryRows = [
    { name: 'Mumbai West Zone', lead: 'Amit Verma', execs: 24, leads: 480, visits: 412, revenue: '₹14,80,000', target: '98.5%', rating: 'High Growth' },
    { name: 'Mumbai North Zone', lead: 'Rahul Kumar', execs: 18, leads: 360, visits: 310, revenue: '₹11,20,000', target: '92.0%', rating: 'Stable' },
    { name: 'Pune Central Zone', lead: 'Priya Singh', execs: 12, leads: 240, visits: 198, revenue: '₹8,40,000', target: '88.4%', rating: 'Stable' },
  ];

  const columns: ColumnDef<typeof territoryRows[0]>[] = [
    { header: 'Territory Name', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.name}</span> },
    { header: 'Zone Leader', cell: (r) => <span className="font-extrabold text-slate-700 text-xs">{r.lead}</span> },
    { header: 'Active Reps', cell: (r) => <span className="font-mono text-xs font-bold">{r.execs}</span> },
    { header: 'Total Leads', cell: (r) => <span className="font-mono text-xs font-bold">{r.leads}</span> },
    { header: 'Visits Made', cell: (r) => <span className="font-mono text-xs font-bold">{r.visits}</span> },
    { header: 'Total Revenue', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.revenue}</span> },
    { header: 'Target Achieved', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.target}</span> },
    { header: 'Penetration Rating', cell: (r) => <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.rating}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="territories" title="Territory & Zone Report" description="Regional market penetration, territory targets and sales coverage analytics." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Active Territories"
          value="14 Zones"
          subValue="100% Operational"
          icon={Layers}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Top Zone"
          value="Mumbai West"
          subValue="₹14.8L Revenue"
          icon={Award}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Avg Target Achievement"
          value="93.2%"
          subValue="Across all zones"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Total Field Coverage"
          value="88.6%"
          subValue="Market penetration"
          icon={MapPin}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="High Growth Areas"
          value="4 Zones"
          subValue=">20% MoM growth"
          icon={Zap}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={territoryRows} keyExtractor={(r) => r.name} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 173: LEAD CONVERSION REPORT (/admin/reports/conversions)
export function LeadConversionReportPage() {
  const conversionRows = [
    { source: 'Inbound Web Form', leads: 1240, qualified: 890, demos: 512, closed: 348, rate: '28.0%', avgCycle: '12 Days' },
    { source: 'Field Executive Sourced', leads: 1150, qualified: 920, demos: 640, closed: 420, rate: '36.5%', avgCycle: '6 Days' },
    { source: 'Referral Campaign', leads: 480, qualified: 380, demos: 290, closed: 210, rate: '43.7%', avgCycle: '4 Days' },
  ];

  const columns: ColumnDef<typeof conversionRows[0]>[] = [
    { header: 'Lead Source', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.source}</span> },
    { header: 'Total Leads Captured', cell: (r) => <span className="font-mono text-xs font-bold">{r.leads}</span> },
    { header: 'Qualified Leads', cell: (r) => <span className="font-mono text-xs font-bold">{r.qualified}</span> },
    { header: 'Demos Conducted', cell: (r) => <span className="font-mono text-xs font-bold">{r.demos}</span> },
    { header: 'Deals Won', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.closed}</span> },
    { header: 'Conversion Rate %', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.rate}</span> },
    { header: 'Avg Sales Cycle', cell: (r) => <span className="text-xs font-semibold text-slate-600">{r.avgCycle}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="conversions" title="Lead Conversion Report" description="Full sales funnel conversion metrics from lead capture to final deal closure." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Leads"
          value="2,870"
          subValue="All channels"
          icon={Users}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Qualified %"
          value="76.3%"
          subValue="2,190 Qualified"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Demos Scheduled"
          value="1,442"
          subValue="65.8% Demo rate"
          icon={Zap}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Deals Won"
          value="978"
          subValue="Closed accounts"
          icon={Award}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Blended Win Rate"
          value="34.1%"
          subValue="Lead to sale"
          icon={TrendingUp}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={conversionRows} keyExtractor={(r) => r.source} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 174: REVENUE REPORT (/admin/reports/revenue)
export function RevenueReportPage() {
  const revenueRows = [
    { period: 'May 2025 (MTD)', gross: '₹42,85,400', discounts: '₹4,28,540', net: '₹38,56,860', recurring: '₹18,40,000', growth: '+14.8%' },
    { period: 'April 2025', gross: '₹37,32,000', discounts: '₹3,73,200', net: '₹33,58,800', recurring: '₹16,10,000', growth: '+11.2%' },
    { period: 'March 2025', gross: '₹33,55,000', discounts: '₹3,35,500', net: '₹30,19,500', recurring: '₹14,50,000', growth: '+9.4%' },
  ];

  const columns: ColumnDef<typeof revenueRows[0]>[] = [
    { header: 'Period', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.period}</span> },
    { header: 'Gross Revenue', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.gross}</span> },
    { header: 'Discounts / Refunds', cell: (r) => <span className="font-mono text-xs font-semibold text-rose-600">{r.discounts}</span> },
    { header: 'Net Revenue', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.net}</span> },
    { header: 'Recurring Subscriptions', cell: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.recurring}</span> },
    { header: 'MoM Growth %', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.growth}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="revenue" title="Revenue & Growth Report" description="Monthly revenue growth, gross vs net profits, recurring subscriptions and margins." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Gross Sales"
          value="₹42,85,400"
          subValue="↑ 14.8% MoM"
          icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Recurring MRR"
          value="₹18,40,000"
          subValue="42.9% of revenue"
          icon={BarChart3}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Net Profit Margin"
          value="28.6%"
          subValue="After field costs"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Avg Contract Value"
          value="₹32,400"
          subValue="Per merchant annual"
          icon={Building2}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Refund Rate"
          value="0.6%"
          subValue="Within SLA"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={revenueRows} keyExtractor={(r) => r.period} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 175: PAYMENT REPORT (/admin/reports/payments)
export function PaymentReportPage() {
  const paymentRows = [
    { ref: 'PAY-88201', client: 'Apex Electronics', exec: 'Rahul Verma', method: 'UPI QR', amount: '₹48,500', fee: '₹0.00', net: '₹48,500', status: 'Settled' },
    { ref: 'PAY-88202', client: 'Metro Supermarket', exec: 'Priya Mehta', method: 'Razorpay Gateway', amount: '₹1,24,000', fee: '₹2,480.00', net: '₹1,21,520', status: 'Settled' },
    { ref: 'PAY-88203', client: 'Vanguard Pharma', exec: 'Sanjay Yadav', method: 'Net Banking', amount: '₹85,000', fee: '₹1,700.00', net: '₹83,300', status: 'Settled' },
  ];

  const columns: ColumnDef<typeof paymentRows[0]>[] = [
    { header: 'Ref ID', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.ref}</span> },
    { header: 'Client / Business', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.client}</span> },
    { header: 'Executive', cell: (r) => <span className="font-extrabold text-slate-700 text-xs">{r.exec}</span> },
    { header: 'Payment Method', cell: (r) => <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 rounded-sm">{r.method}</span> },
    { header: 'Amount Collected', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.amount}</span> },
    { header: 'Gateway Fee', cell: (r) => <span className="font-mono text-xs text-slate-500">{r.fee}</span> },
    { header: 'Net Settled Amount', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.net}</span> },
    { header: 'Status', cell: () => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold rounded-sm">● Settled</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="payments" title="Payment Collection Report" description="Payment gateway collection ledger, settlement logs, and gateway fee breakdown." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Collections"
          value="₹38,20,000"
          subValue="89.1% of orders"
          icon={CreditCard}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="UPI / QR Payments"
          value="₹22,40,000"
          subValue="58.6% of volume"
          icon={Zap}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Gateway Settlements"
          value="₹11,20,000"
          subValue="Razorpay processed"
          icon={DollarSign}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Cash Collected"
          value="₹4,60,000"
          subValue="Verified in field"
          icon={Building2}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Settlement Ratio"
          value="97.4%"
          subValue="T+1 settlement"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={paymentRows} keyExtractor={(r) => r.ref} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 177: ATTENDANCE REPORT (/admin/reports/attendance)
export function AttendanceReportPage() {
  const attendanceRows = [
    { code: 'FE-1001', name: 'Rahul Verma', territory: 'Mumbai North Zone', present: 22, absent: 0, late: 1, hours: '192.5 hrs', score: '98.5%' },
    { code: 'FE-1002', name: 'Priya Mehta', territory: 'Western Suburbs Zone', present: 21, absent: 1, late: 0, hours: '184.0 hrs', score: '95.4%' },
    { code: 'FE-1003', name: 'Sanjay Yadav', territory: 'Eastern Suburbs Zone', present: 20, absent: 2, late: 2, hours: '176.0 hrs', score: '90.9%' },
  ];

  const columns: ColumnDef<typeof attendanceRows[0]>[] = [
    { header: 'Executive Name', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.name}</span> },
    { header: 'Employee Code', cell: (r) => <span className="font-mono text-xs font-semibold text-slate-600">{r.code}</span> },
    { header: 'Territory', cell: (r) => <span className="text-xs font-semibold text-slate-700">{r.territory}</span> },
    { header: 'Days Present', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.present} Days</span> },
    { header: 'Days Absent', cell: (r) => <span className="font-mono text-xs text-rose-600 font-bold">{r.absent} Days</span> },
    { header: 'Late Count', cell: (r) => <span className="font-mono text-xs text-amber-600 font-bold">{r.late}</span> },
    { header: 'Worked Hours', cell: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.hours}</span> },
    { header: 'Punctuality Score', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.score}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="attendance" title="Executive Attendance Report" description="Monthly muster roll, punctuality scores, working hours and attendance logs." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Active Muster"
          value="128 Reps"
          subValue="94.8% Attendance"
          icon={CalendarCheck}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="On-Time Rate"
          value="94.2%"
          subValue="Check-in < 9:30 AM"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Late Arrivals"
          value="4.8%"
          subValue="6 Reps today"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Avg Daily Hours"
          value="8h 12m"
          subValue="Productive field time"
          icon={TrendingUp}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Geo-fence Accuracy"
          value="99.1%"
          subValue="Valid site logins"
          icon={ShieldCheck}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={attendanceRows} keyExtractor={(r) => r.code} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 178: INCENTIVE REPORT (/admin/reports/incentives)
export function IncentiveReportPage() {
  const incentiveRows = [
    { code: 'FE-1001', name: 'Rahul Verma', target: '₹3,00,000', sales: '₹3,45,000', tier: 'Tier 1 (12%)', earned: '₹41,400', status: 'Approved & Paid' },
    { code: 'FE-1002', name: 'Priya Mehta', target: '₹2,50,000', sales: '₹2,90,000', tier: 'Tier 1 (12%)', earned: '₹34,800', status: 'Approved & Paid' },
    { code: 'FE-1003', name: 'Sanjay Yadav', target: '₹2,00,000', sales: '₹2,20,000', tier: 'Tier 2 (10%)', earned: '₹22,000', status: 'Pending Approval' },
  ];

  const columns: ColumnDef<typeof incentiveRows[0]>[] = [
    { header: 'Executive Name', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.name}</span> },
    { header: 'Employee Code', cell: (r) => <span className="font-mono text-xs font-semibold text-slate-600">{r.code}</span> },
    { header: 'Sales Target', cell: (r) => <span className="font-mono text-xs font-bold text-slate-700">{r.target}</span> },
    { header: 'Achieved Sales', cell: (r) => <span className="font-mono font-extrabold text-emerald-700 text-xs">{r.sales}</span> },
    { header: 'Commission Slab', cell: (r) => <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.tier}</span> },
    { header: 'Earned Incentive', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.earned}</span> },
    { header: 'Payout Status', cell: (r) => <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-sm border ${r.status.includes('Paid') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{r.status}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="incentives" title="Incentive & Payout Report" description="Monthly target achievement, commission tier calculations and payout logs." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Pool"
          value="₹4,20,000"
          subValue="Accrued incentives"
          icon={Award}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Eligible Reps"
          value="84 Reps"
          subValue="Met quota target"
          icon={Users}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Avg Payout"
          value="₹5,000"
          subValue="Per qualifying rep"
          icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Top Earner"
          value="₹41,400"
          subValue="Rahul Verma (115%)"
          icon={TrendingUp}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Disbursement"
          value="82% Paid"
          subValue="Remaining pending"
          icon={CheckCircle2}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={incentiveRows} keyExtractor={(r) => r.code} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 179: CATEGORY ROI REPORT (/admin/reports/categories)
export function CategoryRoiReportPage() {
  const categoryRows = [
    { name: 'Retail Technology & POS', execs: 48, volume: '4,280 Units', revenue: '₹18,40,000', margin: '38.5%', spend: '₹1,24,000', roi: '14.8x (High ROI)' },
    { name: 'FMCG Wholesale Supply', execs: 36, volume: '6,120 Units', revenue: '₹14,20,000', margin: '24.2%', spend: '₹98,000', roi: '14.5x (High ROI)' },
    { name: 'Healthcare & Pharma', execs: 24, volume: '2,450 Units', revenue: '₹10,25,000', margin: '31.0%', spend: '₹85,000', roi: '12.0x (Good ROI)' },
  ];

  const columns: ColumnDef<typeof categoryRows[0]>[] = [
    { header: 'Category Name', cell: (r) => <span className="font-extrabold text-[#0D1F3D] text-xs">{r.name}</span> },
    { header: 'Assigned Field Reps', cell: (r) => <span className="font-mono text-xs font-bold">{r.execs}</span> },
    { header: 'Sales Volume', cell: (r) => <span className="font-mono text-xs font-bold">{r.volume}</span> },
    { header: 'Total Revenue', cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{r.revenue}</span> },
    { header: 'Gross Margin %', cell: (r) => <span className="font-mono text-xs font-bold text-emerald-700">{r.margin}</span> },
    { header: 'Marketing & Travel Spend', cell: (r) => <span className="font-mono text-xs text-rose-600 font-bold">{r.spend}</span> },
    { header: 'Net ROI Multiplier', cell: (r) => <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-extrabold rounded-sm">{r.roi}</span> },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <ReportHeader kind="categories" title="Category ROI Report" description="Category gross margins, marketing/travel expenditure and net ROI multiplier analysis." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Top Category"
          value="Retail Tech"
          subValue="₹18.4L Gross Revenue"
          icon={Layers}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Blended ROI"
          value="13.8x"
          subValue="Revenue / Travel Spend"
          icon={TrendingUp}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Average Margin"
          value="31.2%"
          subValue="Across 3 sectors"
          icon={DollarSign}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Total Units Sold"
          value="12,850"
          subValue="Hardware & Subscriptions"
          icon={Building2}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Marketing Spend"
          value="₹3,07,000"
          subValue="Field allowances"
          icon={CreditCard}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      <ReportFilterBar />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={categoryRows} keyExtractor={(r) => r.name} density="compact" />
      </div>
    </div>
  );
}
