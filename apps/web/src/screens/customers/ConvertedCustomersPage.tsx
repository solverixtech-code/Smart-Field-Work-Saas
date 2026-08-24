import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  CreditCard,
  RefreshCw,
  MoreVertical,
  Calendar,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { MOCK_CUSTOMERS, CustomerItem } from './customersData';

export default function ConvertedCustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPlan, setSelectedPlan] = useState<string>('All');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Expired' | 'Cancelled' | 'Trial'>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Filtered dataset
  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.mobile.includes(searchTerm) ||
        cust.customerCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        activeTab !== 'All'
          ? cust.status === activeTab
          : selectedStatus === 'All' || cust.status === selectedStatus;

      const matchesPlan = selectedPlan === 'All' || cust.planName === selectedPlan;
      const matchesExec = selectedExecutive === 'All' || cust.convertedByName === selectedExecutive;

      return matchesSearch && matchesStatus && matchesPlan && matchesExec;
    });
  }, [searchTerm, selectedStatus, selectedPlan, selectedExecutive, activeTab]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredCustomers.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((item) => item !== id));
    }
  };

  const executiveOptions = [
    { value: 'All', label: 'All Executives' },
    {
      value: 'Amit Verma',
      label: 'Amit Verma',
      sublabel: 'Sales Manager • West Zone',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      value: 'Neha Patel',
      label: 'Neha Patel',
      sublabel: 'Team Leader • North Zone',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      value: 'Ravi Singh',
      label: 'Ravi Singh',
      sublabel: 'Senior Executive • HQ',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      value: 'Sneha Iyer',
      label: 'Sneha Iyer',
      sublabel: 'Executive • South Zone',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  ];

  return (
    <div className="space-y-4 font-sans text-slate-800 text-left pb-12">
      {/* BREADCRUMBS & PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>&gt;</span>
            <span className="text-slate-700">Customers & Subscriptions</span>
            <span>&gt;</span>
            <span className="text-[#0D1F3D] font-extrabold">Converted Customers</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Converted Customers (Field Sales)</h1>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Customers converted from field sales visits and their subscription details.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/businesses/create')}
            className="bg-[#E20613] hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Converted Customer
          </Button>
        </div>
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Converted Customers</span>
            <div className="h-8 w-8 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">2,148</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↑ 12.6% vs 30d
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Subscriptions</span>
            <div className="h-8 w-8 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">1,784</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↑ 10.3% vs 30d
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Expired / Inactive</span>
            <div className="h-8 w-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">236</span>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              ↑ 4.8% vs 30d
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active MRR</span>
            <div className="h-8 w-8 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">₹14,85,920</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↑ 8.4% vs 30d
            </span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Monthly Revenue</span>
            <div className="h-8 w-8 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">₹16,97,450</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ↑ 15.2% vs 30d
            </span>
          </div>
        </div>
      </div>

      {/* FILTER BAR & TAB CONTROLS */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* SUB-TABS */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'All', label: 'All Customers', count: 2148 },
              { id: 'Active', label: 'Active', count: 1784 },
              { id: 'Expired', label: 'Expired', count: 236 },
              { id: 'Cancelled', label: 'Cancelled', count: 128 },
              { id: 'Trial', label: 'Trial', count: 84 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#0D1F3D] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH & DROPDOWN FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* SEARCH BAR */}
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, business, mobile..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#E20613] focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* PLAN FILTER */}
          <div>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              options={[
                { value: 'All', label: 'All Plans' },
                { value: 'Starter Plan', label: 'Starter Plan (Monthly)' },
                { value: 'Growth Plan', label: 'Growth Plan (Monthly)' },
                { value: 'Pro Plan', label: 'Pro Plan (Monthly)' },
                { value: 'Enterprise Plan', label: 'Enterprise Plan (Yearly)' },
              ]}
              searchable={true}
            />
          </div>

          {/* EXECUTIVE FILTER WITH AVATARS */}
          <div>
            <Select
              value={selectedExecutive}
              onChange={(e) => setSelectedExecutive(e.target.value)}
              options={executiveOptions}
              searchable={true}
            />
          </div>

          {/* RESET FILTERS */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedPlan('All');
                setSelectedExecutive('All');
                setActiveTab('All');
              }}
              className="w-full bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* 100% FULL-WIDTH DATA TABLE */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">
                  <Checkbox
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === filteredCustomers.length
                    }
                    onChange={(checked) => handleSelectAll(checked)}
                  />
                </th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Customer</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Business & Mobile</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Converted By</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Converted Date</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Plan / Package</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Status</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Next Renewal</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">MRR</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D]">Total Paid</th>
                <th className="py-3 px-4 text-xs font-extrabold text-[#0D1F3D] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-medium">
                    No converted customers found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <Checkbox
                        checked={selectedRows.includes(cust.id)}
                        onChange={(checked) => handleSelectRow(cust.id, checked)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            cust.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              cust.name
                            )}&background=0D1F3D&color=fff`
                          }
                          alt={cust.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span
                            onClick={() => navigate(`/admin/customers/${cust.id}`)}
                            className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer block"
                          >
                            {cust.name}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block">
                            {cust.customerCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-extrabold text-slate-800 block">
                          {cust.businessName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 block">
                          {cust.mobile}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            cust.convertedByAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              cust.convertedByName
                            )}&background=E20613&color=fff`
                          }
                          alt={cust.convertedByName}
                          className="h-7 w-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {cust.convertedByName}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {cust.convertedByRole.split('•')[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {cust.convertedOn}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">
                          {cust.planName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          {cust.billingCycle}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cust.status === 'Expired'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : cust.status === 'Trial'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cust.status === 'Active' && <CheckCircle2 className="h-3 w-3" />}
                        {cust.status === 'Expired' && <AlertCircle className="h-3 w-3" />}
                        {cust.status === 'Cancelled' && <XCircle className="h-3 w-3" />}
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      <div>
                        <span>{cust.nextRenewalDate}</span>
                        {cust.daysLeft > 0 && (
                          <span className="text-[10px] font-medium text-emerald-600 block">
                            ({cust.daysLeft} days left)
                          </span>
                        )}
                        {cust.daysLeft < 0 && (
                          <span className="text-[10px] font-bold text-amber-600 block">
                            (Expired {Math.abs(cust.daysLeft)}d ago)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#0D1F3D]">
                      ₹{cust.mrr.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{cust.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <RowActionsMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: Eye,
                            onClick: () => navigate(`/admin/customers/${cust.id}`),
                          },
                          {
                            label: 'Subscription Details',
                            icon: CreditCard,
                            onClick: () => navigate(`/admin/customers/${cust.id}/subscription`),
                          },
                          {
                            label: 'Renewal Status',
                            icon: RefreshCw,
                            onClick: () => navigate(`/admin/customers/${cust.id}/renewal`),
                          },
                          {
                            label: 'Edit Customer',
                            icon: Edit,
                            onClick: () => navigate(`/admin/customers/${cust.id}`),
                            divider: true,
                          },
                          {
                            label: 'Delete Customer',
                            icon: Trash2,
                            onClick: () => alert(`Deleted ${cust.name}`),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2">
          <span>Showing 1 to {filteredCustomers.length} of {filteredCustomers.length} customers</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="bg-white border-slate-200 text-xs">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-[#0D1F3D] text-white border-[#0D1F3D] text-xs">
              1
            </Button>
            <Button variant="outline" size="sm" disabled className="bg-white border-slate-200 text-xs">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
