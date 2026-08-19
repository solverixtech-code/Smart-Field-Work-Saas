import React from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Edit,
  MoreVertical,
  CheckCircle2,
  UserCheck,
  Globe,
  ShoppingBag,
  Calendar,
  CreditCard,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockBusinesses } from './businessesData';

export default function BusinessLayoutWrapper() {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const business = mockBusinesses.find((b) => b.id === businessId) || mockBusinesses[0];

  const navItems = [
    { label: 'Business Details', icon: Building2, path: `/admin/businesses/${business.id}` },
    { label: 'Contacts (12)', icon: Users, path: `/admin/businesses/${business.id}/contacts` },
    { label: 'Google Profile', icon: Globe, path: `/admin/businesses/${business.id}/google-profile` },
    { label: 'Sales History', icon: ShoppingBag, path: `/admin/businesses/${business.id}/sales-history` },
    { label: 'Visit History', icon: Calendar, path: `/admin/businesses/${business.id}/visits` },
    { label: 'Subscription', icon: CreditCard, path: `/admin/businesses/${business.id}/subscription` },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-12 w-12 rounded-md object-cover border border-slate-200 shrink-0"
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
              {business.businessType} • <span className="font-mono text-slate-400">ID: {business.id}</span> • Established in {business.establishedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('More business actions...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <MoreVertical className="h-4 w-4" /> More Actions
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <Edit className="h-4 w-4" /> Edit Business
          </Button>
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
      <Outlet context={business} />
    </div>
  );
}
