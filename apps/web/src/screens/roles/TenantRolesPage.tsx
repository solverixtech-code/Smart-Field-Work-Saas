import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Key,
  FileText,
  UserCheck,
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Globe,
  Tag,
  Clock,
  Info,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Crown,
  Headphones,
  Sparkles,
  Copy,
  Trash2,
  X,
  CreditCard,
  Building2,
  Target,
  BarChart3,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { roleApi } from '../../features/roles/role.api';
import type {
  TenantRoleItem,
  RoleStats,
  RoleCounts,
  RoleDetailResponse,
  PermissionModuleGroup,
  AssignedUser,
} from '../../features/roles/role.types';

export function TenantRolesPage() {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'platform' | 'tenant' | 'preview'>('tenant');
  const [roles, setRoles] = useState<TenantRoleItem[]>([]);
  const [stats, setStats] = useState<RoleStats>({
    activeRoles: 0,
    syncedPermissions: 0,
    customRoles: 0,
    usersAssigned: 0,
    breakdown: '0 custom roles • 0 from templates',
  });
  const [counts, setCounts] = useState<RoleCounts>({
    all: 0,
    synced: 0,
    customized: 0,
    default: 0,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<RoleDetailResponse | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // In-memory role detail cache for instantaneous 0ms role switching with ZERO blinking
  const roleCacheRef = React.useRef<Record<string, RoleDetailResponse>>({});
  const selectedRoleIdRef = React.useRef<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'customized' | 'default'>('all');

  // Permission Edits Local State
  const [currentGrants, setCurrentGrants] = useState<Set<string>>(new Set());
  const [initialGrants, setInitialGrants] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBaseId, setNewRoleBaseId] = useState('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [isDuplicatingRole, setIsDuplicatingRole] = useState(false);

  // Instant zero-flicker role selection function - purely in-memory, ZERO blinking
  const selectRole = useCallback((roleId: string, forceRefresh = false) => {
    setSelectedRoleId(roleId);
    selectedRoleIdRef.current = roleId;

    // If already cached, apply immediately (0ms delay) - ZERO BLINKING OR RE-RENDER
    if (roleCacheRef.current[roleId] && !forceRefresh) {
      const cached = roleCacheRef.current[roleId];
      setSelectedRoleDetail(cached);
      setCurrentGrants(new Set(cached.grantedPermissions));
      setInitialGrants(new Set(cached.grantedPermissions));
      return;
    }

    roleApi
      .getRole(roleId)
      .then((data) => {
        roleCacheRef.current[roleId] = data;
        if (selectedRoleIdRef.current === roleId) {
          setSelectedRoleDetail(data);
          setCurrentGrants(new Set(data.grantedPermissions));
          setInitialGrants(new Set(data.grantedPermissions));
        }
      })
      .catch((err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to load role details');
      });
  }, []);

  // Load roles list and pre-cache details - does NOT depend on selectedRoleId to avoid re-rendering role directory
  const loadRoles = useCallback(
    async (selectId?: string) => {
      try {
        setLoadingRoles(true);
        const res = await roleApi.listRoles({
          q: searchQuery,
          status: statusFilter,
        });

        setRoles(res.roles);
        setStats(res.stats);
        setCounts(res.counts);

        const toSelect = selectId || selectedRoleIdRef.current || (res.roles.length > 0 ? res.roles[0].id : null);
        if (toSelect) {
          selectRole(toSelect);
        }

        // Prefetch ALL workspace roles in background so every role switch is 100% instantaneous in-memory
        res.roles.forEach((r) => {
          if (!roleCacheRef.current[r.id]) {
            roleApi
              .getRole(r.id)
              .then((det) => {
                roleCacheRef.current[r.id] = det;
              })
              .catch(() => {});
          }
        });
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load roles from workspace');
      } finally {
        setLoadingRoles(false);
      }
    },
    [searchQuery, statusFilter, selectRole]
  );

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Check if there are unsaved permission changes
  const hasUnsavedChanges = useMemo(() => {
    if (currentGrants.size !== initialGrants.size) return true;
    for (const p of currentGrants) {
      if (!initialGrants.has(p)) return true;
    }
    return false;
  }, [currentGrants, initialGrants]);

  // Toggle permission action
  const togglePermission = (code: string) => {
    if (selectedRoleDetail?.role.code === 'tenant_admin') {
      toast.info('Tenant Administrator has unrestricted access across all permissions.');
      return;
    }
    setCurrentGrants((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Toggle record scope
  const toggleScope = (code: string) => {
    if (selectedRoleDetail?.role.code === 'tenant_admin') {
      toast.info('Tenant Administrator always has full tenant scope.');
      return;
    }
    setCurrentGrants((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Save permission grants
  const handleSaveChanges = async () => {
    if (!selectedRoleId) return;
    try {
      setIsSaving(true);
      const res = await roleApi.updatePermissions(selectedRoleId, Array.from(currentGrants));
      setInitialGrants(new Set(currentGrants));
      toast.success('Role permissions successfully updated and active!');
      if (selectedRoleDetail) {
        setSelectedRoleDetail({
          ...selectedRoleDetail,
          role: {
            ...selectedRoleDetail.role,
            permissionsVersion: res.permissionsVersion,
            status: selectedRoleDetail.role.code === 'tenant_admin' ? 'default' : 'customized',
          },
        });
      }
      loadRoles(selectedRoleId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save permission grants');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setCurrentGrants(new Set(initialGrants));
    toast.info('Unsaved permission edits reverted.');
  };

  // Sync templates
  const handleSyncTemplates = async () => {
    try {
      setIsSyncing(true);
      await roleApi.syncTemplates();
      toast.success('Workspace roles successfully synchronized with templates!');
      if (selectedRoleId) {
        await selectRole(selectedRoleId, true);
      }
      await loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to sync templates');
    } finally {
      setIsSyncing(false);
    }
  };

  // Create Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Please enter a role name');
      return;
    }
    try {
      setIsCreatingRole(true);
      const created = await roleApi.createRole({
        name: newRoleName.trim(),
        code: newRoleCode.trim() || undefined,
        description: newRoleDesc.trim() || undefined,
        baseRoleId: newRoleBaseId || undefined,
      });
      toast.success(`Role "${created.name}" created successfully!`);
      setIsCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleCode('');
      setNewRoleDesc('');
      setNewRoleBaseId('');
      await loadRoles(created.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create custom role');
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Duplicate Role
  const handleDuplicateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    try {
      setIsDuplicatingRole(true);
      const cloned = await roleApi.duplicateRole(selectedRoleId, {
        name: duplicateName.trim() || undefined,
      });
      toast.success(`Role duplicated as "${cloned.name}"!`);
      setIsDuplicateModalOpen(false);
      setDuplicateName('');
      await loadRoles(cloned.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate role');
    } finally {
      setIsDuplicatingRole(false);
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async (role: TenantRoleItem) => {
    if (role.isSystem) {
      toast.error('Built-in system roles cannot be deleted.');
      return;
    }
    if (role.userCount > 0) {
      toast.error(`Cannot delete role with ${role.userCount} assigned user(s).`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      return;
    }
    try {
      await roleApi.deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted.`);
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  // Role icon helper matching reference screen
  const getRoleIcon = (code: string) => {
    switch (code) {
      case 'tenant_admin':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'sales_manager':
      case 'team_leader':
        return <Users className="h-4 w-4 text-[#4F46E5]" />;
      case 'field_executive':
        return <UserCheck className="h-4 w-4 text-sky-500" />;
      case 'support':
        return <Headphones className="h-4 w-4 text-emerald-500" />;
      case 'finance_ops':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-[#4F46E5]" />;
    }
  };

  // Module icon helper
  const getModuleIcon = (key: string) => {
    switch (key) {
      case 'lead_management':
        return <Target className="h-4 w-4 text-[#4F46E5]" />;
      case 'businesses_contacts':
        return <Building2 className="h-4 w-4 text-[#4F46E5]" />;
      case 'teams':
        return <Users className="h-4 w-4 text-[#4F46E5]" />;
      case 'reports':
        return <BarChart3 className="h-4 w-4 text-[#4F46E5]" />;
      case 'platform_billing':
        return <Sliders className="h-4 w-4 text-[#4F46E5]" />;
      case 'attendance_shifts':
        return <Clock className="h-4 w-4 text-[#4F46E5]" />;
      case 'payroll':
        return <CreditCard className="h-4 w-4 text-[#4F46E5]" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-[#4F46E5]" />;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage platform role templates, tenant role grants, and effective access rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Workspace Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400 font-normal">Workspace:</span>
            <span className="font-extrabold text-slate-900">Mumbai Sales Ops</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* Sync Templates Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncTemplates}
            disabled={isSyncing}
            className="gap-2 font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200 rounded-lg"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-[#4F46E5]' : ''}`} />
            Sync Templates
          </Button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('platform');
            toast.info('Platform Templates are managed via SaaS Plan. Showing Tenant workspace active roles.');
          }}
          className={`pb-3 transition-colors ${
            activeTab === 'platform'
              ? 'border-b-2 border-[#4F46E5] text-[#4F46E5] font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Templates
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenant')}
          className={`pb-3 transition-colors ${
            activeTab === 'tenant'
              ? 'border-b-2 border-[#4F46E5] text-[#4F46E5] font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tenant Roles
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('preview');
            toast.info('Access Preview evaluates active session authorization tokens.');
          }}
          className={`pb-3 transition-colors ${
            activeTab === 'preview'
              ? 'border-b-2 border-[#4F46E5] text-[#4F46E5] font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Access Preview
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Roles"
          value={stats.activeRoles}
          subValue={stats.breakdown}
          icon={Users}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-[#4F46E5]"
        />
        <KpiCard
          title="Synced Permissions"
          value={stats.syncedPermissions}
          subValue="Across all tenant roles"
          icon={Key}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Custom Roles"
          value={stats.customRoles}
          subValue="Tenant specific roles"
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Users Assigned"
          value={stats.usersAssigned}
          subValue="Across all roles"
          icon={UserCheck}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
      </div>

      {/* Main 3-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Role Directory (Wider: 4 cols on lg/xl, 3 cols on 2xl) */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-extrabold text-slate-900">Role Directory</h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All {counts.all}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('synced')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                statusFilter === 'synced'
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Synced {counts.synced}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('customized')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                statusFilter === 'customized'
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Customized {counts.customized}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('default')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                statusFilter === 'default'
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Default {counts.default}
            </button>
          </div>

          {/* Roles List */}
          <div className="space-y-1.5 pt-1 max-h-[720px] overflow-y-auto pr-0.5">
            {loadingRoles ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No roles found</div>
            ) : (
              roles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        if (window.confirm('You have unsaved changes. Discard and switch roles?')) {
                          selectRole(role.id);
                        }
                      } else {
                        selectRole(role.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#6366F1] bg-[#F5F3FF] shadow-2xs'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          isSelected ? 'bg-white text-[#4F46E5] border-[#C7D2FE]' : 'bg-slate-50 border-slate-200'
                        }`}>
                          {getRoleIcon(role.code)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-extrabold text-slate-900 truncate">
                            {role.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {role.description || role.code}
                          </p>
                        </div>
                      </div>

                      {/* Status Tag matching Reference UI */}
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          role.status === 'default'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : role.status === 'customized'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {role.status === 'default'
                          ? 'Default'
                          : role.status === 'customized'
                          ? 'Customized'
                          : 'Synced'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                      <span>{role.userCount} users</span>
                      <span className="text-slate-400 font-normal">{role.permissionCount} perms</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Role Details & Permissions Matrix (8 cols on lg/xl, 7 cols on 2xl) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-7 space-y-4 min-h-[820px]">
          {loadingDetail && !selectedRoleDetail ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400 min-h-[400px] flex items-center justify-center">
              Loading role details...
            </div>
          ) : selectedRoleDetail ? (
            <>
              {/* Role Header Banner Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                      {getRoleIcon(selectedRoleDetail.role.code)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedRoleDetail.role.name}
                      </h2>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        Role Key: {selectedRoleDetail.role.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateName(`${selectedRoleDetail.role.name} (Copy)`);
                        setIsDuplicateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white"
                      title="Duplicate Role"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {!selectedRoleDetail.role.isSystem && (
                      <button
                        type="button"
                        onClick={() => {
                          const roleItem = roles.find((r) => r.id === selectedRoleDetail.role.id);
                          if (roleItem) handleDeleteRole(roleItem);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg border border-rose-200 bg-white"
                        title="Delete Role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata Chips */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium text-xs">
                    <Globe className="h-3.5 w-3.5 text-sky-600" /> Scope: {selectedRoleDetail.role.scope}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Module Entitlement: {selectedRoleDetail.role.moduleEntitlement}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs">
                    <Tag className="h-3.5 w-3.5 text-slate-500" /> Template Version: {selectedRoleDetail.role.templateVersion}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs">
                    <Clock className="h-3.5 w-3.5 text-slate-500" /> Last Updated: {selectedRoleDetail.role.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Informational Banner (Lavender Theme matching Reference Screen) */}
              {showNoticeBanner && (
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg text-xs font-medium text-[#6B21A8]">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#7C3AED] shrink-0" />
                    <span>Customized grants are preserved during template sync.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNoticeBanner(false)}
                    className="text-[#7C3AED] hover:text-[#5B21B6]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Module Permissions Matrix Table - Stable Fixed Container Height (Zero Layout Shift) */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden min-h-[480px]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Module Permissions</h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {currentGrants.size} permissions enabled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-600 font-extrabold text-[11px]">
                        <th className="py-2.5 px-4 w-[22%] whitespace-nowrap min-w-[160px]">Module</th>
                        <th className="py-2.5 px-4 w-[58%]">Actions</th>
                        <th className="py-2.5 px-4 w-[20%] whitespace-nowrap min-w-[140px]">Record Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRoleDetail.permissionModules.map((mod) => (
                        <tr key={mod.moduleKey} className="hover:bg-slate-50/50 transition-colors">
                          {/* Module Name - Clean without collapsible toggles */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              {getModuleIcon(mod.moduleKey)}
                              <span className="text-xs font-bold text-[#0D1F3D]">{mod.moduleName}</span>
                            </div>
                          </td>

                          {/* Actions Column: Compact 4-Column Aligned CSS Grid with tight gaps */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3.5 gap-y-2 w-fit max-w-[480px]">
                              {mod.actions.map((act) => {
                                const isGranted = currentGrants.has(act.code);
                                return (
                                  <label
                                    key={act.code}
                                    className="inline-flex items-center gap-1.5 cursor-pointer select-none group min-w-0 pr-1.5"
                                  >
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={isGranted}
                                      onClick={() => togglePermission(act.code)}
                                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus:outline-none ${
                                        isGranted ? 'bg-[#4F46E5]' : 'bg-slate-200'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-150 ease-in-out mt-0.5 ${
                                          isGranted ? 'translate-x-3.5' : 'translate-x-0.5'
                                        }`}
                                      />
                                    </button>
                                    <span
                                      className={`text-xs font-medium whitespace-nowrap ${
                                        isGranted ? 'text-slate-900 font-semibold' : 'text-slate-500'
                                      }`}
                                    >
                                      {act.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </td>

                          {/* Record Scope Column */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            {mod.scopes.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {mod.scopes.map((sc) => {
                                  const isGranted = currentGrants.has(sc.code);
                                  return (
                                    <button
                                      key={sc.code}
                                      type="button"
                                      onClick={() => toggleScope(sc.code)}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors border ${
                                        isGranted
                                          ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
                                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      {sc.label}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold px-2">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assigned Users Section */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Assigned Users ({selectedRoleDetail.assignedUsers.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-600 font-extrabold text-[11px]">
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[160px]">Name</th>
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[200px]">Email</th>
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[140px]">Team</th>
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[180px]">Role</th>
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[110px]">Status</th>
                        <th className="py-2.5 px-4 whitespace-nowrap min-w-[120px]">Added On</th>
                        <th className="py-2.5 px-2 text-right w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRoleDetail.assignedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                            No users currently assigned to this role.
                          </td>
                        </tr>
                      ) : (
                        selectedRoleDetail.assignedUsers.map((user) => (
                          <tr key={user.membershipId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-6 w-6 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-indigo-50 text-[#4F46E5] font-bold text-[10px] flex items-center justify-center border border-indigo-200">
                                    {user.name.charAt(0)}
                                  </div>
                                )}
                                <span className="font-bold text-slate-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 font-medium whitespace-nowrap">{user.email}</td>
                            <td className="py-2.5 px-4 text-slate-600 font-medium whitespace-nowrap">{user.team}</td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold whitespace-nowrap">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {user.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">{user.addedOn}</td>
                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toast.info(`Options for ${user.name}`)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDuplicateName(`${selectedRoleDetail.role.name} (Copy)`);
                    setIsDuplicateModalOpen(true);
                  }}
                  className="gap-1.5 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate Role
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="font-bold text-slate-600 rounded-lg"
                  >
                    Discard
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="gap-2 font-extrabold bg-[#4F46E5] hover:bg-[#4338CA] text-white border-0 shadow-xs rounded-lg"
                  >
                    {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a role from directory to view and configure permissions.
            </div>
          )}
        </div>

        {/* Right Column: Access Logic Panel (2 cols on 2xl) */}
        <div className="hidden 2xl:block 2xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-[#7C3AED]">
                <Key className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Access Logic</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  How permissions are evaluated in Visiblo Smart Field Work.
                </p>
              </div>
            </div>

            {/* 4 Access Logic Principles */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-extrabold border border-[#C7D2FE]">
                  1
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Access = Module Entitlement + Permission + Record Scope
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    All three must be satisfied for access to be granted.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-extrabold border border-[#C7D2FE]">
                  2
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Tenant membership is authoritative
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Users can only access data within their tenant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-extrabold border border-[#C7D2FE]">
                  3
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Out-of-scope records return hidden/not visible
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Records outside the allowed scope do not appear in lists or search results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-extrabold border border-[#C7D2FE]">
                  4
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Customized tenant grants do not overwrite template defaults
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Your customizations are preserved during template syncs.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip Box */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-xs font-medium text-[#6B21A8]">
                <Info className="h-4 w-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Changes take effect immediately for assigned users.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Role */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Custom Role"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateRole} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Regional Supervisor"
              required
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Role Code (Optional)
            </label>
            <Input
              value={newRoleCode}
              onChange={(e) => setNewRoleCode(e.target.value)}
              placeholder="e.g. regional_supervisor"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If left blank, a lowercase slug will be generated automatically.
            </p>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Description
            </label>
            <Input
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="e.g. Multi-team oversight and territory reporting"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              Clone Permissions From (Base Role)
            </label>
            <select
              value={newRoleBaseId}
              onChange={(e) => setNewRoleBaseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            >
              <option value="">Start from Scratch (No initial permissions)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.permissionCount} permissions)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreatingRole}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white border-0 font-extrabold rounded-lg"
            >
              {isCreatingRole ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Duplicate Role */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Duplicate Role"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDuplicateRole} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">
              New Role Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="e.g. Sales Manager - Tier 2"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            This will create a new custom role and clone all{' '}
            <strong>{currentGrants.size} permission grants</strong> currently assigned to this role.
          </p>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDuplicateModalOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isDuplicatingRole}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white border-0 font-extrabold rounded-lg"
            >
              {isDuplicatingRole ? 'Duplicating...' : 'Duplicate Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
