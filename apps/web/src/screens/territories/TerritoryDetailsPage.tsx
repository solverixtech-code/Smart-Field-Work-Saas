import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Users,
  Target,
  ShoppingBag,
  Building,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Download,
  Map as MapIcon,
  CheckCircle2,
  PieChart,
  Search,
  Filter,
  Zap,
  Phone,
  Mail,
  Award,
  FileText,
  Check,
  X,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DateRangePicker, DateRange } from '../../components/ui/DateRangePicker';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import {
  TerritoryItem,
  TerritoryBusiness,
  TerritoryExecutive,
  mapTerritoryDtoToItem,
} from './territoriesData';
import { crmApi } from '../../features/crm/crm.api';
import { crmError } from '../../features/crm/crm.state';
import type { AccountDto, TerritoryDto, TerritoryPerformanceDto } from '../../features/crm/crm.types';

export default function TerritoryDetailsPage({ initialTab = 'Overview' }: { initialTab?: string }) {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  const [liveTerritory, setLiveTerritory] = useState<TerritoryItem | null>(null);
  const [territoryDto, setTerritoryDto] = useState<TerritoryDto | null>(null);
  const [territoryExecutives, setTerritoryExecutives] = useState<TerritoryExecutive[]>([]);
  const [performance, setPerformance] = useState<TerritoryPerformanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableBusinesses, setAvailableBusinesses] = useState<AccountDto[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingBusiness, setSavingBusiness] = useState(false);

  React.useEffect(() => {
    if (territoryId) {
      const controller = new AbortController();
      setLoading(true);
      setLoadError(null);
      setLiveTerritory(null);
      setTerritoryDto(null);
      setTerritoryExecutives([]);
      setBusinessesList([]);
      setPerformance(null);
      setAvailableBusinesses([]);
      crmApi
        .territory(territoryId, controller.signal)
        .then(async (data) => {
          if (!controller.signal.aborted) {
            setTerritoryDto(data);
            setLiveTerritory(mapTerritoryDtoToItem(data));
            setTargetPeriodFilter(data.targets?.[0]?.period ?? new Date().toISOString().slice(0, 7));
            setTerritoryExecutives((data.members ?? []).map((member) => ({
              id: member.membershipId,
              name: member.membership?.user?.fullName ?? 'Unknown executive',
              avatar: member.membership?.user?.avatarUrl ?? '',
              role: member.membership?.tenantRole?.name ?? member.role,
              phone: member.membership?.user?.mobile ?? '',
              team: member.membership?.team?.name ?? '—',
              visitsCount: 0,
              revenue: 0,
              revenueFormatted: '₹ 0',
              performancePercentage: 0,
              status: 'Offline',
            })));
            try {
              const [accounts, result] = await Promise.all([
                crmApi.territoryBusinesses(data.id, controller.signal),
                crmApi.territoryPerformance(data.id, controller.signal),
              ]);
              if (!controller.signal.aborted) {
                setPerformance(result);
                setBusinessesList(accounts.map((account) => ({
                  id: account.id,
                  name: account.name,
                  businessType: account.categoryLabel ?? '—',
                  category: account.categoryLabel ?? 'Others',
                  contactPerson: account.contacts?.[0]?.name ?? '—',
                  contactRole: '—',
                  phone: account.contacts?.[0]?.phone ?? '',
                  email: account.contacts?.[0]?.email ?? '',
                  address: [account.addressLine1, account.city, account.postalCode].filter(Boolean).join(', '),
                  assignedToName: account.ownerMembership?.user?.fullName ?? 'Unassigned',
                  assignedToAvatar: account.ownerMembership?.user?.avatarUrl ?? '',
                  lastVisitDate: '—',
                  status: account.status === 'ACTIVE' ? 'Active' : account.status === 'BLOCKED' ? 'Blocked' : 'Inactive',
                })));
              }
            } catch (cause) {
              if (!controller.signal.aborted) setLoadError(crmError(cause).message);
            }
          }
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) setLoadError(crmError(cause).message);
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
      return () => controller.abort();
    }
    setLoadError('Territory ID is missing.');
    setLoading(false);
  }, [territoryId, refreshKey]);

  // Active Tab State (No page jump - seamlessly renders under tab header)
  const [activeTab, setActiveTab] = useState(initialTab);
  React.useEffect(() => setActiveTab(initialTab), [initialTab]);

  // Link Existing Business Modal State
  const [isLinkBusinessModalOpen, setIsLinkBusinessModalOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [selectedLinkBizId, setSelectedLinkBizId] = useState('');
  const [linkAssignedExec, setLinkAssignedExec] = useState('');

  // Performance Filters State
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    label: 'Current month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [compareFilter, setCompareFilter] = useState('none');

  // Business Tab Search & Filter State
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedBusinessStatus, setSelectedBusinessStatus] = useState('All');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();

  // Executives Tab State
  const [execSearchQuery, setExecSearchQuery] = useState('');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedExecIds, setSelectedExecIds] = useState<string[]>([]);
  const [assignmentCandidates, setAssignmentCandidates] = useState<TerritoryExecutive[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentRetry, setAssignmentRetry] = useState(0);
  const [savingAssignments, setSavingAssignments] = useState(false);

  // Map Layers Toggle State
  const [showBoundary, setShowBoundary] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [showActiveBusinesses, setShowActiveBusinesses] = useState(true);
  const [showLeads, setShowLeads] = useState(true);
  const [showVisitedLocations, setShowVisitedLocations] = useState(true);
  const [showExecutives, setShowExecutives] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Targets Tab State
  const [targetPeriodFilter, setTargetPeriodFilter] = useState(new Date().toISOString().slice(0, 7));
  const [targetMetricType, setTargetMetricType] = useState('all');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [editingTargetExec, setEditingTargetExec] = useState<TerritoryExecutive | null>(null);
  const [targetRevenueInput, setTargetRevenueInput] = useState('0');
  const [targetVisitInput, setTargetVisitInput] = useState('0');

  // Businesses List State
  const [businessesList, setBusinessesList] = useState<TerritoryBusiness[]>([]);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [newBusinessData, setNewBusinessData] = useState({
    name: '',
    category: 'Retail',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    assignedExecutive: '',
    status: 'Active',
  });

  const territory = liveTerritory;
  const businessCandidates = availableBusinesses.map((account) => ({
    id: account.id,
    name: account.name,
    businessType: account.businessType ?? '—',
    contactPerson: account.primaryContact?.name ?? '—',
    city: account.city ?? '',
    fullAddress: [account.addressLine1, account.city].filter(Boolean).join(', '),
    address: account.addressLine1 ?? '',
    category: account.categoryLabel ?? 'Others',
    contactRole: account.primaryContact?.role ?? '—',
    phone: account.primaryContact?.phone ?? '',
    email: account.primaryContact?.email ?? '',
    annualRevenue: '',
  }));
  const filteredBusinessCandidates = businessCandidates.filter((business) =>
    `${business.name} ${business.contactPerson} ${business.city}`.toLowerCase().includes(linkSearchQuery.toLowerCase()),
  );

  React.useEffect(() => {
    if (!isLinkBusinessModalOpen) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      crmApi.accounts({ search: linkSearchQuery, page: 1, limit: 50 }, controller.signal)
        .then((page) => { if (!controller.signal.aborted) setAvailableBusinesses(page.items); })
        .catch((cause: unknown) => { if (!controller.signal.aborted) toast.error(crmError(cause).message); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isLinkBusinessModalOpen, linkSearchQuery]);

  React.useEffect(() => {
    if (!isAssignModalOpen) return;
    const controller = new AbortController();
    setAssignmentLoading(true);
    setAssignmentError(null);
    const timer = window.setTimeout(() => {
      crmApi.territoryMemberOptions({ limit: 100, search: assignmentSearch.trim() || undefined }, controller.signal)
        .then((page) => {
          if (controller.signal.aborted) return;
          setAssignmentCandidates((current) => {
            const options = new Map(current.map((candidate) => [candidate.id, candidate]));
            for (const owner of page.items) {
              options.set(owner.id, {
                id: owner.id, name: owner.displayName, avatar: owner.avatarUrl ?? '',
                role: owner.role ?? '', phone: '', team: '—', visitsCount: 0,
                revenue: 0, revenueFormatted: '₹ 0', performancePercentage: 0, status: 'Offline',
              });
            }
            return [...options.values()];
          });
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) setAssignmentError(crmError(cause).message);
        })
        .finally(() => { if (!controller.signal.aborted) setAssignmentLoading(false); });
    }, assignmentSearch ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isAssignModalOpen, assignmentSearch, assignmentRetry]);

  const assignedMemberIds = new Set(territoryDto?.members?.map((member) => member.membershipId) ?? []);
  const assignmentOptions = new Map(assignmentCandidates.map((candidate) => [candidate.id, candidate]));
  for (const member of territoryDto?.members ?? []) {
    if (!assignmentOptions.has(member.membershipId)) {
      assignmentOptions.set(member.membershipId, {
        id: member.membershipId,
        name: member.membership?.user?.fullName ?? 'Unknown member',
        avatar: member.membership?.user?.avatarUrl ?? '',
        role: member.membership?.tenantRole?.name ?? member.role,
        phone: '', team: member.membership?.team?.name ?? '—', visitsCount: 0,
        revenue: 0, revenueFormatted: '₹ 0', performancePercentage: 0, status: 'Offline',
      });
    }
  }
  const allAssignmentOptions = [...assignmentOptions.values()];
  const visibleAssignmentOptions = allAssignmentOptions.filter((candidate) =>
    candidate.name.toLowerCase().includes(assignmentSearch.trim().toLowerCase()),
  );
  const selectedExecutiveMember = territoryDto?.members?.find((member) => member.membershipId === selectedExecutiveId);
  const hasAssignmentChanges = selectedExecIds.length !== assignedMemberIds.size
    || selectedExecIds.some((id) => !assignedMemberIds.has(id));

  const saveExecutiveAssignments = async () => {
    if (!territoryDto || savingAssignments || !hasAssignmentChanges) return;
    setSavingAssignments(true);
    setAssignmentError(null);
    const existing = new Set(territoryDto.members?.map((member) => member.membershipId) ?? []);
    const selected = new Set(selectedExecIds);
    const changes = [
      ...[...selected].filter((id) => !existing.has(id)).map((id) => crmApi.assignTerritoryMember(territoryDto.id, { membershipId: id })),
      ...[...existing].filter((id) => !selected.has(id)).map((id) => crmApi.unassignTerritoryMember(territoryDto.id, id)),
    ];
    try {
      const results = await Promise.allSettled(changes);
      setRefreshKey((value) => value + 1);
      if (results.some((result) => result.status === 'rejected')) {
        setAssignmentError('Some assignments could not be saved. Review the roster and try again.');
      } else {
        setIsAssignModalOpen(false);
        toast.success('Executive assignments updated successfully!');
      }
    } finally {
      setSavingAssignments(false);
    }
  };

  const handleCreateBusiness = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!territoryDto || savingBusiness) return;
    if (!newBusinessData.name.trim() || !newBusinessData.contactPerson.trim() || !newBusinessData.phone.trim()) {
      toast.error('Enter the business name, contact name and phone number.');
      return;
    }
    let createdAccount: AccountDto | null = null;
    try {
      setSavingBusiness(true);
      createdAccount = await crmApi.createAccount({
        name: newBusinessData.name.trim(),
        categoryLabel: newBusinessData.category,
        addressLine1: newBusinessData.address.trim() || null,
        city: territoryDto.city,
        status: newBusinessData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        ownerMembershipId: newBusinessData.assignedExecutive || undefined,
        primaryContact: {
          name: newBusinessData.contactPerson.trim(),
          phone: newBusinessData.phone.trim(),
          email: newBusinessData.email.trim() || null,
        },
      });
      await crmApi.assignTerritoryBusiness(territoryDto.id, createdAccount.id);
      setIsAddBusinessModalOpen(false);
      setRefreshKey((value) => value + 1);
      toast.success(`Business "${createdAccount.name}" added to ${territoryDto.name} successfully!`);
    } catch (cause) {
      if (createdAccount) setIsAddBusinessModalOpen(false);
      toast.error(createdAccount
        ? `Business "${createdAccount.name}" was created but could not be assigned. Find it under existing businesses and retry. ${crmError(cause).message}`
        : crmError(cause).message);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleAssignBusiness = async () => {
    if (!territoryDto || !selectedLinkBizId || savingBusiness) return;
    const account = availableBusinesses.find((item) => item.id === selectedLinkBizId);
    if (!account) return;
    let assigned = false;
    try {
      setSavingBusiness(true);
      await crmApi.assignTerritoryBusiness(territoryDto.id, account.id);
      assigned = true;
      if (linkAssignedExec && linkAssignedExec !== account.ownerMembershipId) {
        await crmApi.updateAccount(account.id, { expectedRevision: account.revision + 1, name: account.name, ownerMembershipId: linkAssignedExec });
      }
      setIsLinkBusinessModalOpen(false);
      setRefreshKey((value) => value + 1);
      toast.success(`Business "${account.name}" assigned to ${territoryDto.name}!`);
    } catch (cause) {
      setRefreshKey((value) => value + 1);
      toast.error(assigned
        ? `Business assigned, but its executive could not be updated. ${crmError(cause).message}`
        : crmError(cause).message);
    } finally {
      setSavingBusiness(false);
    }
  };

  const exportTerritory = () => {
    if (!territoryDto) return;
    const blob = new Blob([JSON.stringify({ territory: territoryDto, businesses: businessesList }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `territory-${territoryDto.code.replace(/[^a-z0-9-]/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredBusinesses = businessesList.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
      b.businessType.toLowerCase().includes(businessSearchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || b.category === selectedCategoryFilter;
    const matchesStatus =
      selectedBusinessStatus === 'All' || b.status === selectedBusinessStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedBusiness =
    businessesList.find((b) => b.id === selectedBusinessId) || businessesList[0] || {
      id: '', name: 'No business selected', businessType: '—', contactPerson: '—',
      contactRole: '—', phone: '', email: '', address: '', assignedToName: '—',
      assignedToAvatar: '', lastVisitDate: '—', status: '—' as const, category: 'Others' as const,
    };

  const filteredExecutives = territoryExecutives.filter(
    (e) =>
      e.name.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
      e.team.toLowerCase().includes(execSearchQuery.toLowerCase()),
  );
  const selectedTarget = territoryDto?.targets?.find((target) => target.period === targetPeriodFilter);
  const overviewTarget = territoryDto?.targets?.[0];
  const activeBusinessTarget = overviewTarget?.activeBusinessTarget ?? 0;
  const targetAmount = Number(selectedTarget?.monthlyTarget ?? 0);
  const achievedAmount = Number(selectedTarget?.monthlyAchieved ?? 0);
  const targetProgress = targetAmount > 0 ? Math.min(100, Math.round(achievedAmount / targetAmount * 100)) : 0;

  if (loading && !territory) return <div role="status" className="p-4 text-sm text-slate-600">Loading territory...</div>;
  if (loadError || !territory) return <div role="alert" className="p-4 text-sm text-rose-700">{loadError ?? 'Territory unavailable.'}</div>;

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Back Link & Top Header Bar */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/territories')}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Territories
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{territory.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {territory.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded-xs">
              Code: {territory.code}
            </span>
            <span className="text-xs font-semibold text-slate-500">{territory.regionArea}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/edit`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Territory
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportTerritory}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Data
            </Button>
          </div>
        </div>

        {/* Territory Manager & Stats Summary Pill Strip */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <Avatar name={territory.managerName} src={territory.managerAvatar} sizeClassName="h-7 w-7" />
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Manager</span>
              <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Team Size</span>
            <span className="font-extrabold text-[#0D1F3D]">14 Executives</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Coverage Area</span>
            <span className="font-extrabold text-[#0D1F3D]">{territory.areaKm2} km²</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Total Businesses</span>
            <span className="font-extrabold text-[#0D1F3D]">{territory.activeBusinessesCount}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Active Businesses</span>
            <span className="font-extrabold text-emerald-600">142</span>
          </div>
        </div>
      </div>

      {/* Horizontal Tab Navigation Bar (Renders content seamlessly inside details page without page jump) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0.5">
        {[
          { id: 'Overview', label: 'Overview' },
          { id: 'Executives', label: 'Executives' },
          { id: 'Targets', label: 'Targets' },
          { id: 'Performance', label: 'Performance Analytics' },
          { id: 'Visits', label: 'Visits Log' },
          { id: 'Businesses', label: 'Leads & Businesses' },
          { id: 'Map', label: 'Map & Boundaries' },
          { id: 'Activities', label: 'Activities Stream' },
          { id: 'Documents', label: 'Documents' },
          { id: 'History', label: 'Audit History' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border-b-2 font-extrabold transition-all whitespace-nowrap cursor-pointer text-xs ${
                isActive
                  ? 'border-purple-600 text-purple-700 bg-transparent'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC SUB-VIEW TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MapKpiCard
              title="Revenue Target (Monthly)"
              value={overviewTarget ? territory.monthlyTargetFormatted : '—'}
              subValue={overviewTarget ? overviewTarget.period : 'No target set'}
              icon={Target}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <MapKpiCard
              title="Revenue Achieved"
              value={overviewTarget ? territory.monthlyAchievedFormatted : '—'}
              subValue={overviewTarget && Number(overviewTarget.monthlyTarget) > 0 ? `${territory.performancePercentage}% of target` : 'No target set'}
              icon={ShoppingBag}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
            />
            <MapKpiCard
              title="Business Target"
              value={activeBusinessTarget > 0 ? activeBusinessTarget : '—'}
              subValue={activeBusinessTarget > 0 ? overviewTarget?.period ?? '' : 'No target set'}
              icon={Building}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
            <MapKpiCard
              title="Active Businesses"
              value={territory.activeBusinessesCount.toString()}
              subValue={activeBusinessTarget > 0 ? `${Math.round(territory.activeBusinessesCount / activeBusinessTarget * 100)}% of target` : 'No target set'}
              icon={Building}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <MapKpiCard
              title="Visits (This Month)"
              value={overviewTarget ? territory.totalVisitsThisMonth.toString() : '—'}
              subValue={overviewTarget ? 'Completed' : 'No visit data'}
              icon={TrendingUp}
              iconBgColor="bg-teal-50"
              iconTextColor="text-teal-600"
            />
            <MapKpiCard
              title="Avg. Performance"
              value={overviewTarget ? `${territory.performancePercentage}%` : '—'}
              subValue={overviewTarget ? 'Across all metrics' : 'No target set'}
              icon={PieChart}
              iconBgColor="bg-rose-50"
              iconTextColor="text-rose-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                    Territory Information
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Territory Name :</span>
                      <span className="font-extrabold text-[#0D1F3D]">{territory.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Territory Code :</span>
                      <span className="font-mono font-bold">{territory.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Region / Area :</span>
                      <span>{territory.regionArea}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">City :</span>
                      <span>{territory.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status :</span>
                      <span className="font-bold text-emerald-600">{territory.status}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-1">Description :</span>
                      <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                        {territory.description || 'No description has been added.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold flex flex-col justify-between">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Boundary</h3>
                  <div className="relative rounded-sm border border-slate-200 overflow-hidden flex-1 min-h-[220px]">
                    <InteractiveMap
                      mode="territories"
                      heightClassName="h-full"
                      territoryPath={territory.pathPoints}
                      compact
                    />
                    {territory.pathPoints.length === 0 && (
                      <div className="pointer-events-none absolute inset-x-2 top-2 z-20 rounded-lg bg-white/95 px-3 py-2 text-center text-[11px] font-semibold text-slate-700 shadow-sm">
                        No boundary has been drawn for this territory.
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 z-20 rounded-sm bg-white/95 border border-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-[#0D1F3D] shadow-sm">
                      Area: {territory.areaKm2} km² | Perimeter: {territory.perimeterKm} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Executives */}
              <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Executives (This Month)</h3>
                  <span className="text-xs font-semibold text-slate-500">Top Performers</span>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-700">
                      <th className="py-2">Executive</th>
                      <th className="py-2 text-center">Visits</th>
                      <th className="py-2 text-right">Revenue (₹)</th>
                      <th className="py-2 text-center">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {territoryExecutives.length === 0 && (
                      <tr><td colSpan={4} className="py-5 text-center text-xs text-slate-600">No executives are assigned to this territory yet.</td></tr>
                    )}
                    {territoryExecutives.map((exec) => (
                      <tr key={exec.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedExecutiveId(exec.id)}
                            aria-label={`View details for ${exec.name}`} className="h-auto min-h-0 gap-2 px-1 py-1 text-left justify-start">
                            <Avatar name={exec.name} src={exec.avatar} sizeClassName="h-6 w-6" />
                            <span className="font-extrabold text-[#0D1F3D]">{exec.name}</span>
                          </Button>
                        </td>
                        <td className="py-2.5 text-center font-bold">{exec.visitsCount}</td>
                        <td className="py-2.5 text-right font-mono font-bold">{exec.revenueFormatted}</td>
                        <td className="py-2.5 text-center w-28">
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(exec.performancePercentage, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold text-center">
                <h3 className="text-xs font-extrabold text-[#0D1F3D] text-left border-b border-slate-100 pb-2">
                  Performance Summary
                </h3>

                <div className="relative py-2 flex flex-col items-center justify-center">
                  <div className="h-28 w-28 rounded-full border-8 border-emerald-500 border-b-slate-100 border-l-emerald-500 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-extrabold text-[#0D1F3D]">{overviewTarget ? `${territory.performancePercentage}%` : '—'}</span>
                    <span className="text-xs font-semibold text-slate-500">{overviewTarget ? 'Overall' : 'No target'}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('Performance')}
                  className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D] mt-2"
                >
                  <span>View Full Analytics Tab</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVES VIEW */}
      {activeTab === 'Executives' && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search executive name or team..."
                value={execSearchQuery}
                onChange={(e) => setExecSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setSelectedExecIds(territoryDto?.members?.map((member) => member.membershipId) ?? []);
                setAssignmentSearch('');
                setAssignmentError(null);
                setAssignmentCandidates([]);
                setIsAssignModalOpen(true);
              }}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Assign Executives
            </Button>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-3">Executive</th>
                  <th className="p-3">Team</th>
                  <th className="p-3 text-center">Visits</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                  <th className="p-3 text-center">Performance</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExecutives.length === 0 && (
                  <tr><td colSpan={6} className="p-5 text-center text-xs text-slate-600">
                    {execSearchQuery ? 'No executives match your search.' : 'No executives are assigned to this territory yet.'}
                  </td></tr>
                )}
                {filteredExecutives.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedExecutiveId(exec.id)}
                        aria-label={`View details for ${exec.name}`} className="h-auto min-h-0 gap-2.5 px-1 py-1 text-left justify-start">
                        <Avatar name={exec.name} src={exec.avatar} sizeClassName="h-7 w-7" />
                        <span>
                          <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                          <span className="text-[10px] text-slate-500 block font-normal">{exec.role}</span>
                        </span>
                      </Button>
                    </td>
                    <td className="p-3 text-slate-600">{exec.team}</td>
                    <td className="p-3 text-center font-bold">{exec.visitsCount}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{exec.revenueFormatted}</td>
                    <td className="p-3 text-center font-extrabold text-blue-600">{exec.performancePercentage}%</td>
                    <td className="p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await crmApi.unassignTerritoryMember(territory.id, exec.id);
                            setRefreshKey((value) => value + 1);
                            toast.success(`Removed ${exec.name} from territory`);
                          } catch (cause) { toast.error(crmError(cause).message); }
                        }}
                        className="text-[10px] py-0.5 px-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TARGETS VIEW */}
      {activeTab === 'Targets' && (
        <div className="space-y-4">
          {/* Header Controls & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select
                  value={targetPeriodFilter}
                  onChange={(e) => setTargetPeriodFilter(e.target.value)}
                  options={(territoryDto?.targets?.length ? territoryDto.targets : [{ period: targetPeriodFilter }]).map((target) => ({ value: target.period, label: target.period }))}
                  searchable={false}
                />
              </div>

              <div className="w-44">
                <Select
                  value={targetMetricType}
                  onChange={(e) => setTargetMetricType(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Metric Targets' },
                    { value: 'revenue', label: 'Revenue Target' },
                    { value: 'visits', label: 'Visit Target' },
                    { value: 'businesses', label: 'Business Goal' },
                  ]}
                  searchable={false}
                />
              </div>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={() => toast.info('Individual executive targets are not available for this territory.')}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] text-white hover:bg-[#07152E]"
            >
              <Plus className="h-3.5 w-3.5" /> Set Executive Targets
            </Button>
          </div>

          {/* Top 4 Target KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MapKpiCard
              title="Revenue Target (Monthly)"
              value={`₹ ${targetAmount.toLocaleString('en-IN')}`}
              subValue={`₹ ${achievedAmount.toLocaleString('en-IN')} Achieved (${targetProgress}%)`}
              icon={Target}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <MapKpiCard
              title="Visit Volume Target"
              value={`${selectedTarget?.visitTarget ?? 0} Visits`}
              subValue={`${selectedTarget?.visitAchieved ?? 0} Completed`}
              icon={TrendingUp}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <MapKpiCard
              title="New Business Goal"
              value={`${selectedTarget?.newBusinessTarget ?? 0} Businesses`}
              subValue={`${selectedTarget?.newBusinessAchieved ?? 0} Acquired`}
              icon={Building}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
            />
            <MapKpiCard
              title="Top Performer Goal"
              value={territory.managerName}
              subValue="Manager"
              icon={Award}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
          </div>

          {/* Territory Target Completion Overview Banner */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Target Progress ({targetPeriodFilter})</h3>
                <p className="text-[11px] font-medium text-slate-500">Overall progress toward monthly revenue & field operational goals</p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
                {targetProgress}% Base Target Completed
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between font-extrabold text-[#0D1F3D]">
                <span>Progress: ₹ {achievedAmount.toLocaleString('en-IN')}</span>
                <span>Target: ₹ {targetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>0%</span>
                <span>50% Milestone</span>
                <span>80% Base Goal</span>
                <span className="text-emerald-600 font-extrabold">100% Target Met</span>
              </div>
            </div>
          </div>

          {/* Detailed Executive Target Matrix Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                Executive Target & Achievement Matrix ({targetPeriodFilter})
              </h3>
              <span className="text-[11px] font-bold text-slate-500">{territoryExecutives.length} Executives Assigned</span>
            </div>

            <div className="space-y-4">
              {territoryExecutives.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-600">No executives are assigned, so there are no individual targets to display.</p>
              )}
              {territoryExecutives.map((exec) => {
                const targetRev = 0;
                const achievedRev = exec.revenue;
                const revPct = targetRev > 0 ? Math.round((achievedRev / targetRev) * 100) : 0;
                const visitTarget = 0;
                const visitsDone = exec.visitsCount;
                const visitPct = visitTarget > 0 ? Math.round((visitsDone / visitTarget) * 100) : 0;
                const isExceeded = revPct >= 100;
                const isOnTrack = revPct >= 85 && revPct < 100;

                return (
                  <div
                    key={exec.id}
                    className="rounded-sm border border-slate-200 bg-slate-50/50 p-3.5 space-y-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={exec.name} src={exec.avatar} sizeClassName="h-8 w-8" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedExecutiveId(exec.id)}
                              aria-label={`View details for ${exec.name}`} className="h-auto min-h-0 px-1 py-1 text-sm font-extrabold text-[#0D1F3D]">
                              {exec.name}
                            </Button>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">{exec.team}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isExceeded
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isOnTrack
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {targetRev === 0 ? '• No individual target' : isExceeded ? '• Target Exceeded' : isOnTrack ? '• On Track' : '• Needs Attention'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info('Individual executive targets are not available for this territory.')}
                          className="text-[11px] py-1 px-2.5 bg-white border-slate-200 font-bold hover:bg-slate-100"
                        >
                          <Edit className="mr-1 h-3 w-3" /> Edit Target
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Metric 1: Revenue Goal */}
                      <div className="space-y-1 bg-white p-2.5 rounded-sm border border-slate-200/70">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Revenue Goal</span>
                          <span className="font-mono text-emerald-700">
                            {exec.revenueFormatted} / ₹ {targetRev.toLocaleString('en-IN')} ({revPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isExceeded ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(revPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Visit Goal */}
                      <div className="space-y-1 bg-white p-2.5 rounded-sm border border-slate-200/70">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Visits Goal</span>
                          <span className="font-mono text-blue-700">
                            {visitsDone} / {visitTarget} visits ({visitPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${visitPct >= 90 ? 'bg-teal-500' : 'bg-purple-600'}`}
                            style={{ width: `${Math.min(visitPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Target Distribution Grid */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Category Target vs Actual Achievement Split
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
              {businessesList.length === 0 && <p className="col-span-full py-4 text-center text-xs text-slate-600">No businesses are assigned to this territory yet.</p>}
              {[...new Set(businessesList.map((business) => business.category))].map((category) => ({ category, target: '—', achieved: `${businessesList.filter((business) => business.category === category).length} businesses`, pct: 0, color: 'bg-slate-400' })).map((cat) => (
                <div key={cat.category} className="rounded-sm bg-slate-50 border border-slate-200 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#0D1F3D]">{cat.category}</span>
                    <span className="font-bold text-blue-600">{cat.pct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono flex justify-between">
                    <span>Achieved: {cat.achieved}</span>
                    <span className="text-slate-400">Target: {cat.target}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE ANALYTICS VIEW */}
      {activeTab === 'Performance' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <DateRangePicker
              value={selectedDateRange}
              onChange={(range) => setSelectedDateRange(range)}
            />
            <div className="w-48">
              <Select
                value={compareFilter}
                onChange={(e) => setCompareFilter(e.target.value)}
                options={[
                  { value: 'none', label: 'Compare: None' },
                  { value: 'previous-month', label: 'vs Previous Month' },
                  { value: 'previous-year', label: 'vs Previous Year' },
                ]}
                searchable={false}
              />
            </div>
          </div>

          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MapKpiCard title="Total Visits" value={selectedTarget?.visitAchieved ?? 0} subValue={selectedTarget?.period ?? 'No target'} icon={TrendingUp} iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600" />
            <MapKpiCard title="Completed Visits" value={selectedTarget?.visitAchieved ?? 0} subValue={selectedTarget?.period ?? 'No target'} icon={CheckCircle2} iconBgColor="bg-blue-50" iconTextColor="text-blue-600" />
            <MapKpiCard title="New Leads" value={performance?.leadsCount ?? 0} subValue="Total territory leads" icon={Users} iconBgColor="bg-purple-50" iconTextColor="text-purple-600" />
            <MapKpiCard title="Demos Conducted" value="—" subValue="Not tracked" icon={Target} iconBgColor="bg-amber-50" iconTextColor="text-amber-600" />
            <MapKpiCard title="Sales Closed" value="—" subValue="Not tracked" icon={ShoppingBag} iconBgColor="bg-teal-50" iconTextColor="text-teal-600" />
            <MapKpiCard title="Revenue" value={`₹ ${(performance?.monthlyAchieved ?? 0).toLocaleString('en-IN')}`} subValue={selectedTarget?.period ?? 'No target'} icon={Award} iconBgColor="bg-rose-50" iconTextColor="text-rose-600" />
          </div>

          {/* Performance Analytics Grid Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Monthly Trend & Revenue Analysis */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Monthly Revenue & Target Trend</h3>
                  <p className="text-[11px] font-medium text-slate-500">Historical performance across last 5 months in {territory.name}</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Target Met: {performance?.performancePercentage ?? 0}%
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-3 pt-2">
                {!performance?.periodTargets?.length && <p className="py-4 text-center text-xs text-slate-600">No performance periods have been recorded for this territory.</p>}
                {(performance?.periodTargets ?? []).map((period) => ({
                  month: period.period,
                  revenue: Number(period.monthlyAchieved),
                  target: Number(period.monthlyTarget),
                  visits: period.visitAchieved,
                  pct: Number(period.monthlyTarget) > 0 ? Math.min(100, Math.round(Number(period.monthlyAchieved) / Number(period.monthlyTarget) * 100)) : 0,
                })).map((item) => (
                  <div key={item.month} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#0D1F3D]">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-normal">{item.visits} visits</span>
                        <span className="font-mono text-emerald-700">₹ {(item.revenue / 100000).toFixed(2)}L / ₹ {(item.target / 100000).toFixed(2)}L</span>
                        <span className="w-10 text-right text-blue-600 font-extrabold">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Pipeline Breakdown */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-extrabold text-[#0D1F3D] mb-3">Field Conversion Funnel Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-sm bg-slate-50 p-3 border border-slate-200/70 text-center">
                    <span className="text-xs font-semibold text-slate-600 block">Total Prospects</span>
                    <span className="text-lg font-extrabold text-[#0D1F3D]">{performance?.leadsCount ?? 0}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Territory leads</span>
                  </div>
                  <div className="rounded-sm bg-blue-50/50 p-3 border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600 block">Visits Completed</span>
                    <span className="text-lg font-extrabold text-blue-900">{selectedTarget?.visitAchieved ?? 0}</span>
                    <span className="text-[10px] text-blue-700 font-bold block mt-0.5">Recorded for {selectedTarget?.period ?? 'current period'}</span>
                  </div>
                  <div className="rounded-sm bg-amber-50/50 p-3 border border-amber-100 text-center">
                    <span className="text-[10px] font-bold text-amber-700 block">Demos Conducted</span>
                    <span className="text-lg font-extrabold text-amber-900">—</span>
                    <span className="text-[10px] text-amber-800 font-bold block mt-0.5">Not tracked</span>
                  </div>
                  <div className="rounded-sm bg-emerald-50/50 p-3 border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 block">Sales Closed</span>
                    <span className="text-lg font-extrabold text-emerald-900">—</span>
                    <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">Not tracked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Revenue Breakdown & Health Score */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Revenue Share by Category</h3>
                <p className="text-[11px] font-medium text-slate-500">Distribution across business categories</p>
              </div>

              <div className="space-y-3">
                {businessesList.length === 0 && <p className="py-4 text-center text-xs text-slate-600">No business categories are available yet.</p>}
                {[...new Set(businessesList.map((business) => business.category))].map((category) => ({
                  category,
                  share: businessesList.length ? Math.round(businessesList.filter((business) => business.category === category).length / businessesList.length * 100) : 0,
                  amount: `${businessesList.filter((business) => business.category === category).length} businesses`,
                  color: 'bg-blue-500',
                })).map((cat) => (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0D1F3D]">{cat.category}</span>
                      <span className="font-mono text-slate-600 font-extrabold">{cat.amount} ({cat.share}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">Territory Health Score</h4>
                <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Overall Territory Score</span>
                    <span className="text-xl font-extrabold text-emerald-600">—</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">Status</span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Not tracked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Executive Performance Leaderboard Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Executive Performance Leaderboard ({territory.name})</h3>
              <span className="text-[11px] font-bold text-slate-500">{selectedTarget?.period ?? 'No period'} Performance</span>
            </div>

            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-3">Executive</th>
                  <th className="p-3 text-center">Visits Done</th>
                  <th className="p-3 text-center">Demos</th>
                  <th className="p-3 text-center">Closed Deals</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                  <th className="p-3 text-center">Conversion Rate</th>
                  <th className="p-3 text-center">Target Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {territoryExecutives.length === 0 && (
                  <tr><td colSpan={7} className="p-5 text-center text-xs text-slate-600">No executives are assigned to this territory yet.</td></tr>
                )}
                {territoryExecutives.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedExecutiveId(exec.id)}
                        aria-label={`View details for ${exec.name}`} className="h-auto min-h-0 gap-2.5 px-1 py-1 text-left justify-start">
                        <Avatar name={exec.name} src={exec.avatar} sizeClassName="h-7 w-7" />
                        <span>
                          <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                          <span className="text-[10px] text-slate-500 block font-normal">{exec.team}</span>
                        </span>
                      </Button>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{exec.visitsCount}</td>
                    <td className="p-3 text-center font-bold text-amber-700">—</td>
                    <td className="p-3 text-center font-bold text-emerald-700">—</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{exec.revenueFormatted}</td>
                    <td className="p-3 text-center font-extrabold text-blue-600">
                      —
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exec.performancePercentage >= 85
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        Not tracked
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VISITS LOG VIEW */}
      {activeTab === 'Visits' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Field Visits Log
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                <th className="p-2.5">Date & Time</th>
                <th className="p-2.5">Executive</th>
                <th className="p-2.5">Business Name</th>
                <th className="p-2.5">Purpose</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td colSpan={5} className="p-5 text-center text-xs text-slate-600">Visit history is not available for this territory.</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: BUSINESSES VIEW */}
      {activeTab === 'Businesses' && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name or address..."
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLinkBusinessModalOpen(true)}
                className="flex items-center gap-1.5 font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <Building className="h-3.5 w-3.5 text-blue-600" /> Assign Existing Business
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate(`/admin/businesses/create?territoryId=${territory.id}`)}
                className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Create & Assign New Business
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                    <th className="p-3">Business</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Assigned Exec</th>
                    <th className="p-3 text-right">Revenue (₹)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBusinesses.length === 0 && (
                    <tr><td colSpan={5} className="p-5 text-center text-xs text-slate-600">
                      {businessSearchQuery || selectedCategoryFilter !== 'All' || selectedBusinessStatus !== 'All'
                        ? 'No businesses match the current filters.'
                        : 'No businesses are assigned to this territory yet.'}
                    </td></tr>
                  )}
                  {filteredBusinesses.map((b) => {
                    const isSelected = selectedBusinessId === b.id;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBusinessId(b.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-red-50/60 font-bold border-l-4 border-l-[#E20613]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center font-extrabold text-[#0D1F3D] border border-slate-200 shrink-0">
                              {b.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-[#0D1F3D]">{b.name}</span>
                                {b.badge && (
                                  <span className="rounded-xs bg-lime-100 px-1 py-0.2 text-[9px] font-bold text-lime-800">
                                    {b.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{b.businessType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{b.category}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={b.assignedToName} src={b.assignedToAvatar} sizeClassName="h-5 w-5" />
                            <span>{b.assignedToName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {b.revenueFormatted || '—'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            • {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Selected Business Details Preview Panel */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4 space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                  Business Details Preview
                </h3>
                {businessesList.length > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedBusiness.status}
                </span>}
              </div>

              {businessesList.length === 0 ? (
                <p className="py-5 text-center text-xs text-slate-600">Assign a business to see its details here.</p>
              ) : <>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#0D1F3D]">{selectedBusiness.name}</h4>
                  {selectedBusiness.badge && (
                    <span className="rounded-xs bg-lime-100 px-1.5 py-0.5 text-[9px] font-bold text-lime-800">
                      {selectedBusiness.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-blue-600 mt-0.5">{selectedBusiness.category} • {selectedBusiness.businessType}</p>
              </div>

              <div className="space-y-1.5 text-slate-700 border-t border-slate-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Person :</span>
                  <span className="font-extrabold text-[#0D1F3D]">{selectedBusiness.contactPerson} ({selectedBusiness.contactRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone :</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBusiness.phone}</span>
                </div>
                {selectedBusiness.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email :</span>
                    <span className="font-mono text-slate-600 truncate max-w-[160px]">{selectedBusiness.email}</span>
                  </div>
                )}
                {selectedBusiness.address && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-0.5">Address :</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">
                      {selectedBusiness.address}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Assigned Executive</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Avatar name={selectedBusiness.assignedToName} src={selectedBusiness.assignedToAvatar} sizeClassName="h-5 w-5" />
                    <span className="font-bold text-[#0D1F3D]">{selectedBusiness.assignedToName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 block">Last Visit</span>
                  <span className="font-extrabold text-slate-700">{selectedBusiness.lastVisitDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBusiness.phone) window.location.href = `tel:${selectedBusiness.phone}`;
                    else toast.info('No phone number is available for this business.');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-sm bg-[#0D1F3D] py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#07152E] cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Owner
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('A mapped location is unavailable for this business.')}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-red-600" /> Directions
                </button>
              </div>

              {/* Interactive Mapbox Map Centered on Selected Business */}
              <div className="relative h-[280px] w-full rounded-sm border border-slate-200 overflow-hidden shadow-inner">
                <InteractiveMap
                  key={selectedBusiness.id}
                  mode="prospects"
                  heightClassName="h-full"
                  compact
                  prospects={[]}
                />
              </div>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MAP & BOUNDARIES VIEW */}
      {activeTab === 'Map' && (
        <div className="space-y-4">
          {/* Main Grid (4-col Left Control Sidebar + 8-col Right Interactive Mapbox View) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* LEFT COLUMN (4 COLS MAP LAYERS & LEGEND) */}
            <div className="space-y-4 lg:col-span-4 flex flex-col">
              {/* Map Layers Card */}
              <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Map Layers</span>
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                </h3>

                <div className="space-y-2.5 text-slate-700">
                  <div>
                    <Checkbox
                      checked={showBoundary}
                      onChange={(val) => setShowBoundary(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-blue-600 font-mono font-bold">---</span>
                          <span>Territory Boundary</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showBusinesses}
                      onChange={(val) => setShowBusinesses(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span>Businesses</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showActiveBusinesses}
                      onChange={(val) => setShowActiveBusinesses(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          <span>Active Businesses</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showLeads}
                      onChange={(val) => setShowLeads(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                          <span>Leads</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showVisitedLocations}
                      onChange={(val) => setShowVisitedLocations(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-amber-500">📍</span>
                          <span>Visited Locations (This Month)</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showExecutives}
                      onChange={(val) => setShowExecutives(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-red-500">👤</span>
                          <span>Executives Live Location</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showRoutes}
                      onChange={(val) => setShowRoutes(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-blue-500 font-mono">---</span>
                          <span>Routes (This Month)</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showHeatmap}
                      onChange={(val) => setShowHeatmap(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span>🔥 Heatmap (Visits)</span>
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Legend Card with Counts */}
              <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                  Legend & Counts
                </h3>

                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Active Businesses
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{businessesList.filter((business) => business.status === 'Active').length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Inactive Businesses
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{businessesList.filter((business) => business.status === 'Inactive').length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Leads
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{performance?.leadsCount ?? 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-amber-500">📍</span> Visited Locations
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{selectedTarget?.visitAchieved ?? 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">👤</span> Executives
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{territoryExecutives.length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500 font-mono">---</span> Routes
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">—</span>
                  </div>
                </div>
              </div>

              {/* Territory Info Box */}
              <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                  Territory Info
                </h3>

                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Territory Code :</span>
                    <span className="font-mono font-bold text-[#0D1F3D]">{territory.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Region / Area :</span>
                    <span>{territory.regionArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Area :</span>
                    <span className="font-bold text-slate-800">{territory.areaKm2} km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created On :</span>
                    <span>{territory.createdOn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created By :</span>
                    <span>{territory.createdBy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (8 COLS FULL MAPBOX VIEW) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="relative rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden flex-1 min-h-[580px]">
                <InteractiveMap
                  mode={showHeatmap ? 'visit-heatmap' : 'live-executives'}
                  executives={[]}
                  prospects={[]}
                  heightClassName="h-full min-h-[580px]"
                  territoryPath={showBoundary ? territory.pathPoints : []}
                  showHeatmapToggle={showHeatmap}
                />

                {/* Map Polygon Stats Overlay Footer */}
                <div className="absolute bottom-3 right-3 z-20 rounded-sm border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#0D1F3D] shadow-md">
                  Area: {territory.areaKm2} km² &nbsp;|&nbsp; Perimeter: {territory.perimeterKm} km
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Metrics Cards Grid (5 Stat Cards matching Territory Map) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-2">
            <MapKpiCard
              title="Total Visits (This Month)"
              value={selectedTarget?.visitAchieved ?? 0}
              subValue={selectedTarget?.period ?? 'No target'}
              icon={TrendingUp}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <MapKpiCard
              title="Active Businesses"
              value={businessesList.filter((business) => business.status === 'Active').length}
              subValue={`${businessesList.length} total`}
              icon={Building}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <MapKpiCard
              title="Leads"
              value={performance?.leadsCount ?? 0}
              subValue="In this territory"
              icon={Users}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
            />
            <MapKpiCard
              title="Avg. Visit Duration"
              value="—"
              subValue="Not tracked"
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
            <MapKpiCard
              title="Coverage Efficiency"
              value="—"
              subValue="Not tracked"
              icon={CheckCircle2}
              iconBgColor="bg-rose-50"
              iconTextColor="text-rose-600"
            />
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITIES STREAM VIEW */}
      {activeTab === 'Activities' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Activity Feed Stream
          </h3>
          <p className="text-xs text-slate-500">Territory activities are not available.</p>

        </div>
      )}

      {/* TAB 9: DOCUMENTS VIEW */}
      {activeTab === 'Documents' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Documents Repository
          </h3>
          <p className="text-xs text-slate-500">No territory documents are available.</p>

        </div>
      )}

      {/* TAB 10: HISTORY VIEW */}
      {activeTab === 'History' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Audit & Modification Log
          </h3>
          <p className="text-xs text-slate-500">Territory audit history is not available.</p>

        </div>
      )}

      <Modal
        isOpen={Boolean(selectedExecutiveMember)}
        onClose={() => setSelectedExecutiveId(null)}
        title="Executive details"
        maxWidth="max-w-md"
      >
        {selectedExecutiveMember && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedExecutiveMember.membership?.user?.fullName ?? 'Unknown executive'}
                src={selectedExecutiveMember.membership?.user?.avatarUrl}
                sizeClassName="h-12 w-12"
              />
              <div>
                <p className="font-bold text-[#0D1F3D]">{selectedExecutiveMember.membership?.user?.fullName ?? 'Unknown executive'}</p>
                <p className="text-xs text-slate-600">{selectedExecutiveMember.membership?.tenantRole?.name ?? selectedExecutiveMember.role}</p>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Team</dt>
                <dd className="font-semibold text-slate-800">{selectedExecutiveMember.membership?.team?.name ?? 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="font-semibold text-slate-800">{selectedExecutiveMember.membership?.status ?? 'Unavailable'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="font-semibold text-slate-800">
                  {selectedExecutiveMember.membership?.user?.mobile
                    ? <a className="text-blue-700 hover:underline" href={`tel:${selectedExecutiveMember.membership.user.mobile}`}>{selectedExecutiveMember.membership.user.mobile}</a>
                    : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="break-all font-semibold text-slate-800">
                  {selectedExecutiveMember.membership?.user?.email
                    ? <a className="text-blue-700 hover:underline" href={`mailto:${selectedExecutiveMember.membership.user.email}`}>{selectedExecutiveMember.membership.user.email}</a>
                    : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Assigned to territory</dt>
                <dd className="font-semibold text-slate-800">{new Date(selectedExecutiveMember.assignedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      {/* Modal for Assigning Executives */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => { if (!savingAssignments) setIsAssignModalOpen(false); }}
        title={`Assign executives to ${territory.name}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">Choose the team members who should have this territory assigned.</p>
          <Input
            id="territory-member-search"
            label="Search team members"
            placeholder="Search by name"
            value={assignmentSearch}
            onChange={(event) => setAssignmentSearch(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            autoComplete="off"
          />
          <p className="text-xs font-semibold text-slate-600" aria-live="polite">
            {selectedExecIds.length} selected · {assignedMemberIds.size} currently assigned
          </p>
          {assignmentError && (
            <div role="alert" className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <span>{assignmentError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignmentRetry((value) => value + 1)}>Refresh</Button>
            </div>
          )}
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1" aria-label="Available team members">
            {visibleAssignmentOptions.map((exec) => {
              const isChecked = selectedExecIds.includes(exec.id);
              return (
                <div key={exec.id} className={`rounded-lg border ${isChecked ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <Checkbox
                    className="w-full flex-row-reverse justify-between gap-3 px-3 py-2.5"
                    checked={isChecked}
                    disabled={savingAssignments}
                    onChange={(checked) => setSelectedExecIds((current) => checked
                      ? [...new Set([...current, exec.id])]
                      : current.filter((id) => id !== exec.id))}
                    label={
                      <span className="flex min-w-0 items-center gap-2.5 text-left">
                        <Avatar name={exec.name} src={exec.avatar} sizeClassName="h-8 w-8" />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-[#0D1F3D]">{exec.name}</span>
                          <span className="block truncate text-[11px] font-normal text-slate-600">
                            {exec.role}
                            {assignedMemberIds.has(exec.id) ? ' · Assigned' : ''}
                          </span>
                        </span>
                      </span>
                    }
                  />
                </div>
              );
            })}
            {assignmentLoading && <p role="status" className="py-5 text-center text-xs text-slate-600">Loading team members…</p>}
            {!assignmentLoading && !assignmentError && visibleAssignmentOptions.length === 0 && (
              <p className="py-5 text-center text-xs text-slate-600">
                {assignmentSearch ? 'No team members match your search.' : 'No team members are available to assign.'}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-[11px] text-slate-500">{hasAssignmentChanges ? 'Unsaved assignment changes' : 'Assignments are up to date'}</span>
            <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={savingAssignments} onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => void saveExecutiveAssignments()}
              disabled={!hasAssignmentChanges || assignmentLoading || Boolean(assignmentError)}
              isLoading={savingAssignments}
              className="bg-[#0D1F3D] text-white"
            >
              Save Assignments
            </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal for Setting Executive Targets */}
      <Modal isOpen={isSetTargetModalOpen} onClose={() => setIsSetTargetModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              {editingTargetExec ? `Edit Target for ${editingTargetExec.name}` : 'Set Executive Targets'}
            </h3>
            <button onClick={() => setIsSetTargetModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-slate-500 block mb-1">Target Month / Period</label>
              <input
                type="text"
                value={targetPeriodFilter}
                disabled
                className="w-full rounded-sm border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Revenue Target (₹)</label>
              <input
                type="number"
                value={targetRevenueInput}
                onChange={(e) => setTargetRevenueInput(e.target.value)}
                placeholder="250000"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Monthly Visit Target</label>
              <input
                type="number"
                value={targetVisitInput}
                onChange={(e) => setTargetVisitInput(e.target.value)}
                placeholder="35"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">New Business Goal</label>
              <input
                type="number"
                defaultValue="12"
                placeholder="12"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsSetTargetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsSetTargetModalOpen(false);
                toast.success('Executive targets updated successfully!');
              }}
              className="bg-[#0D1F3D] text-white font-bold"
            >
              Save Targets
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Adding New Business to Territory */}
      <Modal isOpen={isAddBusinessModalOpen} onClose={() => setIsAddBusinessModalOpen(false)} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Add New Business to {territory.name}</h3>
              <p className="text-[11px] font-medium text-slate-500">Create a business record and assign to field executive</p>
            </div>
            <button onClick={() => setIsAddBusinessModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateBusiness} className="space-y-3 text-xs font-semibold">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Traders"
                  value={newBusinessData.name}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, name: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <Select
                label="Category / Industry *"
                value={newBusinessData.category}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, category: e.target.value })}
                options={[
                  { label: 'Retail', value: 'Retail' },
                  { label: 'Healthcare', value: 'Healthcare' },
                  { label: 'Food & Beverage', value: 'Food & Beverage' },
                  { label: 'Automobile', value: 'Automobile' },
                  { label: 'Technology', value: 'Technology' },
                  { label: 'Fitness & Gym', value: 'Gym' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Contact Person Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newBusinessData.contactPerson}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, contactPerson: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 block">Phone / Mobile *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newBusinessData.phone}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, phone: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={newBusinessData.email}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, email: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <Select
                label="Assign To Field Executive *"
                value={newBusinessData.assignedExecutive}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, assignedExecutive: e.target.value })}
                options={territoryExecutives.map((ex) => ({
                  label: `${ex.name} (${ex.team})`,
                  value: ex.id,
                }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 block">Full Address</label>
              <input
                type="text"
                placeholder="Shop No, Building, Street, Area"
                value={newBusinessData.address}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, address: e.target.value })}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddBusinessModalOpen(false);
                  navigate('/admin/businesses/add');
                }}
                className="text-[11px] font-extrabold text-blue-600 hover:underline"
              >
                Or open full registration page →
              </button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddBusinessModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" isLoading={savingBusiness} className="bg-[#E20613] hover:bg-red-700 text-white font-bold">
                  Save & Add Business
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Assigning Existing Business to Territory */}
      <Modal isOpen={isLinkBusinessModalOpen} onClose={() => setIsLinkBusinessModalOpen(false)} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Assign Existing Business to {territory.name}</h3>
              <p className="text-[11px] font-medium text-slate-500">Select an existing business from the database to add to this territory</p>
            </div>
            <button onClick={() => setIsLinkBusinessModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business by name, owner, or city..."
                value={linkSearchQuery}
                onChange={(e) => setLinkSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>

            {/* Business Selection List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-sm divide-y divide-slate-100 bg-slate-50/50">
              {filteredBusinessCandidates.length === 0 && (
                <p className="p-4 text-center text-xs text-slate-600">
                  {linkSearchQuery ? 'No businesses match your search.' : 'No businesses are available to assign.'}
                </p>
              )}
              {filteredBusinessCandidates.map((b) => {
                  const isSelected = selectedLinkBizId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedLinkBizId(b.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-xs">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{b.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {b.businessType} • {b.contactPerson} ({b.city})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Executive Assignment Select */}
            <Select
              label="Assign Executive in Territory *"
              value={linkAssignedExec}
              onChange={(e) => setLinkAssignedExec(e.target.value)}
              options={territoryExecutives.map((ex) => ({
                label: `${ex.name} (${ex.team})`,
                value: ex.id,
              }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsLinkBusinessModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => void handleAssignBusiness()}
              isLoading={savingBusiness}
              className="bg-[#0D1F3D] text-white font-bold"
            >
              Assign to Territory
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
