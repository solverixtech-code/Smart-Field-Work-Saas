import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Target,
  Download,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Flame,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockLeadsData, LeadItem } from './leadsData';

import { LeadOverviewTab } from './tabs/LeadOverviewTab';
import { LeadTimelineTab } from './tabs/LeadTimelineTab';
import { LeadVisitsTab } from './tabs/LeadVisitsTab';
import { LeadFollowUpsTab } from './tabs/LeadFollowUpsTab';
import { LeadDemosTab } from './tabs/LeadDemosTab';
import { LeadCommunicationTab } from './tabs/LeadCommunicationTab';
import { LeadPaymentsTab } from './tabs/LeadPaymentsTab';
import { LeadAssignmentTab } from './tabs/LeadAssignmentTab';

export default function LeadDetailsPage() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const location = useLocation();

  const currentLead: LeadItem = mockLeadsData.find((l) => l.id === leadId) || mockLeadsData[0];

  // Determine active sub-tab from URL pathname
  let initialTab: 'overview' | 'timeline' | 'visits' | 'follow-ups' | 'demos' | 'communications' | 'payments' | 'assignment' = 'overview';
  if (location.pathname.includes('/timeline')) initialTab = 'timeline';
  else if (location.pathname.includes('/visits')) initialTab = 'visits';
  else if (location.pathname.includes('/follow-ups')) initialTab = 'follow-ups';
  else if (location.pathname.includes('/demos')) initialTab = 'demos';
  else if (location.pathname.includes('/communications')) initialTab = 'communications';
  else if (location.pathname.includes('/payments')) initialTab = 'payments';
  else if (location.pathname.includes('/assignment')) initialTab = 'assignment';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.pathname.includes('/timeline')) setActiveTab('timeline');
    else if (location.pathname.includes('/visits')) setActiveTab('visits');
    else if (location.pathname.includes('/follow-ups')) setActiveTab('follow-ups');
    else if (location.pathname.includes('/demos')) setActiveTab('demos');
    else if (location.pathname.includes('/communications')) setActiveTab('communications');
    else if (location.pathname.includes('/payments')) setActiveTab('payments');
    else if (location.pathname.includes('/assignment')) setActiveTab('assignment');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    if (tabId === 'overview') navigate(`/admin/leads/${currentLead.id}`);
    else navigate(`/admin/leads/${currentLead.id}/${tabId}`);
  };

  return (
    <div className="space-y-3 font-sans pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Leads
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`Exporting lead report for ${currentLead.companyName}`)}
            className="flex items-center gap-2 font-bold border-slate-200 text-slate-700"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Lead Summary
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/leads/${currentLead.id}/edit`)}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <Edit className="h-4 w-4" /> Edit Lead Info
          </Button>
        </div>
      </div>

      {/* Banner Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Left Core Lead Metrics & Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[#0D1F3D]">{currentLead.companyName}</h2>
              <span className="rounded-md bg-slate-900 text-white px-2.5 py-0.5 text-xs font-mono font-bold">
                {currentLead.code}
              </span>
              <span className={`rounded-md px-3 py-0.5 text-xs font-extrabold border ${
                currentLead.stage === 'Won / Converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                currentLead.stage === 'Lost' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                {currentLead.stage}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600">
              {currentLead.contactPerson} ({currentLead.designation}) • {currentLead.leadSource}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#E20613]" /> {currentLead.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-600" /> {currentLead.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-purple-600" /> {currentLead.address}</span>
            </div>
          </div>

          {/* Right Estimated Value & Executive Details */}
          <div className="flex flex-col items-end gap-3 text-right">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Estimated Deal Value</span>
              <p className="text-2xl font-extrabold text-emerald-600">₹{currentLead.estimatedValue.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl text-left text-xs font-semibold">
              <img
                src={currentLead.assignedExecutiveAvatar}
                alt={currentLead.assignedExecutive}
                className="h-8 w-8 rounded-full object-cover border"
              />
              <div>
                <p className="font-extrabold text-[#0D1F3D] text-xs">{currentLead.assignedExecutive}</p>
                <p className="text-[10px] text-slate-400 font-medium">{currentLead.assignedLeader} (TL)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-xs scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'visits', label: 'Field Visits' },
          { id: 'follow-ups', label: 'Follow-ups' },
          { id: 'demos', label: 'Product Demos' },
          { id: 'communications', label: 'Communications' },
          { id: 'payments', label: 'Payments Ledger' },
          { id: 'assignment', label: 'Lead Assignment' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
      <div className="pt-1">
        {activeTab === 'overview' && <LeadOverviewTab lead={currentLead} />}
        {activeTab === 'timeline' && <LeadTimelineTab />}
        {activeTab === 'visits' && <LeadVisitsTab />}
        {activeTab === 'follow-ups' && <LeadFollowUpsTab />}
        {activeTab === 'demos' && <LeadDemosTab />}
        {activeTab === 'communications' && <LeadCommunicationTab />}
        {activeTab === 'payments' && <LeadPaymentsTab />}
        {activeTab === 'assignment' && <LeadAssignmentTab lead={currentLead} />}
      </div>
    </div>
  );
}
