import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Gift,
  CreditCard,
  CheckCircle2,
  Clock,
  Check,
  Download,
  Search,
  Eye,
  User,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { extractErrorMessage } from '../../common/api';
import { approveIncentives, calculateIncentives, currentPeriod, getIncentives, IncentiveCalculationItem, IncentivePayoutItem, periodLabel, shiftPeriod } from './target.api';

export default function IncentivesManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ executiveId?: string }>();

  // Determine active view tab based on current URL path
  const currentPath = location.pathname;
  let activeTab: 'calculations' | 'approvals' | 'payouts' | 'details' = 'calculations';
  if (currentPath.includes('/approvals')) activeTab = 'approvals';
  else if (currentPath.includes('/payouts')) activeTab = 'payouts';
  else if (params.executiveId) activeTab = 'details';

  const initialPeriod = currentPeriod();
  const [calculations, setCalculations] = useState<IncentiveCalculationItem[]>([]);
  const [payouts, setPayouts] = useState<IncentivePayoutItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0, paid: 0, activeEarners: 0, activeRules: 0 });
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [approvalSelection, setApprovalSelection] = useState<IncentiveCalculationItem[]>([]);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const monthOptions = Array.from({ length: 18 }, (_, index) => shiftPeriod(initialPeriod, 3 - index)).map((value) => ({ value, label: periodLabel(value) }));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null); setSelectedIds([]);
    calculateIncentives(selectedMonth).catch(() => undefined).then(() =>
      getIncentives(selectedMonth, params.executiveId ? { executiveId: params.executiveId } : {}, controller.signal)
    ).then(({ data }) => {
      setCalculations(data.calculations);
      setPayouts(data.payouts);
      setSummary(data.summary);
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load incentive records.'));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [params.executiveId, reloadToken, selectedMonth]);

  const search = searchQuery.toLowerCase().trim();
  const visibleCalculations = calculations.filter((calculation) => {
    const matchesSearch = !search || calculation.executiveName.toLowerCase().includes(search) || calculation.executiveId.toLowerCase().includes(search);
    return matchesSearch && (activeTab !== 'approvals' || calculation.payoutStatus === 'Pending Approval');
  });
  const visiblePayouts = payouts.filter((payout) => !search || payout.executiveName.toLowerCase().includes(search) || payout.payoutId.toLowerCase().includes(search));

  const openApprovalModal = (items: IncentiveCalculationItem[]) => {
    const payable = items.filter((item) => item.payoutStatus === 'Pending Approval' && item.totalIncentive > 0);
    if (!payable.length) {
      toast.error('No payable pending incentives were selected');
      return;
    }
    setApprovalSelection(payable);
  };

  const handleApproveSelected = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one executive calculation to approve');
      return;
    }
    openApprovalModal(calculations.filter((calculation) => selectedIds.includes(calculation.id)));
  };

  const confirmApproval = async () => {
    setApprovalSubmitting(true);
    try {
      await approveIncentives(approvalSelection.map((calculation) => calculation.id));
      toast.success(`Approved ${approvalSelection.length} incentive payout(s)!`);
      setSelectedIds([]);
      setApprovalSelection([]);
      setReloadToken((token) => token + 1);
    } catch (requestError: unknown) {
      toast.error(extractErrorMessage(requestError, 'Unable to approve the selected incentives.'));
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const exportRecords = () => {
    const rows: Array<Array<string | number>> = activeTab === 'payouts'
      ? [['Payout ref', 'Executive', 'Account', 'Amount', 'Date', 'Mode', 'Status'], ...visiblePayouts.map((payout) => [payout.payoutId, payout.executiveName, payout.bankAccountOrUpi, payout.amount, payout.payoutDate, payout.paymentMode, payout.status])]
      : [['Executive', 'Employee ID', 'Team', 'Sales', 'Demos', 'Visits', 'Bonus', 'Total', 'Status'], ...visibleCalculations.map((calculation) => [calculation.executiveName, calculation.executiveId, calculation.teamName, calculation.salesIncentive, calculation.demoIncentive, calculation.visitIncentive, calculation.bonusIncentive, calculation.totalIncentive, calculation.payoutStatus])];
    if (rows.length === 1) { toast.info('No incentive records to export.'); return; }
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `incentives-${activeTab}-${selectedMonth}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success('Incentive report exported.');
  };

  const approveOne = (calculation: IncentiveCalculationItem) => openApprovalModal([calculation]);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER BAR */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/targets')}>
            Targets & Incentives
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">
            {activeTab === 'approvals'
              ? 'Incentive Approvals'
              : activeTab === 'payouts'
              ? 'Incentive Payouts'
              : activeTab === 'details'
              ? `Executive Incentive - ${params.executiveId}`
              : 'Incentive Calculations'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">
              {activeTab === 'approvals'
                ? 'Incentive Approvals'
                : activeTab === 'payouts'
                ? 'Incentive Payouts'
                : activeTab === 'details'
                ? 'Executive Incentive Details'
                : 'Incentive Calculations'}
            </h1>
            <p className="text-xs font-normal text-slate-500">
              Track earned commissions, approve monthly payouts and manage finance disbursements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <div className="w-36">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
                searchable={false}
              />
            </div>

            {activeTab === 'approvals' && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleApproveSelected}
                className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
              >
                <Check className="h-4 w-4" /> Approve Selected ({selectedIds.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={exportRecords}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Incentives</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {summary.total.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Current period total</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Approved Amount</span>
            <span className="text-xl font-extrabold text-emerald-600">₹ {summary.approved.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Ready for payout</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Approval</span>
            <span className="text-xl font-extrabold text-amber-600">₹ {summary.pending.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-amber-600 block mt-0.5">Action required</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Paid Amount</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {summary.paid.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Disbursed by Finance</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Earners</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{summary.activeEarners}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Executives earning</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0 text-xs font-bold">
        <button
          type="button"
          onClick={() => navigate('/admin/incentives')}
          className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'calculations'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Incentive Calculations (Calculated)
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/incentives/approvals')}
          className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Incentive Approvals (Queue)
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/incentives/payouts')}
          className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'payouts'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Incentive Payouts (Disbursements)
        </button>
      </div>

      {/* TAB CONTENT TABLES */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">
            {activeTab === 'payouts' ? 'Payout Disbursements Log' : 'Calculated Executive Incentives'}
          </h3>

          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search executive name or ID..."
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>

        {/* VIEW 1: CALCULATIONS & APPROVALS TABLE */}
        {activeTab !== 'payouts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                  {activeTab === 'approvals' && (
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          setSelectedIds(e.target.checked ? visibleCalculations.map((c) => c.id) : [])
                        }
                        checked={visibleCalculations.length > 0 && selectedIds.length === visibleCalculations.length}
                        className="rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-2.5 px-3">Executive</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Sales Incentive (₹)</th>
                  <th className="py-2.5 px-3">Demos Incentive (₹)</th>
                  <th className="py-2.5 px-3">Visits Incentive (₹)</th>
                  <th className="py-2.5 px-3">Bonus (₹)</th>
                  <th className="py-2.5 px-3">Total Earned (₹)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && <tr><td colSpan={activeTab === 'approvals' ? 10 : 9} className="py-8 text-center text-slate-500">Loading incentive calculations...</td></tr>}
                {!loading && error && <tr><td colSpan={activeTab === 'approvals' ? 10 : 9} className="py-8 text-center text-red-600">{error}</td></tr>}
                {!loading && !error && visibleCalculations.length === 0 && <tr><td colSpan={activeTab === 'approvals' ? 10 : 9} className="py-8 text-center text-slate-500">{summary.activeRules === 0 ? `No active incentive rules apply to ${periodLabel(selectedMonth)}. Create and activate a rule to calculate earnings.` : 'No earned incentives found for this period.'}</td></tr>}
                {visibleCalculations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {activeTab === 'approvals' && (
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(c.id) ? prev.filter((i) => i !== c.id) : [...prev, c.id]
                            )
                          }
                          className="rounded-xs border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/executives/${c.membershipId || c.executiveId}`)}
                        className="flex items-center gap-2.5 cursor-pointer group text-left"
                      >
                        <Avatar src={c.executiveAvatar} name={c.executiveName} sizeClassName="h-7 w-7" />
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block group-hover:text-purple-700 transition-colors group-hover:underline">{c.executiveName}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold group-hover:text-purple-600 transition-colors">{c.executiveId}</span>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(c.teamId ? `/admin/teams/${c.teamId}` : '/admin/teams')}
                        className="font-bold text-slate-700 hover:text-purple-700 hover:underline cursor-pointer transition-colors inline-flex items-center gap-1 group text-left"
                      >
                        <Users className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
                        <span>{c.teamName}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">₹{c.salesIncentive.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">₹{c.demoIncentive.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">₹{c.visitIncentive.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-purple-700 font-bold">₹{c.bonusIncentive.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-black text-sm">₹{c.totalIncentive.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                          c.payoutStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.payoutStatus === 'Pending Approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {c.payoutStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <RowActionsMenu
                        items={[
                          { label: 'View Executive Profile', icon: User, onClick: () => navigate(`/admin/executives/${c.membershipId || c.executiveId}`) },
                          { label: 'View Team Details', icon: Users, onClick: () => navigate(c.teamId ? `/admin/teams/${c.teamId}` : '/admin/teams') },
                          { label: 'View Itemized Breakdown', icon: Eye, onClick: () => navigate(`/admin/incentives/${c.executiveId}`) },
                          ...(c.payoutStatus === 'Pending Approval' && c.totalIncentive > 0 ? [{ label: 'Approve Payout', icon: Check, onClick: () => approveOne(c) }] : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: PAYOUTS TABLE */}
        {activeTab === 'payouts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                  <th className="py-2.5 px-3">Payout Ref</th>
                  <th className="py-2.5 px-3">Executive</th>
                  <th className="py-2.5 px-3">Bank / UPI Account</th>
                  <th className="py-2.5 px-3">Payout Amount (₹)</th>
                  <th className="py-2.5 px-3">Disbursement Date</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading payouts...</td></tr>}
                {!loading && error && <tr><td colSpan={7} className="py-8 text-center text-red-600">{error}</td></tr>}
                {!loading && !error && visiblePayouts.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-500">No payout records found for this period.</td></tr>}
                {visiblePayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.payoutId}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/executives')}
                        className="flex items-center gap-2.5 cursor-pointer group text-left"
                      >
                        <Avatar src={p.executiveAvatar} name={p.executiveName} sizeClassName="h-7 w-7" />
                        <span className="font-extrabold text-[#0D1F3D] group-hover:text-purple-700 transition-colors group-hover:underline">{p.executiveName}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{p.bankAccountOrUpi}</td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-black text-sm">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{p.payoutDate}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{p.paymentMode}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                          p.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={approvalSelection.length > 0}
        onClose={() => { if (!approvalSubmitting) setApprovalSelection([]); }}
        title="Approve incentive payout"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs font-medium text-slate-600">
            Review the payable incentives below. Approval creates payout records for the finance disbursement queue.
          </p>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">Period</span>
              <span className="text-xs font-extrabold text-[#0D1F3D]">{periodLabel(selectedMonth)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">Executives</span>
              <span className="text-xs font-extrabold text-[#0D1F3D]">{approvalSelection.length}</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-500">Total payout</span>
              <span className="text-xs font-extrabold text-emerald-700">₹{approvalSelection.reduce((sum, item) => sum + item.totalIncentive, 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {approvalSelection.map((calculation) => (
              <div key={calculation.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar src={calculation.executiveAvatar} name={calculation.executiveName} sizeClassName="h-8 w-8" />
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-extrabold text-[#0D1F3D]">{calculation.executiveName}</span>
                    <span className="block text-[10px] font-mono font-semibold text-slate-400">{calculation.executiveId}</span>
                  </div>
                </div>
                <span className="ml-3 shrink-0 text-xs font-black text-emerald-700">₹{calculation.totalIncentive.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" size="sm" disabled={approvalSubmitting} onClick={() => setApprovalSelection([])}>Cancel</Button>
            <Button type="button" variant="accent" size="sm" disabled={approvalSubmitting} onClick={() => void confirmApproval()} className="bg-[#E20613] text-white hover:bg-red-700">
              <Check className="h-4 w-4" /> {approvalSubmitting ? 'Approving...' : `Approve ${approvalSelection.length} payout${approvalSelection.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
