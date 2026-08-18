import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Calendar,
  ShieldAlert,
  Download,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { OverviewTab } from './tabs/OverviewTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { RouteHistoryTab } from './tabs/RouteHistoryTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { VisitsTab } from './tabs/VisitsTab';
import { SalesTab } from './tabs/SalesTab';
import { IncentivesTab } from './tabs/IncentivesTab';

export default function ExecutiveDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'route' | 'attendance' | 'visits' | 'sales' | 'incentives'>('overview');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  return (
    <div className="space-y-3 font-sans">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/executives')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Executives
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Executive Report...')}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Report
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/executives/${id || 'FE-1001'}/edit`)}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <Edit className="h-4 w-4" /> Edit Executive
          </Button>
        </div>
      </div>

      {/* Profile Header Banner Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Left Avatar & Core Info */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Rahul Verma"
                className="h-24 w-24 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-slate-100"
              />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-[#0D1F3D]">Rahul Verma</h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-0.5 text-xs font-extrabold text-emerald-600">
                  Active
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {id || 'FE-1001'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#E20613]">Field Executive • Sales Operations</p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#E20613]" /> +91 98765 43210</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-600" /> rahul.verma@visibloai.com</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-purple-600" /> Mumbai North, Mumbai</span>
              </div>
            </div>
          </div>

          {/* Right Reporting & Contract Details Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-semibold text-slate-600 pt-1 sm:pt-0">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Reporting To</span>
              <span className="font-extrabold text-[#0D1F3D]">Sanjay Yadav (TL-1003)</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Team</span>
              <span className="font-bold text-slate-700">Mumbai North Team</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Join Date</span>
              <span className="font-bold text-slate-700">12 Apr 2024</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Experience</span>
              <span className="font-bold text-slate-700">1.8 Years</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Employment Type</span>
              <span className="font-bold text-emerald-600">Full Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-xs scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Performance' },
          { id: 'route', label: 'Route History' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'visits', label: 'Visits' },
          { id: 'sales', label: 'Sales' },
          { id: 'incentives', label: 'Incentives' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0D1F3D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-Tab View */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'route' && <RouteHistoryTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'visits' && <VisitsTab />}
        {activeTab === 'sales' && <SalesTab />}
        {activeTab === 'incentives' && <IncentivesTab />}
      </div>
    </div>
  );
}
