import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../common/api';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AttendanceTab } from './tabs/AttendanceTab';
import { IncentivesTab } from './tabs/IncentivesTab';
import { OverviewTab } from './tabs/OverviewTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { RouteHistoryTab } from './tabs/RouteHistoryTab';
import { SalesTab } from './tabs/SalesTab';
import { VisitsTab } from './tabs/VisitsTab';
import type { ExecutiveProfileData } from './executive-profile.types';

type TabId = 'overview' | 'performance' | 'route' | 'attendance' | 'visits' | 'sales' | 'incentives';
type ProfileState =
  | { id: string; status: 'loading' }
  | { id: string; status: 'ready'; profile: ExecutiveProfileData }
  | { id: string; status: 'error'; message: string };

const tabs: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'route', label: 'Route History' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'visits', label: 'Visits' },
  { id: 'sales', label: 'Sales' },
  { id: 'incentives', label: 'Incentives' },
];

const joinedDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

function experienceSince(value: string) {
  const joined = new Date(value);
  if (Number.isNaN(joined.getTime())) return 'Not available';
  const months = Math.max(0, (new Date().getFullYear() - joined.getFullYear()) * 12 + new Date().getMonth() - joined.getMonth());
  if (months < 12) return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths ? `${years}.${Math.round((remainingMonths / 12) * 10)} Years` : `${years} ${years === 1 ? 'Year' : 'Years'}`;
}

function exportProfile(profile: ExecutiveProfileData) {
  const rows = [
    ['Executive', profile.displayName], ['Employee ID', profile.employeeCode], ['Role', profile.role],
    ['Department', profile.department ?? ''], ['Email', profile.email], ['Mobile', profile.mobile ?? ''],
    ['Team', profile.teamName ?? ''], ['Reporting To', profile.managerName ?? ''],
    ['Leads Assigned', profile.overview.totals.leadsAssigned], ['Leads Converted', profile.overview.totals.leadsConverted],
    ['Deals Won', profile.overview.totals.dealsWon], ['Revenue', profile.overview.totals.revenue],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${profile.employeeCode}-executive-report.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success('Executive report exported');
}

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<ProfileState>({ id: id ?? '', status: 'loading' });

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setState({ id, status: 'loading' });
    api.get<ExecutiveProfileData>(`/tenant/crm/lead-assignees/${encodeURIComponent(id)}/profile`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setState({ id, status: 'ready', profile: data }); })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        setState({ id, status: 'error', message: status === 404 ? 'This employee profile is unavailable.' : status === 403 ? 'You do not have permission to view this employee profile.' : 'Could not load this employee profile. Please try again.' });
      });
    return () => controller.abort();
  }, [id, retry]);

  const current = state.id === id ? state : { status: 'loading' as const };
  if (!id || current.status === 'error') return <div className="space-y-3 font-sans"><button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D]"><ArrowLeft className="h-4 w-4" /> Back</button><Card variant="panel" role="alert" className="text-sm text-slate-700"><p>{current.status === 'error' ? current.message : 'This employee profile is unavailable.'}</p>{id ? <Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)} className="mt-3">Retry</Button> : null}</Card></div>;
  if (current.status === 'loading') return <Card variant="panel" role="status" className="text-sm text-slate-500">Loading employee profile...</Card>;
  const profile = current.profile;

  return <div className="space-y-3 font-sans">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"><ArrowLeft className="h-4 w-4" /> Back to Executives</button>
      <div className="flex items-center gap-3"><Button variant="outline" size="sm" onClick={() => exportProfile(profile)} className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"><Download className="h-4 w-4 text-[#0D1F3D]" /> Export Report</Button><Button variant="accent" size="sm" onClick={() => navigate(`/admin/executives/${profile.id}/edit`)} className="flex items-center gap-2 font-bold shadow-sm"><Edit className="h-4 w-4" /> Edit Executive</Button></div>
    </div>

    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-6">
      <div className="flex flex-wrap items-center gap-5"><div className="relative"><Avatar name={profile.displayName} src={profile.avatarUrl} sizeClassName="h-24 w-24" className="text-xl shadow-md border-2 border-white ring-2 ring-slate-100" /><span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ring-2 ring-white ${profile.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} /></div><div className="space-y-1.5"><div className="flex items-center gap-3"><h2 className="text-xl font-extrabold text-[#0D1F3D]">{profile.displayName}</h2><span className={`rounded-full border px-3 py-0.5 text-xs font-extrabold ${profile.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{profile.status.charAt(0) + profile.status.slice(1).toLowerCase()}</span><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{profile.employeeCode}</span></div><p className="text-xs font-bold text-[#E20613]">{profile.role}{profile.department ? ` · ${profile.department}` : ''}</p><div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#E20613]" /> {profile.mobile || 'Not provided'}</span><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-600" /> {profile.email}</span><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-purple-600" /> {profile.address || 'Not provided'}</span></div></div></div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-semibold text-slate-600 pt-1 sm:pt-0"><div><span className="text-[11px] text-slate-400 block font-medium">Reporting To</span><span className="font-extrabold text-[#0D1F3D]">{profile.managerName ? `${profile.managerName}${profile.managerEmployeeCode ? ` (${profile.managerEmployeeCode})` : ''}` : 'Not assigned'}</span></div><div><span className="text-[11px] text-slate-400 block font-medium">Team</span><span className="font-bold text-slate-700">{profile.teamName || 'Not assigned'}</span></div><div><span className="text-[11px] text-slate-400 block font-medium">Join Date</span><span className="font-bold text-slate-700">{joinedDate.format(new Date(profile.joinedAt))}</span></div><div><span className="text-[11px] text-slate-400 block font-medium">Experience</span><span className="font-bold text-slate-700">{experienceSince(profile.joinedAt)}</span></div><div><span className="text-[11px] text-slate-400 block font-medium">Employment Type</span><span className="font-bold text-emerald-600">{profile.employmentType || 'Not recorded'}</span></div></div>
    </div></div>

    <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 border-b-2 font-extrabold transition-all whitespace-nowrap cursor-pointer text-xs ${activeTab === tab.id ? 'border-purple-600 text-purple-700 bg-transparent' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}>{tab.label}</button>)}</div>
    <div className="pt-2">{activeTab === 'overview' ? <OverviewTab data={profile.overview} /> : activeTab === 'performance' ? <PerformanceTab data={profile.performance} /> : activeTab === 'route' ? <RouteHistoryTab data={profile.routeHistory} /> : activeTab === 'attendance' ? <AttendanceTab data={profile.attendance} /> : activeTab === 'visits' ? <VisitsTab data={profile.visits} /> : activeTab === 'sales' ? <SalesTab data={profile.sales} /> : <IncentivesTab data={profile.incentives} />}</div>
  </div>;
}
