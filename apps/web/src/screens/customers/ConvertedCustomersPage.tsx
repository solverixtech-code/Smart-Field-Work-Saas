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
  Trash2,
  RotateCcw,
  Bookmark,
  Columns
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
  const [selectedAccount, setSelectedAccount] = useState<string>('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('All');
  const [selectedCustomerType, setSelectedCustomerType] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
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
      sublabel: 'Executive',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      value: 'Neha Patel',
      label: 'Neha Patel',
      sublabel: 'Executive',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      value: 'Ravi Singh',
      label: 'Ravi Singh',
      sublabel: 'Executive',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      value: 'Sneha Iyer',
      label: 'Sneha Iyer',
      sublabel: 'Executive',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  ];

  return (
    <div className="space-y-4 font-sans text-slate-800 text-left pb-12">
      {/* BREADCRUMBS & PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              Customers & Subscriptions
            </span>
            <span>&gt;</span>
            <span className="text-blue-600 font-bold">Converted Customers (Field Sales)</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Converted Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers who have converted from field sales and their subscription details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Import CSV')}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/businesses/create')}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* TOP KPI CARDS GRID WITH SPARKLINE TRENDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Converted Customers</span>
            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">2,148</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-600">↑ 12.6% vs last 30 days</span>
            <svg className="w-16 h-5 text-indigo-500" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 20 Q 25 5, 50 15 T 100 5" />
            </svg>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Subscriptions</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">1,784</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-600">↑ 10.3% vs last 30 days</span>
            <svg className="w-16 h-5 text-emerald-500" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 22 Q 25 15, 50 8 T 100 2" />
            </svg>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Expired / Inactive</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">236</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-amber-600">↑ 4.8% vs last 30 days</span>
            <svg className="w-16 h-5 text-amber-500" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 10 Q 25 20, 50 12 T 100 18" />
            </svg>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">MRR (Active)</span>
            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">₹14,85,920</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-600">↑ 8.4% vs last 30 days</span>
            <svg className="w-16 h-5 text-blue-500" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 18 Q 25 10, 50 14 T 100 4" />
            </svg>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Revenue (This Month)</span>
            <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#0D1F3D]">₹16,97,450</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-600">↑ 15.2% vs last 30 days</span>
            <svg className="w-16 h-5 text-teal-500" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 20 Q 25 8, 50 12 T 100 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* DETAILED FILTER CONTROLS GRID */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Account</label>
            <Select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              options={[{ value: 'All', label: 'All Accounts' }]}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Subscription Status</label>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Expired', label: 'Expired' },
                { value: 'Trial', label: 'Trial' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Plan / Package</label>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              options={[
                { value: 'All', label: 'All Plans' },
                { value: 'Starter Plan', label: 'Starter Plan' },
                { value: 'Growth Plan', label: 'Growth Plan' },
                { value: 'Pro Plan', label: 'Pro Plan' },
                { value: 'Enterprise Plan', label: 'Enterprise Plan' },
              ]}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Payment Status</label>
            <Select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              options={[{ value: 'All', label: 'All Status' }]}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Customer Type</label>
            <Select
              value={selectedCustomerType}
              onChange={(e) => setSelectedCustomerType(e.target.value)}
              options={[{ value: 'All', label: 'All Types' }]}
              searchable={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Source</label>
            <Select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              options={[{ value: 'All', label: 'All Sources' }]}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Converted By</label>
            <Select
              value={selectedExecutive}
              onChange={(e) => setSelectedExecutive(e.target.value)}
              options={executiveOptions}
              searchable={true}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Converted Date</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value="16 May 2025 - 22 May 2025"
                className="w-full rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 cursor-pointer"
              />
              <Calendar className="absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Next Renewal</label>
            <Select
              value="All"
              onChange={() => {}}
              options={[{ value: 'All', label: 'All' }]}
              searchable={true}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, email, business..."
              className="w-full rounded-sm border border-slate-200 pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none bg-slate-50/50"
            />
          </div>

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
              className="bg-white border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" /> Clear Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Saved Filter')}
              className="bg-white border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <Bookmark className="h-3.5 w-3.5 text-slate-400" /> Save Filter
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {}}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* SUB-TABS & DATA TABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-4 text-xs font-semibold">
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
                className={`py-1 transition-colors border-b-2 font-bold flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Toggle Columns')}
            className="bg-white border-slate-200 text-slate-700 font-semibold text-xs h-7 px-2.5"
          >
            <Columns className="h-3.5 w-3.5 text-slate-400" /> Columns
          </Button>
        </div>

        {/* 100% FULL-WIDTH DATA TABLE */}
        <div className="overflow-x-auto rounded-sm border border-slate-200">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-[#0D1F3D]">
                <th className="py-2.5 px-3 w-10 text-center">
                  <Checkbox
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === filteredCustomers.length
                    }
                    onChange={(checked) => handleSelectAll(checked)}
                  />
                </th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Business / Mobile</th>
                <th className="py-2.5 px-3">Converted By</th>
                <th className="py-2.5 px-3">Converted On ↕</th>
                <th className="py-2.5 px-3">Plan / Package</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Next Renewal ↕</th>
                <th className="py-2.5 px-3">MRR</th>
                <th className="py-2.5 px-3">Total Paid</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-medium">
                    No converted customers found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <Checkbox
                        checked={selectedRows.includes(cust.id)}
                        onChange={(checked) => handleSelectRow(cust.id, checked)}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/admin/customers/${cust.id}`)}
                            className="font-bold text-[#0D1F3D] hover:text-blue-600 cursor-pointer block"
                          >
                            {cust.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {cust.businessName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-mono font-bold text-slate-800 block">
                          {cust.mobile}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {cust.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            cust.convertedByAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              cust.convertedByName
                            )}&background=2563EB&color=fff`
                          }
                          alt={cust.convertedByName}
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            {cust.convertedByName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Executive
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div>
                        <span className="block font-semibold">{cust.convertedOn.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">10:24 AM</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-bold text-[#0D1F3D] block">
                          {cust.planName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {cust.billingCycle}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cust.status === 'Expired'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : cust.status === 'Trial'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      <div>
                        <span className="font-semibold block">{cust.nextRenewalDate}</span>
                        {cust.daysLeft > 0 && (
                          <span className="text-[10px] text-slate-500 block">
                            ({cust.daysLeft} days left)
                          </span>
                        )}
                        {cust.daysLeft < 0 && (
                          <span className="text-[10px] font-bold text-amber-600 block">
                            (Expired)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-[#0D1F3D]">
                      ₹{cust.mrr.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      ₹{cust.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-2.5 px-3 text-center">
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
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
          <span>Showing 1 to {filteredCustomers.length} of 2,148 customers</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled className="bg-white border-slate-200 text-xs h-7 px-2">
              &lt;
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600 text-xs h-7 px-2.5 font-bold">
              1
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2.5 font-semibold">
              2
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2.5 font-semibold">
              3
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2.5 font-semibold">
              4
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2.5 font-semibold">
              5
            </Button>
            <span>...</span>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2.5 font-semibold">
              108
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs h-7 px-2">
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
