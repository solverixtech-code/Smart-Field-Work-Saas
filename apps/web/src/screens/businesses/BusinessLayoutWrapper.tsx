import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Edit,
  MoreVertical,
  CheckCircle2,
  ShoppingBag,
  Calendar,
  CreditCard,
  Users,
  ChevronDown,
  Copy,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useCrm, useCrmQuery, useCrmMutation } from '../../features/crm/CrmContext';
import { CrmFailure } from '../../features/crm/CrmControls';
import type { AccountDto } from '../../features/crm/crm.types';

export interface BusinessContext {
  business: any;
  reload?: () => void;
}

export default function BusinessLayoutWrapper() {
  const { businessId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { can, readOnly } = useCrm();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`visiblo_biz_logo_${businessId}`);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      setCustomLogoUrl(localStorage.getItem(`visiblo_biz_logo_${businessId}`));
    } catch {
      setCustomLogoUrl(null);
    }
    const handleLogoUpdate = (e: any) => {
      if (e.detail?.businessId === businessId) {
        setCustomLogoUrl(e.detail.logoUrl);
      }
    };
    window.addEventListener('visiblo:business-logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('visiblo:business-logo-updated', handleLogoUpdate);
  }, [businessId]);

  const result = useCrmQuery(`account:${businessId}`, (service, signal) =>
    service.account(businessId, signal),
  );

  useEffect(() => {
    if (result.data?.name && businessId) {
      try {
        sessionStorage.setItem(`visiblo_biz_name_${businessId}`, result.data.name);
      } catch {}
      window.dispatchEvent(
        new CustomEvent('visiblo:business-name-updated', {
          detail: { businessId, name: result.data.name },
        }),
      );
    }
  }, [businessId, result.data?.name]);

  if (result.error) {
    return <CrmFailure error={result.error} retry={result.reload} />;
  }

  if (!result.data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-slate-200 bg-white p-8">
        <p role="status" className="text-sm font-semibold text-slate-500">Loading business...</p>
      </div>
    );
  }

  const raw = result.data;
  const business = {
    ...raw,
    id: raw.id,
    name: raw.name,
    businessType: raw.businessType || 'General Business',
    establishedYear: raw.establishedYear || 2022,
    logoText: raw.name ? raw.name.slice(0, 2).toUpperCase() : 'BU',
    logoBg: 'bg-blue-100 text-blue-800',
    status: raw.status === 'ACTIVE' ? 'Active' : raw.status === 'BLOCKED' ? 'Blocked' : 'Inactive',
    phone: raw.primaryContact?.phone || 'Not set',
    email: raw.primaryContact?.email || 'Not set',
    description: raw.description || 'No description provided.',
    address: raw.addressLine1 || 'Address not set',
    city: raw.city || 'Location not set',
    assignedToName: raw.owner?.displayName || 'Unassigned',
  };

  const navItems = [
    { label: 'Business Details', icon: Building2, path: `/admin/businesses/${business.id}` },
    { label: 'Contacts', icon: Users, path: `/admin/businesses/${business.id}/contacts` },
    { label: 'Sales History', icon: ShoppingBag, path: `/admin/businesses/${business.id}/sales-history` },
    { label: 'Visit History', icon: Calendar, path: `/admin/businesses/${business.id}/visits` },
    { label: 'Subscription', icon: CreditCard, path: `/admin/businesses/${business.id}/subscription` },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt={business.name}
              className="h-12 w-12 rounded-md object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
          ) : (
            <div className={`flex h-12 w-12 items-center justify-center rounded-md font-bold text-sm shrink-0 ${business.logoBg}`}>
              {business.logoText}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0D1F3D]">{business.name}</h1>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-200">
                {business.status}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 border border-blue-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {business.businessType} • <span className="font-mono text-slate-400">ID: {business.id.startsWith('BIZ-') ? business.id : `BIZ-${business.id.replace(/-/g, '').slice(-6).toUpperCase()}`}</span> • Established in {business.establishedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative inline-block" ref={moreRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4 text-slate-500" />
              <span>More Actions</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isMoreOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-[999] w-56 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate(`/admin/businesses/${business.id}/contacts`);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Manage Contacts</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate(`/admin/visits/schedule`);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Schedule Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate(`/admin/businesses/${business.id}/sales-history`);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer transition-colors"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Sales History</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate(`/admin/businesses/${business.id}/subscription`);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Subscription Details</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigator.clipboard.writeText(`${business.name} | Phone: ${business.phone} | Address: ${business.address}, ${business.city}`);
                    toast.success('Business info copied to clipboard!');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Copy Business Details</span>
                </button>
              </div>
            )}
          </div>

          {can('crm.businesses.update') && !readOnly && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
            >
              <Edit className="h-4 w-4" /> Edit Business
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-md shadow-xs overflow-x-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/admin/businesses/${business.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#0D1F3D] text-[#0D1F3D] bg-slate-50/80 rounded-t-md'
                    : 'border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Active Tab View Outlet */}
      <Outlet context={{ business, reload: result.reload }} />
    </div>
  );
}
