import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  CreditCard,
  RefreshCw,
  Calendar,
  XCircle,
  Edit,
  Trash2,
  RotateCcw,
  Bookmark,
  DollarSign
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
    { value: 'All', label: 'All Assignees' },
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
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Converted Customers</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Converted Customers</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Customers converted from field sales visits and their subscription details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting converted customers report...')}
              className="bg-white text-[#0D1F3D] border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-4 w-4 text-slate-600" /> Export CSV
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/businesses/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Converted Customer
            </Button>
          </div>
        </div>
      </div>

      {/* 5 HEADER KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Converted</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,148</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 12.6% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Subscriptions</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">1,784</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 10.3% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Expired / Inactive</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">236</span>
            <span className="text-xs font-semibold text-amber-600 block">↑ 4.8% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active MRR</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹14.85L</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 8.4% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Monthly Revenue</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹16.97L</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 15.2% vs last mo</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs space-y-2">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, business..."
              className="w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-bold text-[#0D1F3D] placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Expired', label: 'Expired Only' },
              { value: 'Trial', label: 'Trial Only' },
              { value: 'Cancelled', label: 'Cancelled Only' },
            ]}
            searchable={true}
          />

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

          <Select
            value={selectedExecutive}
            onChange={(e) => setSelectedExecutive(e.target.value)}
            options={executiveOptions}
            searchable={true}
          />
        </div>
      </div>

      {/* 100% FULL-WIDTH DATATABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-extrabold text-[#0D1F3D]">
            Converted Customers ({filteredCustomers.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting converted customers list...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-3 px-3 text-center w-10">
                  <Checkbox
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === filteredCustomers.length
                    }
                    onChange={(checked) => handleSelectAll(checked)}
                  />
                </th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Business & Contact</th>
                <th className="py-3 px-3">Converted By</th>
                <th className="py-3 px-3">Converted On</th>
                <th className="py-3 px-3">Plan / Package</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Next Renewal</th>
                <th className="py-3 px-3 text-right">MRR</th>
                <th className="py-3 px-3 text-right">Total Paid</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-medium">
                    No converted customers found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <Checkbox
                        checked={selectedRows.includes(cust.id)}
                        onChange={(checked) => handleSelectRow(cust.id, checked)}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/admin/customers/${cust.id}`)}
                            className="font-extrabold text-[#0D1F3D] block text-xs hover:text-indigo-600 hover:underline cursor-pointer"
                          >
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-semibold">{cust.customerCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">
                          {cust.businessName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block font-semibold">
                          {cust.mobile}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            cust.convertedByAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              cust.convertedByName
                            )}&background=2563EB&color=fff`
                          }
                          alt={cust.convertedByName}
                          onClick={() => navigate(`/admin/executives/${cust.convertedById || 'exec-001'}`)}
                          className="h-6 w-6 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                          title={`View ${cust.convertedByName} profile`}
                        />
                        <div>
                          <span
                            onClick={() => navigate(`/admin/executives/${cust.convertedById || 'exec-001'}`)}
                            className="font-extrabold text-[#0D1F3D] block text-xs hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          >
                            {cust.convertedByName}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            Executive
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold text-[11px]">
                      {cust.convertedOn}
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block text-xs">
                          {cust.planName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {cust.billingCycle}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          cust.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : cust.status === 'Expired'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : cust.status === 'Trial'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                      <div>
                        <span>{cust.nextRenewalDate}</span>
                        {cust.daysLeft > 0 && (
                          <span className="text-[10px] text-slate-500 font-normal block">
                            ({cust.daysLeft}d left)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-extrabold text-[#0D1F3D]">
                      ₹{cust.mrr.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{cust.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3 text-center">
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
                            onClick: () => toast.info(`Deleted ${cust.name}`),
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
      </div>
    </div>
  );
}
