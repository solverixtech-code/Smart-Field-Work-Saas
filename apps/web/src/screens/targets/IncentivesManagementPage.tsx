import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Gift,
  CreditCard,
  CheckCircle2,
  Clock,
  Check,
  X,
  Download,
  Filter,
  Search,
  ChevronRight,
  Eye,
  DollarSign,
  AlertTriangle,
  User,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import {
  mockIncentiveCalculations,
  mockIncentivePayouts,
  IncentiveCalculationItem,
  IncentivePayoutItem,
} from './targetsData';

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

  const [calculations, setCalculations] = useState<IncentiveCalculationItem[]>(mockIncentiveCalculations);
  const [payouts, setPayouts] = useState<IncentivePayoutItem[]>(mockIncentivePayouts);
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleApproveSelected = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one executive calculation to approve');
      return;
    }
    setCalculations((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, payoutStatus: 'Approved' } : c))
    );
    toast.success(`Approved ${selectedIds.length} incentive payout(s)!`);
    setSelectedIds([]);
  };

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
                options={[
                  { value: 'May 2025', label: 'May 2025' },
                  { value: 'April 2025', label: 'April 2025' },
                ]}
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
              onClick={() => toast.info('Exporting incentive report...')}
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
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 1,24,350</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 22.8% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Approved Amount</span>
            <span className="text-xl font-extrabold text-emerald-600">₹ 50,000</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Ready for payout</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Approval</span>
            <span className="text-xl font-extrabold text-amber-600">₹ 49,100</span>
            <span className="text-xs font-semibold text-amber-600 block mt-0.5">Action required</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Paid Amount</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 75,250</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Disbursed by Finance</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Earners</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">48</span>
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
                          setSelectedIds(e.target.checked ? calculations.map((c) => c.id) : [])
                        }
                        checked={selectedIds.length === calculations.length}
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
                {calculations.map((c) => (
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
                      <div className="flex items-center gap-2.5">
                        <img src={c.executiveAvatar} alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{c.executiveName}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">{c.executiveId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{c.teamName}</td>
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
                          { label: 'View Itemized Breakdown', icon: Eye, onClick: () => navigate(`/admin/incentives/${c.executiveId}`) },
                          {
                            label: 'Approve Payout',
                            icon: Check,
                            onClick: () => {
                              setCalculations((prev) =>
                                prev.map((item) => (item.id === c.id ? { ...item, payoutStatus: 'Approved' } : item))
                              );
                              toast.success(`Approved incentive payout of ₹${c.totalIncentive} for ${c.executiveName}`);
                            },
                          },
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
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{p.payoutId}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={p.executiveAvatar} alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                        <span className="font-extrabold text-[#0D1F3D]">{p.executiveName}</span>
                      </div>
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
    </div>
  );
}
