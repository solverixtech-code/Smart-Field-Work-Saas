import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Download,
  CreditCard,
  Search,
  Eye,
  X,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Building2,
  CheckCircle2,
  Receipt,
  Percent,
  UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { useCrmQuery } from '../../features/crm/CrmContext';

export interface SalesOrderItem {
  id: string;
  invoiceId: string;
  orderDate: string;
  orderType: string;
  itemsCount: number;
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: string;
  status: string;
  paymentMode?: string;
  assignedExecutive?: string;
  description?: string;
}

export function formatDisplayId(id?: string | null, prefix = 'BIZ'): string {
  if (!id) return `${prefix}-NEW`;
  if (id.startsWith(`${prefix}-`) || (id.length <= 8 && !id.includes('-'))) return id;
  const clean = id.replace(/-/g, '').toUpperCase();
  return `${prefix}-${clean.slice(-6)}`;
}

const ORDER_COLORS: Record<string, string> = {
  'SaaS Subscription': '#2563EB',
  'Field Work Setup': '#10B981',
  'Hardware & Devices': '#8B5CF6',
  'Maintenance Contract': '#F59E0B',
  'Consultation': '#0D1F3D',
  Service: '#10B981',
  Membership: '#2563EB',
  Product: '#8B5CF6',
  Default: '#64748B',
};

export default function BusinessSalesHistoryPage() {
  const context = useOutletContext<any>();
  const navigate = useNavigate();
  const business = context?.business || context || {};
  const businessId = business?.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Dynamic CRM Deals Query ---
  const dealsQuery = useCrmQuery(
    JSON.stringify(['business-deals', businessId]),
    (service, signal) =>
      service.deals({ limit: 100 }, signal).catch(() => ({ items: [], total: 0 })),
  );

  // --- Dynamic Executive Owners Query ---
  const ownersQuery = useCrmQuery('executive-owners-list', (service, signal) =>
    service.owners({}, signal).catch(() => []),
  );

  const executiveOptions = useMemo(() => {
    const defaultManager = business.assignedToName || 'Amit Sharma';
    const list = Array.isArray(ownersQuery.data) ? ownersQuery.data : [];
    const mapped = list.map((owner: any) => ({
      label: `${owner.displayName} (${owner.role || 'Executive'})`,
      value: owner.displayName,
      avatar: owner.avatarUrl,
      sublabel: owner.role,
    }));

    if (!mapped.some((m) => m.value === defaultManager)) {
      mapped.unshift({
        label: `${defaultManager} (Assigned Account Manager)`,
        value: defaultManager,
        avatar: undefined,
        sublabel: 'Account Manager',
      });
    }
    return mapped;
  }, [ownersQuery.data, business.assignedToName]);

  // --- Dynamic Local Sales / Orders State ---
  const [localSales, setLocalSales] = useState<SalesOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(`visiblo_biz_sales_${businessId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Combine real CRM deals with locally recorded sales orders (no raw UUIDs)
  const allOrders = useMemo<SalesOrderItem[]>(() => {
    const crmOrders: SalesOrderItem[] = (dealsQuery.data?.items || [])
      .filter((d: any) => {
        if (!businessId) return false;
        return (
          d.accountId === businessId ||
          d.account?.id === businessId ||
          (d.lead?.businessName && business.name && d.lead.businessName.toLowerCase() === business.name.toLowerCase())
        );
      })
      .map((d: any) => {
        const isWon = d.stage === 'WON';
        const isLost = d.stage === 'LOST';
        const rawDate = d.closedAt || d.createdAt;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Recent';
        const cleanInvCode = d.dealCode || `INV-2026-${d.id.replace(/-/g, '').slice(-4).toUpperCase()}`;
        return {
          id: d.id,
          invoiceId: cleanInvCode,
          orderDate: formattedDate,
          orderType: d.stageValue?.name || d.priority || 'SaaS Subscription',
          itemsCount: 1,
          amount: d.amount || 0,
          discount: 0,
          tax: Math.round((d.amount || 0) * 0.18),
          total: d.amount || 0,
          paymentStatus: isWon ? 'Paid' : isLost ? 'Cancelled' : 'Pending',
          status: isWon ? 'Completed' : isLost ? 'Closed Lost' : 'In Progress',
          assignedExecutive: d.ownerMembership?.displayName || d.assignedMembership?.displayName || business.assignedToName,
          description: d.title || 'CRM Deal Order',
        };
      });

    return [...localSales, ...crmOrders];
  }, [dealsQuery.data, localSales, businessId, business.name, business.assignedToName]);

  // --- Filtered Orders ---
  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const matchesSearch = o.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.orderType && o.orderType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPayment = paymentStatusFilter === 'All' || o.paymentStatus === paymentStatusFilter;
      const matchesType = orderTypeFilter === 'All' || o.orderType === orderTypeFilter;
      return matchesSearch && matchesPayment && matchesType;
    });
  }, [allOrders, searchTerm, paymentStatusFilter, orderTypeFilter]);

  // --- Dynamic Summary Metrics ---
  const totalOrders = allOrders.length;
  const wonOrders = allOrders.filter((o) => o.paymentStatus === 'Paid' || o.status === 'Completed');
  const totalRevenue = wonOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const outstanding = allOrders
    .filter((o) => o.paymentStatus === 'Pending')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const lastOrder = allOrders.length > 0 ? allOrders.at(0)?.orderDate : 'No orders yet';

  // --- Dynamic Revenue Trend Chart ---
  const revenueTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result: { month: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${monthNames.at(d.getMonth())} ${String(d.getFullYear()).slice(-2)}`;
      result.push({ month: mKey, revenue: 0 });
    }

    allOrders.forEach((o) => {
      if (o.paymentStatus === 'Paid' || o.status === 'Completed') {
        const parts = o.orderDate.split(' ');
        if (parts.length === 3) {
          const m = parts.at(1);
          const y = parts.at(2)?.slice(-2);
          const key = `${m} ${y}`;
          const match = result.find((r) => r.month === key);
          if (match) {
            match.revenue += o.total;
          }
        }
      }
    });

    return result;
  }, [allOrders]);

  // --- Dynamic Order Type Distribution ---
  const orderTypeDistribution = useMemo(() => {
    if (allOrders.length === 0) return [];
    const counts: Record<string, number> = {};
    allOrders.forEach((o) => {
      counts[o.orderType] = (counts[o.orderType] || 0) + 1;
    });

    return Object.entries(counts).map(([name, val]) => {
      const pct = `${((val / allOrders.length) * 100).toFixed(1)}%`;
      const color = ORDER_COLORS[name] || ORDER_COLORS.Default;
      return { name, value: val, pct, color };
    });
  }, [allOrders]);

  // --- Add Sale / Order Modal State & Calculation ---
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newInvoiceId, setNewInvoiceId] = useState('');
  const [newOrderCategory, setNewOrderCategory] = useState('SaaS Subscription');
  const [newPackageName, setNewPackageName] = useState('Visiblo SaaS Platform License (Annual)');
  const [newOrderAmount, setNewOrderAmount] = useState('45000');
  const [newGstRate, setNewGstRate] = useState('18');
  const [newOrderPayment, setNewOrderPayment] = useState('Paid');
  const [newPaymentMode, setNewPaymentMode] = useState('UPI / Instant Transfer');
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  );
  const [newAssignedExecutive, setNewAssignedExecutive] = useState(
    business.assignedToName || 'Amit Sharma',
  );
  const [newPoNumber, setNewPoNumber] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SalesOrderItem | null>(null);

  // Auto-generate clean invoice ID on opening modal
  const handleOpenAddOrderModal = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setNewInvoiceId(`INV-2026-${randomCode}`);
    setIsAddOrderOpen(true);
  };

  const parsedSubtotal = parseFloat(newOrderAmount) || 0;
  const parsedTaxRate = parseFloat(newGstRate) || 0;
  const calculatedTax = Math.round(parsedSubtotal * (parsedTaxRate / 100));
  const calculatedGrandTotal = parsedSubtotal + calculatedTax;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSubtotal <= 0) {
      toast.error('Please enter a valid order amount.');
      return;
    }

    const newOrder: SalesOrderItem = {
      id: `ord-${Date.now()}`,
      invoiceId: newInvoiceId.trim() || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date(newOrderDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      orderType: newOrderCategory,
      itemsCount: 1,
      amount: parsedSubtotal,
      discount: 0,
      tax: calculatedTax,
      total: calculatedGrandTotal,
      paymentStatus: newOrderPayment,
      status: newOrderPayment === 'Paid' ? 'Completed' : 'In Progress',
      paymentMode: newOrderPayment === 'Paid' ? newPaymentMode : undefined,
      assignedExecutive: newAssignedExecutive,
      description: newPackageName.trim() || newOrderCategory,
    };

    const updated = [newOrder, ...localSales];
    setLocalSales(updated);
    try {
      localStorage.setItem(`visiblo_biz_sales_${businessId}`, JSON.stringify(updated));
    } catch {}
    setIsAddOrderOpen(false);
    toast.success(`Sales invoice ${newOrder.invoiceId} created successfully!`);
  };

  const handleDeleteOrder = (id: string) => {
    const updated = localSales.filter((o) => o.id !== id);
    setLocalSales(updated);
    try {
      localStorage.setItem(`visiblo_biz_sales_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success('Sales order deleted.');
  };

  const columns: ColumnDef<SalesOrderItem>[] = [
    {
      header: 'Order / Invoice ID',
      cell: (o) => (
        <div>
          <span className="font-mono font-bold text-[#0D1F3D] text-xs block">{o.invoiceId}</span>
          {o.description && (
            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">{o.description}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Order Date',
      accessorKey: 'orderDate',
      className: 'text-[11px] text-slate-500 font-medium whitespace-nowrap',
    },
    {
      header: 'Order Type',
      cell: (o) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold border whitespace-nowrap ${
            o.orderType.includes('Service') || o.orderType.includes('Setup')
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : o.orderType.includes('Subscription') || o.orderType.includes('Membership')
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}
        >
          {o.orderType}
        </span>
      ),
    },
    {
      header: 'Subtotal (₹)',
      align: 'right',
      cell: (o) => `₹${o.amount.toLocaleString()}`,
    },
    {
      header: 'GST Tax (₹)',
      align: 'right',
      className: 'text-slate-500',
      cell: (o) => `₹${o.tax.toLocaleString()}`,
    },
    {
      header: 'Total Payable (₹)',
      align: 'right',
      cell: (o) => <span className="font-bold text-[#0D1F3D]">₹{o.total.toLocaleString()}</span>,
    },
    {
      header: 'Payment Status',
      align: 'center',
      cell: (o) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border whitespace-nowrap ${
            o.paymentStatus === 'Paid'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : o.paymentStatus === 'Pending'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
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
        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 whitespace-nowrap">
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
            type="button"
            onClick={() => setSelectedInvoice(o)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
            title="View Invoice Summary"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => toast.success(`Downloading invoice ${o.invoiceId}...`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          {localSales.some((ls) => ls.id === o.id) && (
            <button
              type="button"
              onClick={() => handleDeleteOrder(o.id)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
              title="Delete Order"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
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
            onClick={handleOpenAddOrderModal}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4" /> Add Sale / Order
          </Button>
        </div>
      </div>

      {/* Sales Header Banner (No raw UUIDs) */}
      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 text-xs font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Business ID</span>
            <span className="font-mono text-[#0D1F3D] font-bold">
              {formatDisplayId(business.id, 'BIZ')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Phone</span>
            <span className="text-[#0D1F3D] font-bold">{business.phone || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Total Revenue</span>
            <span className="text-emerald-700 font-extrabold text-sm">₹ {totalRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Total Orders</span>
            <span className="text-[#0D1F3D] font-extrabold text-sm">{totalOrders}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Sales Manager</span>
            <span className="text-[#0D1F3D] font-bold">{business.assignedToName || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Last Order</span>
            <span className="text-[#0D1F3D] font-bold">{lastOrder}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs font-semibold">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Order / Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2 text-xs font-semibold text-[#0D1F3D] placeholder:text-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            options={[
              { label: 'All Payment Statuses', value: 'All' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
          />

          <Select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            options={[
              { label: 'All Order Types', value: 'All' },
              { label: 'SaaS Subscription', value: 'SaaS Subscription' },
              { label: 'Field Work Setup', value: 'Field Work Setup' },
              { label: 'Hardware & Devices', value: 'Hardware & Devices' },
              { label: 'Maintenance Contract', value: 'Maintenance Contract' },
              { label: 'Consultation', value: 'Consultation' },
            ]}
          />
        </div>
      </div>

      {/* Main Content Grid: DataTable (9 Cols) + Sales Summary Sidebar (3 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {filteredOrders.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredOrders}
              keyExtractor={(o) => o.id}
              density="relaxed"
              pagination={{
                currentPage,
                totalPages: Math.ceil(filteredOrders.length / 10) || 1,
                totalEntries: filteredOrders.length,
                pageSize: 10,
                onPageChange: (p) => setCurrentPage(p),
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0D1F3D] mb-1">No sales orders or deals found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No orders have been recorded for {business.name || 'this business'} yet. Record a sale now or manage deals in the Sales Pipeline.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddOrderModal}
                  className="text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Sale / Order
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/sales/pipeline')}
                  className="text-xs font-bold border-slate-200"
                >
                  Open Sales Pipeline →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Sales Summary (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">Sales Summary</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-emerald-50 p-2 border border-emerald-100">
                <span className="text-[10px] text-slate-500 block font-medium">Total Revenue</span>
                <span className="font-extrabold text-emerald-700 text-xs">₹ {totalRevenue.toLocaleString()}</span>
              </div>
              <div className="rounded-md bg-blue-50 p-2 border border-blue-100">
                <span className="text-[10px] text-slate-500 block font-medium">Total Orders</span>
                <span className="font-extrabold text-blue-700 text-xs">{totalOrders}</span>
              </div>
              <div className="rounded-md bg-purple-50 p-2 border border-purple-100">
                <span className="text-[10px] text-slate-500 block font-medium">Avg Value</span>
                <span className="font-extrabold text-purple-700 text-xs">₹ {avgOrderValue.toLocaleString()}</span>
              </div>
              <div className="rounded-md bg-amber-50 p-2 border border-amber-100">
                <span className="text-[10px] text-slate-500 block font-medium">Outstanding</span>
                <span className="font-extrabold text-amber-700 text-xs">₹ {outstanding.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Revenue Trend (6 Months)</h3>
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
            {orderTypeDistribution.length > 0 ? (
              <>
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
              </>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No order types recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: High-End Enterprise Create Sale / Order Modal */}
      <Modal
        isOpen={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        title="Create Sale / Order"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 py-1 text-xs">
          {/* Selected Business Context Card */}
          <div className="rounded-md border border-blue-100 bg-gradient-to-r from-blue-50/70 to-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0D1F3D] text-white shrink-0 shadow-xs">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0D1F3D]">{business.name || 'Account'}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {business.businessType || 'Merchant Account'} •{' '}
                    <span className="font-mono text-slate-600 font-semibold">
                      {formatDisplayId(business.id, 'BIZ')}
                    </span>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                {business.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-blue-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Contact Person</span>
                <span className="font-bold text-[#0D1F3D] truncate block">
                  {business.contactPerson || business.primaryContact?.name || 'Primary Contact'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Contact Phone</span>
                <span className="font-mono font-semibold text-slate-800">{business.phone || 'Not set'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Assigned Executive</span>
                <span className="font-bold text-[#0D1F3D] truncate block">
                  {business.assignedToName || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Order & Commercial Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Invoice / Order ID *</label>
              <input
                type="text"
                value={newInvoiceId}
                onChange={(e) => setNewInvoiceId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <Select
                label="Order Category *"
                value={newOrderCategory}
                onChange={(e) => setNewOrderCategory(e.target.value)}
                options={[
                  { label: 'SaaS Subscription Plan', value: 'SaaS Subscription' },
                  { label: 'Field Work Setup & Integration', value: 'Field Work Setup' },
                  { label: 'Hardware & Devices Package', value: 'Hardware & Devices' },
                  { label: 'Annual Maintenance Contract (AMC)', value: 'Maintenance Contract' },
                  { label: 'Consultation & Implementation', value: 'Consultation' },
                ]}
              />
            </div>

            <div>
              <DatePicker
                label="Order Date *"
                value={newOrderDate}
                onChange={(dateStr) => setNewOrderDate(dateStr)}
              />
            </div>
          </div>

          {/* Section 2: Package Description & Executive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Item / Package Description *</label>
              <input
                type="text"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
                placeholder="e.g. Visiblo Annual Enterprise Plan - 10 Licenses"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                required
              />
            </div>

            <div>
              <Select
                label="Sales Executive (Closed By) *"
                searchable={true}
                value={newAssignedExecutive}
                onChange={(e) => setNewAssignedExecutive(e.target.value)}
                options={executiveOptions}
              />
            </div>
          </div>

          {/* Section 3: Pricing & Tax Breakdown */}
          <div className="rounded-md border border-slate-200 p-3.5 bg-slate-50/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Subtotal Amount (₹) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={newOrderAmount}
                    onChange={(e) => setNewOrderAmount(e.target.value)}
                    placeholder="45000"
                    className="w-full rounded-md border border-slate-200 pl-7 pr-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Select
                  label="GST / Tax Rate *"
                  value={newGstRate}
                  onChange={(e) => setNewGstRate(e.target.value)}
                  options={[
                    { label: '18% GST (Standard Services)', value: '18' },
                    { label: '12% GST (Hardware / Devices)', value: '12' },
                    { label: '5% GST (Special Category)', value: '5' },
                    { label: '0% (Tax Exempt)', value: '0' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Payment Status *"
                  value={newOrderPayment}
                  onChange={(e) => setNewOrderPayment(e.target.value)}
                  options={[
                    { label: 'Paid (Settled)', value: 'Paid' },
                    { label: 'Pending (Awaiting Payment)', value: 'Pending' },
                    { label: 'Partially Paid', value: 'Partially Paid' },
                  ]}
                />
              </div>
            </div>

            {/* Live Calculation Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white border border-slate-200 p-2.5 text-xs font-semibold">
              <div className="flex items-center gap-4 text-slate-600">
                <span>Subtotal: <strong className="text-[#0D1F3D]">₹{parsedSubtotal.toLocaleString()}</strong></span>
                <span>GST ({parsedTaxRate}%): <strong className="text-[#0D1F3D]">₹{calculatedTax.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                <span className="text-[11px] font-bold">Total Payable:</span>
                <span className="text-sm font-extrabold font-mono">₹{calculatedGrandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Mode & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newOrderPayment !== 'Pending' ? (
              <div>
                <Select
                  label="Payment Mode *"
                  value={newPaymentMode}
                  onChange={(e) => setNewPaymentMode(e.target.value)}
                  options={[
                    { label: 'UPI / Instant Transfer', value: 'UPI / Instant Transfer' },
                    { label: 'Bank NEFT / RTGS', value: 'Bank NEFT / RTGS' },
                    { label: 'Corporate Credit Card', value: 'Corporate Credit Card' },
                    { label: 'Cheque / Demand Draft', value: 'Cheque / Demand Draft' },
                    { label: 'Cash Receipt', value: 'Cash Receipt' },
                  ]}
                />
              </div>
            ) : (
              <div>
                <DatePicker
                  label="Payment Due Date"
                  value={newDueDate}
                  onChange={(dateStr) => setNewDueDate(dateStr)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Customer PO / Ref Number (Optional)</label>
              <input
                type="text"
                value={newPoNumber}
                onChange={(e) => setNewPoNumber(e.target.value)}
                placeholder="e.g. PO-88992"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Order Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Internal Order Notes (Optional)</label>
            <textarea
              rows={2}
              value={newOrderNotes}
              onChange={(e) => setNewOrderNotes(e.target.value)}
              placeholder="Any specific delivery terms, billing agreements, or client instructions..."
              className="w-full rounded-md border border-slate-200 p-2 text-xs font-medium text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Transaction will be recorded under <strong className="text-slate-700">{business.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOrderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#E20613] hover:bg-red-700 text-white font-bold">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Save & Issue Order
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Invoice Details (Clean formatted IDs) */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice Details — ${selectedInvoice.invoiceId}`}
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Invoice Top Meta */}
            <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business:</span>
                <span className="font-bold text-[#0D1F3D] text-sm">{business.name || 'Account'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business Code:</span>
                <span className="font-mono font-bold text-slate-700">{formatDisplayId(business.id, 'BIZ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Invoice Date:</span>
                <span className="font-bold text-[#0D1F3D]">{selectedInvoice.orderDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Order Category:</span>
                <span className="font-bold text-[#0D1F3D]">{selectedInvoice.orderType}</span>
              </div>
              {selectedInvoice.description && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Description:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.description}</span>
                </div>
              )}
              {selectedInvoice.assignedExecutive && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Executive:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.assignedExecutive}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                    selectedInvoice.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  ✓ {selectedInvoice.paymentStatus}
                </span>
              </div>
            </div>

            {/* Financial Line Items */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">₹{selectedInvoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span>₹{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#0D1F3D] border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="text-emerald-700">₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Downloading PDF for ${selectedInvoice.invoiceId}...`)}
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
