import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Eye,
  Flag,
  Gift,
  Megaphone,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Smartphone,
  Users,
  Volume2,
  XCircle,
  Filter,
  Search,
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Layers,
  MessageSquare,
  Mail,
  Info,
  Radio,
  FileText
} from 'lucide-react';
import { Button, Checkbox, DataTable, Input, Select, type ColumnDef } from '../../components/ui';

type PageKind = 'center' | 'create' | 'push' | 'alerts' | 'templates';
type NoticeType = 'Announcement' | 'Alert' | 'Reminder' | 'Promotion' | 'Update' | 'Other';

interface NotificationRow {
  id: string;
  title: string;
  description: string;
  type: NoticeType;
  audience: string;
  channel: string;
  status: 'Sent' | 'Scheduled' | 'Failed' | 'Active' | 'Disabled' | 'Pending' | 'Acknowledged' | 'Resolved';
  created: string;
  delivery: string;
  icon: React.ElementType;
  tone: string;
}

const notificationRows: NotificationRow[] = [
  { id: 'NOT-1001', title: 'Plan Renewal Reminder', description: 'Hi {{name}}, your plan will expire on {{date}}...', type: 'Reminder', audience: 'All Customers (2,145 Users)', channel: 'WhatsApp · Email', status: 'Sent', created: '22 May 2025 · 10:30 AM', delivery: '1,892 (88.2%)', icon: Send, tone: 'rose' },
  { id: 'NOT-1002', title: 'Discount Offer – 20% Off', description: 'Exclusive offer for your active plan...', type: 'Promotion', audience: 'Active Customers (1,532 Users)', channel: 'WhatsApp · Email', status: 'Sent', created: '21 May 2025 · 04:15 PM', delivery: '1,401 (91.5%)', icon: Gift, tone: 'emerald' },
  { id: 'NOT-1003', title: 'Field Visit Assigned', description: 'You have been assigned a new visit today...', type: 'Alert', audience: 'Field Executives (320 Users)', channel: 'In-App · WhatsApp', status: 'Sent', created: '21 May 2025 · 11:00 AM', delivery: '312 (97.5%)', icon: CalendarClock, tone: 'blue' },
  { id: 'NOT-1004', title: 'New Feature Released', description: 'We are excited to introduce a new feature...', type: 'Announcement', audience: 'All Customers (2,145 Users)', channel: 'Email · In-App', status: 'Sent', created: '20 May 2025 · 03:30 PM', delivery: '1,723 (80.3%)', icon: Megaphone, tone: 'violet' },
  { id: 'NOT-1005', title: 'Payment Failed Alert', description: 'We could not process your payment for this plan...', type: 'Alert', audience: 'Customers (85 Users)', channel: 'Email · WhatsApp', status: 'Failed', created: '20 May 2025 · 09:20 AM', delivery: '12 (14.1%)', icon: AlertCircle, tone: 'rose' },
  { id: 'NOT-1006', title: 'Monthly Target Update', description: 'Your monthly target has been updated...', type: 'Update', audience: 'Sales Executives (150 Users)', channel: 'WhatsApp', status: 'Sent', created: '19 May 2025 · 10:45 AM', delivery: '147 (98.0%)', icon: CheckCircle2, tone: 'emerald' },
  { id: 'NOT-1007', title: 'Incentive Announcement', description: 'Great news! New incentive scheme is live...', type: 'Announcement', audience: 'Sales Executives (150 Users)', channel: 'Email · WhatsApp', status: 'Sent', created: '18 May 2025 · 05:00 PM', delivery: '138 (92.0%)', icon: Sparkles, tone: 'violet' },
  { id: 'NOT-1008', title: 'Survey Request', description: 'We value your feedback. Please take 2 mins...', type: 'Other', audience: 'Active Customers (1,200 Users)', channel: 'Email', status: 'Scheduled', created: '23 May 2025 · 09:00 AM', delivery: '—', icon: FileText, tone: 'cyan' },
];

const executives = [
  { value: 'amit', label: 'Amit Verma', sublabel: 'Sales Manager · Mumbai West', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
  { value: 'rahul', label: 'Rahul Kumar', sublabel: 'Field Executive · Mumbai Central', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  { value: 'priya', label: 'Priya Singh', sublabel: 'Team Leader · Mumbai East', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80' },
];

const statCards = [
  { label: 'Total Sent', value: '1,248', change: '↑ 18.6%', subtext: 'vs last 30 days', icon: Send, color: 'text-rose-600 bg-rose-50' },
  { label: 'Delivered', value: '1,089', change: '↑ 14.2%', percent: '87.3%', subtext: 'vs last 30 days', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Opened', value: '623', change: '↑ 12.7%', percent: '57.2%', subtext: 'vs last 30 days', icon: Eye, color: 'text-amber-600 bg-amber-50' },
  { label: 'Clicked', value: '248', change: '↑ 9.7%', percent: '22.8%', subtext: 'vs last 30 days', icon: Bell, color: 'text-blue-600 bg-blue-50' },
  { label: 'Failed', value: '42', change: '↓ 2.3%', percent: '3.4%', subtext: 'vs last 30 days', icon: XCircle, color: 'text-rose-600 bg-rose-50' },
];

const typeStyles: Record<NoticeType, string> = {
  Announcement: 'bg-violet-50 text-violet-700 border-violet-200',
  Alert: 'bg-rose-50 text-rose-700 border-rose-200',
  Reminder: 'bg-blue-50 text-blue-700 border-blue-200',
  Promotion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Update: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

function PageHeader({ title, description, kind }: { title: string; description: string; kind: PageKind }) {
  const navigate = useNavigate();

  const actions =
    kind === 'center' ? (
      <>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/notifications/push')} className="gap-2 font-bold shadow-xs">
          <Send className="h-3.5 w-3.5" /> Push Notification
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/notifications/create')} className="gap-2 font-bold shadow-xs">
          <Plus className="h-3.5 w-3.5" /> Create Notification
        </Button>
        <Button variant="accent" size="sm" onClick={() => navigate('/admin/notifications/executives')} className="gap-2 font-bold shadow-xs">
          <Bell className="h-3.5 w-3.5" /> Executive Alerts
        </Button>
      </>
    ) : kind === 'templates' ? (
      <>
        <Button variant="outline" size="sm" onClick={() => toast.info('Template import wizard opened.')} className="font-bold shadow-xs">
          Import Template
        </Button>
        <Button variant="accent" size="sm" onClick={() => navigate('/admin/notifications/create')} className="gap-2 font-bold shadow-xs">
          <Plus className="h-3.5 w-3.5" /> Create Template
        </Button>
      </>
    ) : kind === 'alerts' ? (
      <>
        <Button variant="outline" size="sm" onClick={() => toast.info('Alert settings panel opened.')} className="font-bold shadow-xs">
          Alert Settings
        </Button>
        <Button variant="accent" size="sm" onClick={() => navigate('/admin/notifications/create')} className="gap-2 font-bold shadow-xs">
          <Plus className="h-3.5 w-3.5" /> Create Executive Alert
        </Button>
      </>
    ) : kind === 'push' ? (
      <>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/notifications')} className="font-bold shadow-xs">
          ← Notification Center
        </Button>
        <Button variant="accent" size="sm" onClick={() => toast.success('New push notification draft created.')} className="gap-2 font-bold shadow-xs">
          <Plus className="h-3.5 w-3.5" /> New Push Notification
        </Button>
      </>
    ) : (
      <>
        <Button variant="outline" size="sm" onClick={() => toast.success('Notification saved as draft.')} className="font-bold shadow-xs">
          Save as Draft
        </Button>
        <Button variant="accent" size="sm" onClick={() => toast.success('Notification submitted for final delivery!')} className="gap-2 font-bold shadow-xs">
          <Send className="h-3.5 w-3.5" /> Review & Send
        </Button>
      </>
    );

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-3">
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <button onClick={() => navigate('/admin/notifications')} className="hover:text-[#0D1F3D] cursor-pointer">
            Notifications
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#0D1F3D] font-bold">{title}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">{title}</h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
    </div>
  );
}

function Stats({ alert = false, template = false }: { alert?: boolean; template?: boolean }) {
  const cards = alert
    ? [
        { label: 'Total Alerts', value: '156', change: '↑ 18.6%', percent: '', subtext: 'vs last 30 days', icon: Bell, color: 'text-rose-600 bg-rose-50' },
        { label: 'Critical Alerts', value: '28', change: '↑ 27.3%', percent: '', subtext: 'vs last 30 days', icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
        { label: 'Pending Alerts', value: '42', change: '↑ 14.2%', percent: '', subtext: 'vs last 30 days', icon: CalendarClock, color: 'text-amber-600 bg-amber-50' },
        { label: 'Acknowledged', value: '72', change: '↑ 16.8%', percent: '', subtext: 'vs last 30 days', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Resolved', value: '42', change: '↑ 12.5%', percent: '', subtext: 'vs last 30 days', icon: ClipboardCopy, color: 'text-violet-600 bg-violet-50' },
      ]
    : template
    ? [
        { label: 'Total Templates', value: '126', change: '↑ 18.6%', percent: '', subtext: 'vs last 30 days', icon: ClipboardCopy, color: 'text-blue-600 bg-blue-50' },
        { label: 'Active Templates', value: '98', change: '↑ 16.2%', percent: '', subtext: 'vs last 30 days', icon: Send, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Scheduled Templates', value: '14', change: '↑ 12.5%', percent: '', subtext: 'vs last 30 days', icon: CalendarClock, color: 'text-amber-600 bg-amber-50' },
        { label: 'Archived Templates', value: '14', change: '↑ 9.3%', percent: '', subtext: 'vs last 30 days', icon: ClipboardCopy, color: 'text-violet-600 bg-violet-50' },
        { label: 'Disabled Templates', value: '6', change: '↓ 4.1%', percent: '', subtext: 'vs last 30 days', icon: XCircle, color: 'text-rose-600 bg-rose-50' },
      ]
    : statCards;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ label, value, change, percent, subtext, icon: Icon, color }) => (
        <div key={label} className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-extrabold text-[#0D1F3D]">{value}</p>
                {percent && <span className="text-xs font-bold text-slate-600">({percent})</span>}
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold text-emerald-600">
            {change} <span className="text-slate-400 font-normal">{subtext}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: NotificationRow['status'] }) {
  const style =
    status === 'Failed'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : status === 'Scheduled' || status === 'Pending'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : status === 'Resolved'
      ? 'bg-violet-50 text-violet-700 border-violet-200'
      : status === 'Disabled'
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${style}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>;
}

function FilterBar({ mode = 'center' }: { mode?: 'center' | 'alerts' | 'templates' }) {
  const [search, setSearch] = useState('');

  return (
    <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              mode === 'alerts'
                ? 'Search by alert title or description...'
                : mode === 'templates'
                ? 'Search by template name or keyword...'
                : 'Search by title, message, or audience...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
          />
        </div>

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'announcement', label: 'Announcement' },
            { value: 'alert', label: 'Alert' },
            { value: 'reminder', label: 'Reminder' },
            { value: 'promotion', label: 'Promotion' },
          ]}
          searchable={false}
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Audiences' },
            { value: 'customers', label: 'All Customers' },
            { value: 'executives', label: 'Field Executives' },
            { value: 'managers', label: 'Sales Managers' },
          ]}
          searchable={false}
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'sent', label: 'Sent' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'failed', label: 'Failed' },
          ]}
          searchable={false}
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: 'all', label: 'All Channels' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'Email' },
            { value: 'inapp', label: 'In-App' },
          ]}
          searchable={false}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-bold text-slate-500">Date Range:</span>
          <span className="font-mono font-bold text-[#0D1F3D] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
            01 May 2025 - 22 May 2025 📅
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Filters cleared')} className="font-bold">
            Clear Filters
          </Button>
          <Button variant="accent" size="sm" onClick={() => toast.success('Filters applied')} className="font-bold shadow-xs">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

// SCREEN 163: NOTIFICATION CENTER (/admin/notifications)
export function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'scheduled' | 'drafts' | 'failed'>('all');

  const columns: ColumnDef<NotificationRow>[] = [
    {
      header: 'Title & Message',
      cell: (row) => {
        const Icon = row.icon;
        return (
          <div className="flex items-center gap-3 min-w-[220px]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${
              row.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              row.tone === 'blue' ? 'bg-blue-50 text-blue-600' :
              row.tone === 'violet' ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-extrabold text-[#0D1F3D] text-xs">{row.title}</p>
              <p className="text-[11px] font-medium text-slate-500 truncate max-w-[240px] mt-0.5">{row.description}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Type',
      cell: (row) => (
        <span className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${typeStyles[row.type]}`}>
          {row.type}
        </span>
      ),
    },
    {
      header: 'Audience',
      cell: (row) => (
        <div>
          <p className="font-extrabold text-[#0D1F3D] text-xs">{row.audience}</p>
        </div>
      ),
    },
    {
      header: 'Channel',
      cell: (row) => (
        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">
          {row.channel}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Sent / Scheduled',
      cell: (row) => <span className="text-xs font-semibold text-slate-600">{row.created}</span>,
    },
    {
      header: 'Delivery',
      cell: (row) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{row.delivery}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing details for ${row.title}`)}
            className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.info(`More options for ${row.title}`)}
            className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader kind="center" title="Notification Center" description="Manage all system notifications, announcements and communication history." />
      
      <Stats />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <FilterBar mode="center" />

          {/* Sub Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-2 rounded-sm shadow-xs">
            <div className="flex gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'all' ? 'border-[#E20613] text-[#E20613]' : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                All Notifications (1,248)
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'sent' ? 'border-[#E20613] text-[#E20613]' : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                Sent (1,089)
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'scheduled' ? 'border-[#E20613] text-[#E20613]' : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                Scheduled (117)
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'drafts' ? 'border-[#E20613] text-[#E20613]' : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                Drafts (18)
              </button>
              <button
                onClick={() => setActiveTab('failed')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'failed' ? 'border-[#E20613] text-[#E20613]' : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
                }`}
              >
                Failed (42)
              </button>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
            <DataTable columns={columns} data={notificationRows} keyExtractor={(row) => row.id} density="compact" />
          </div>
        </div>

        {/* Right Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Overview */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Notification Overview</h3>
            <div className="flex items-center gap-4 pt-1">
              <div className="h-28 w-28 shrink-0 rounded-full border-[10px] border-purple-500 border-t-blue-500 border-r-emerald-500 border-b-amber-500 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-extrabold text-[#0D1F3D]">1,248</span>
                <span className="text-[10px] font-bold text-slate-400">Total</span>
              </div>
              <div className="space-y-1.5 text-xs font-bold w-full">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Reminder</span>
                  <span className="font-mono text-[#0D1F3D]">35.3% (440)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Alert</span>
                  <span className="font-mono text-[#0D1F3D]">24.1% (300)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Promotion</span>
                  <span className="font-mono text-[#0D1F3D]">18.3% (228)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Announcement</span>
                  <span className="font-mono text-[#0D1F3D]">12.8% (160)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Wise Delivery */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Channel Wise Delivery</h3>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">WhatsApp</span>
                  <span className="text-emerald-600 font-mono">812 (89.9%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89.9%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Email</span>
                  <span className="text-purple-600 font-mono">358 (78.0%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '78.0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">In-App Push</span>
                  <span className="text-blue-600 font-mono">198 (92.5%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '92.5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Top Performing Notifications</h3>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">Plan Renewal Reminder</span>
                <span className="text-emerald-700 font-mono font-extrabold">62.4% Open</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">Discount Offer – 20% Off</span>
                <span className="text-emerald-700 font-mono font-extrabold">58.7% Open</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">New Feature Released</span>
                <span className="text-emerald-700 font-mono font-extrabold">55.1% Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREEN 164: CREATE NOTIFICATION (/admin/notifications/create)
export function CreateNotificationPage() {
  const [noticeType, setNoticeType] = useState<NoticeType>('Announcement');
  const [audienceTarget, setAudienceTarget] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendNow, setSendNow] = useState(true);

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader kind="create" title="Create Notification" description="Send updates, alerts and announcements to the right audience." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main Compose Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Stepper Bar */}
          <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 shadow-xs text-xs font-bold">
            <span className="text-[#E20613] flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-red-100 text-[#E20613] flex items-center justify-center text-[10px]">1</span> Compose</span>
            <span className="text-slate-400 flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">2</span> Audience</span>
            <span className="text-slate-400 flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">3</span> Delivery</span>
            <span className="text-slate-400 flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">4</span> Review</span>
          </div>

          {/* Type Selector Grid */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Notification Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(['Announcement', 'Alert', 'Reminder', 'Promotion', 'Update', 'Other'] as NoticeType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNoticeType(t)}
                  className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                    noticeType === t ? 'border-[#E20613] bg-red-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-extrabold text-[#0D1F3D]">{t}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                    {t === 'Announcement' ? 'General updates' : t === 'Alert' ? 'Important alerts' : 'Scheduled reminders'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Audience Selection */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Audience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select label="Send To *" options={[{ value: 'all', label: 'All Users' }, { value: 'custom', label: 'Custom Target' }]} searchable={false} />
              <Select label="Customer / Executive" options={[{ value: 'customers', label: 'Select customers or executives' }]} searchable={true} />
              <Select label="Teams / Territories" options={[{ value: 'mumbai', label: 'Select teams or territories' }]} searchable={true} />
              <Select label="Roles" options={[{ value: 'field', label: 'Select roles' }]} searchable={true} />
            </div>
          </div>

          {/* Message Content */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Message Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Title *" placeholder="Enter notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Short Description (Optional)" placeholder="Enter short description" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                className="w-full rounded-sm border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                <span>Use merge fields to personalize. Example: <code>&#123;name&#125;</code>, <code>&#123;expiry_date&#125;</code></span>
                <span>{message.length} / 5000</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setMessage((m) => m + ' {{name}}')} className="font-bold">
                + Add Merge Field
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMessage((m) => m + ' 😊')} className="font-bold">
                😊 Add Emoji
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Media attachment opened')} className="font-bold">
                📎 Add Media
              </Button>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Delivery Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSendNow(true)}
                className={`p-3 rounded-sm border text-left font-bold text-xs cursor-pointer ${
                  sendNow ? 'border-[#E20613] bg-red-50/50 text-[#0D1F3D]' : 'border-slate-200 text-slate-600'
                }`}
              >
                Send Immediately
              </button>
              <button
                type="button"
                onClick={() => setSendNow(false)}
                className={`p-3 rounded-sm border text-left font-bold text-xs cursor-pointer ${
                  !sendNow ? 'border-[#E20613] bg-red-50/50 text-[#0D1F3D]' : 'border-slate-200 text-slate-600'
                }`}
              >
                Schedule For Later
              </button>
              <Input label="Schedule Date" type="date" defaultValue="2025-05-22" />
              <Select label="Priority" options={[{ value: 'high', label: 'High Priority' }, { value: 'normal', label: 'Normal' }]} searchable={false} />
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Live Mobile Preview</h3>
            
            {/* Phone Lockscreen Box */}
            <div className="rounded-2xl border-4 border-slate-800 bg-slate-900 p-4 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-2">
                <span>10:30 AM</span>
                <span>Smart Field Work</span>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3 space-y-1.5 border border-slate-700">
                <div className="flex items-center gap-2">
                  <img src="/assets/sfw-logo.png" alt="" className="h-5 w-auto object-contain" />
                  <span className="text-xs font-extrabold text-white">{title || 'Notification Title'}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  {message || 'This is how your notification message will appear on customer mobile screens.'}
                </p>
                <span className="text-[10px] font-bold text-blue-400 block pt-1 hover:underline cursor-pointer">View Details →</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Notification Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-[#0D1F3D]">{noticeType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Recipients</span>
                <span className="font-bold text-emerald-600 font-mono">1,892 Users</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Delivery</span>
                <span className="font-bold text-blue-600">{sendNow ? 'Immediately' : 'Scheduled'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREEN 165: PUSH NOTIFICATIONS (/admin/notifications/push)
export function PushNotificationsPage() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'both'>('both');

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader kind="push" title="Push Notifications" description="Send instant push notifications to mobile app users." />

      <Stats />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Push Form (8 Cols) */}
        <div className="lg:col-span-8 rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Create Push Notification</h3>
          
          <div className="space-y-2">
            <label className="font-bold text-[#0D1F3D] block">Platform Target *</label>
            <div className="grid grid-cols-3 gap-3">
              {(['android', 'ios', 'both'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`p-3 rounded-sm border font-bold text-xs capitalize transition-all cursor-pointer ${
                    platform === p ? 'border-[#E20613] bg-red-50/50 text-[#0D1F3D]' : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  {p === 'both' ? 'Both (Android & iOS)' : p}
                </button>
              ))}
            </div>
          </div>

          <Input label="Title *" defaultValue="Plan Renewal Reminder" />
          
          <div className="space-y-1">
            <label className="font-bold text-[#0D1F3D] block">Message *</label>
            <textarea
              rows={3}
              defaultValue="Hi {{name}}, your plan will expire on {{expiry_date}}. Please renew to continue using all features."
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 p-3 font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Deep Link (Optional)" defaultValue="sfw://renewal" />
            <div className="space-y-1">
              <label className="font-bold text-[#0D1F3D] block">Image Attachment</label>
              <Button variant="outline" size="sm" onClick={() => toast.info('Upload image dialog opened')} className="w-full font-bold">
                📷 Upload Notification Banner
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="accent" size="sm" onClick={() => toast.success('Push notification sent!')} className="font-bold shadow-xs">
              <Send className="h-4 w-4 mr-1.5" /> Send Push Notification Now
            </Button>
          </div>
        </div>

        {/* Right Phone Mockup Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Phone Lockscreen Preview</h3>
            
            <div className="rounded-3xl border-4 border-slate-900 bg-slate-950 p-4 text-white shadow-xl space-y-3">
              <div className="text-center text-[10px] text-slate-400 font-mono">10:30 AM • Mon, 22 May</div>
              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-red-400">SFW Push</span>
                  <span className="text-slate-500">now</span>
                </div>
                <p className="text-xs font-extrabold text-white">Plan Renewal Reminder</p>
                <p className="text-[11px] text-slate-300 leading-snug">Hi Rahul, your plan will expire on 22 May 2025. Please renew to continue.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREEN 166: EXECUTIVE ALERTS (/admin/notifications/executives)
export function ExecutiveAlertsPage() {
  const alertColumns: ColumnDef<NotificationRow>[] = [
    {
      header: 'Alert Title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 font-extrabold">
            ⚠️
          </span>
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{row.title}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: () => <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-sm text-[10px] font-extrabold">Critical Alert</span>,
    },
    {
      header: 'Urgency',
      cell: () => <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-sm text-[10px]">CRITICAL</span>,
    },
    {
      header: 'Executive / Role',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <img src={executives[0].avatar} alt="" className="h-6 w-6 rounded-full object-cover border border-slate-200" />
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{row.audience}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => toast.info(`Resolving alert: ${row.title}`)} className="text-[10px] font-bold py-1">
          Acknowledge
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader kind="alerts" title="Executive Alerts" description="Critical alerts and important notifications for executives and managers." />
      
      <Stats alert />

      <FilterBar mode="alerts" />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={alertColumns} data={notificationRows} keyExtractor={(row) => row.id} density="compact" />
      </div>
    </div>
  );
}

// SCREEN 167: NOTIFICATION TEMPLATES (/admin/notifications/templates)
export function NotificationTemplatesPage() {
  const templateColumns: ColumnDef<NotificationRow>[] = [
    {
      header: 'Template Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-extrabold">
            📋
          </span>
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{row.title}</p>
            <p className="text-[10px] text-slate-500">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => <span className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${typeStyles[row.type]}`}>{row.type}</span>,
    },
    {
      header: 'Channel',
      cell: (row) => <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">{row.channel}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => toast.info(`Editing template ${row.title}`)} className="p-1 text-slate-600 hover:text-[#0D1F3D] cursor-pointer">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => toast.info(`Duplicating template ${row.title}`)} className="p-1 text-slate-600 hover:text-[#0D1F3D] cursor-pointer">
            <ClipboardCopy className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader kind="templates" title="Notification Templates" description="Create, manage and reuse templates for notifications across all channels." />

      <Stats template />

      <FilterBar mode="templates" />

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={templateColumns} data={notificationRows} keyExtractor={(row) => row.id} density="compact" />
      </div>
    </div>
  );
}
