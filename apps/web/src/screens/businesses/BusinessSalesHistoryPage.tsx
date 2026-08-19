import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Download,
  CreditCard,
  Search,
  Eye,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { BusinessItem, mockSalesOrders, SalesOrderItem } from './businessesData';

const revenueTrendData = [
  { month: 'Jun 24', revenue: 320000 },
  { month: 'Jul 24', revenue: 410000 },
  { month: 'Aug 24', revenue: 430000 },
  { month: 'Oct 24', revenue: 640000 },
  { month: 'Dec 24', revenue: 680000 },
  { month: 'Jan 25', revenue: 760000 },
  { month: 'Mar 25', revenue: 540000 },
  { month: 'May 25', revenue: 920000 },
];

const orderTypeDistribution = [
  { name: 'Membership', value: 30, pct: '44.1%', color: '#2563EB' },
  { name: 'Service', value: 24, pct: '35.3%', color: '#10B981' },
  { name: 'Product', value: 14, pct: '20.6%', color: '#8B5CF6' },
];

export default function BusinessSalesHistoryPage() {
  const business = useOutletContext<BusinessItem>();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = mockSalesOrders.filter((o) => {
    const matchesSearch = o.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentStatusFilter === 'All' || o.paymentStatus === paymentStatusFilter;
    const matchesType = orderTypeFilter === 'All' || o.orderType === orderTypeFilter;
    return matchesSearch && matchesPayment && matchesType;
  });

  const columns: ColumnDef<SalesOrderItem>[] = [
    {
      header: 'Order / Invoice ID',
      cell: (o) => <span className="font-mono font-bold text-[#0D1F3D]">{o.invoiceId}</span>,
    },
    {
      header: 'Order Date',
      accessorKey: 'orderDate',
      className: 'text-[11px] text-slate-500',
    },
    {
      header: 'Order Type',
      cell: (o) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            o.orderType === 'Service'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : o.orderType === 'Membership'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}
        >
          {o.orderType}
        </span>
      ),
    },
    {
      header: 'Items',
      accessorKey: 'itemsCount',
      align: 'center',
    },
    {
      header: 'Amount (₹)',
      align: 'right',
      cell: (o) => `₹${o.amount.toLocaleString()}`,
    },
    {
      header: 'Discount (₹)',
      align: 'right',
      className: 'text-slate-500',
      cell: (o) => `₹${o.discount.toLocaleString()}`,
    },
    {
      header: 'Tax (₹)',
      align: 'right',
      className: 'text-slate-500',
      cell: (o) => `₹${o.tax.toLocaleString()}`,
    },
    {
      header: 'Total (₹)',
      align: 'right',
      cell: (o) => <span className="font-bold text-[#0D1F3D]">₹{o.total.toLocaleString()}</span>,
    },
    {
      header: 'Payment Status',
      align: 'center',
      cell: (o) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            o.paymentStatus === 'Paid'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          ✓ {o.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      cell: (o) => (
        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          {o.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (o) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing invoice ${o.invoiceId}`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.success(`Downloading invoice ${o.invoiceId}`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Sub Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-600" /> Business Sales History
          </h2>
          <p className="text-xs text-slate-500">View all sales, invoices, and payments received from this business.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting sales invoices...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('Opening Payment Summary...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <CreditCard className="h-4 w-4" /> Payment Summary
          </Button>
        </div>
      </div>

      {/* Sales Header Banner */}
      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 text-xs font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block">Business ID</span>
            <span className="font-mono text-[#0D1F3D] font-bold">{business.id}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Phone</span>
            <span className="text-[#0D1F3D] font-bold">{business.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Revenue</span>
            <span className="text-emerald-700 font-extrabold text-sm">₹ 50,75,000</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Orders</span>
            <span className="text-[#0D1F3D] font-extrabold text-sm">68</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Sales Manager</span>
            <span className="text-[#0D1F3D] font-bold">{business.assignedToName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Last Order</span>
            <span className="text-[#0D1F3D] font-bold">May 17, 2025</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs font-semibold">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order / Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
            />
          </div>

          <Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            options={[
              { label: 'All Payment Statuses', value: 'All' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Partially Paid', value: 'Partially Paid' },
              { label: 'Pending', value: 'Pending' },
            ]}
          />

          <Select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            options={[
              { label: 'All Order Types', value: 'All' },
              { label: 'Service', value: 'Service' },
              { label: 'Membership', value: 'Membership' },
              { label: 'Product', value: 'Product' },
            ]}
          />
        </div>
      </div>

      {/* Main Content Grid: DataTable (9 Cols) + Sales Summary Sidebar (3 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(o) => o.id}
            pagination={{
              currentPage,
              totalPages: 7,
              totalEntries: 68,
              pageSize: 10,
              onPageChange: (p) => setCurrentPage(p),
            }}
          />
        </div>

        {/* Right Sidebar Sales Summary (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">Sales Summary</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-emerald-50 p-2 border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Total Revenue</span>
                <span className="font-extrabold text-emerald-700 text-xs">₹ 50,75,000</span>
              </div>
              <div className="rounded-md bg-blue-50 p-2 border border-blue-100">
                <span className="text-[10px] text-slate-500 block">Total Orders</span>
                <span className="font-extrabold text-blue-700 text-xs">68</span>
              </div>
              <div className="rounded-md bg-purple-50 p-2 border border-purple-100">
                <span className="text-[10px] text-slate-500 block">Avg Order Value</span>
                <span className="font-extrabold text-purple-700 text-xs">₹ 7,466</span>
              </div>
              <div className="rounded-md bg-amber-50 p-2 border border-amber-100">
                <span className="text-[10px] text-slate-500 block">Outstanding</span>
                <span className="font-extrabold text-amber-700 text-xs">₹ 2,350</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Revenue Trend (12 Months)</h3>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Top Order Types</h3>
            <div className="flex items-center justify-center">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {orderTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1 text-xs font-semibold text-slate-600">
              {orderTypeDistribution.map((t) => (
                <div key={t.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{t.value} ({t.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
