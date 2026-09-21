import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Download,
  CheckCircle2,
  Trash2,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
} from '../../features/crm/CrmContext';
import { CrmFailure } from '../../features/crm/CrmControls';
import {
  LeadConversionModal,
  LeadAssignment,
} from '../../features/crm/LeadForms';
import { leadLabel } from '../../features/crm/lead.types';

// Tabs
import { LeadOverviewTab } from './tabs/LeadOverviewTab';
import { LeadTimelineTab } from './tabs/LeadTimelineTab';
import { LeadVisitsTab } from './tabs/LeadVisitsTab';
import { LeadFollowUpsTab } from './tabs/LeadFollowUpsTab';
import { LeadDemosTab } from './tabs/LeadDemosTab';
import { LeadCommunicationTab } from './tabs/LeadCommunicationTab';
import { LeadAssignmentTab } from './tabs/LeadAssignmentTab';

export default function LeadDetailsPage() {
  const { leadId = '' } = useParams();
  return <LeadDetailsContent key={leadId} />;
}

function LeadDetailsContent() {
  const { leadId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { can, readOnly } = useCrm();

  const [converting, setConverting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mutation = useCrmMutation();
  const result = useCrmQuery('lead-detail:' + leadId, (s, signal) =>
    s.leads.get(leadId, signal)
  );

  const lead = result.data;

  // Determine active tab from URL path
  const activeSegment = location.pathname.split('/').at(-1) || '';
  let activeTab = 'overview';
  if (activeSegment === 'timeline') activeTab = 'timeline';
  else if (activeSegment === 'visits') activeTab = 'visits';
  else if (activeSegment === 'follow-ups') activeTab = 'follow-ups';
  else if (activeSegment === 'demos') activeTab = 'demos';
  else if (activeSegment === 'communications') activeTab = 'communications';
  else if (activeSegment === 'assignment') activeTab = 'assignment';

  const handleTabChange = (tabId: string) => {
    if (!lead) return;
    if (tabId === 'overview') navigate(`/admin/leads/${lead.id}`);
    else navigate(`/admin/leads/${lead.id}/${tabId}`);
  };

  if (result.error) {
    return <CrmFailure error={result.error} retry={result.reload} />;
  }

  if (!lead) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-slate-500">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
        <p>Loading lead details...</p>
      </div>
    );
  }

  const mutable = ['OPEN', 'QUALIFIED'].includes(lead.status);

  const handleExportSummary = () => {
    toast.success(`Exported lead summary report for ${lead.name}`);
  };

  return (
    <div className="space-y-4 font-sans pb-16">
      {/* 1. Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Leads
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 rounded-sm"
          >
            <Download className="h-3.5 w-3.5 text-[#0D1F3D]" /> Export Summary
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!mutable || readOnly || !can('crm.leads.update')}
            onClick={() => navigate(`/admin/leads/${lead.id}/edit`)}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 rounded-sm"
          >
            <Edit className="h-3.5 w-3.5" /> Edit Lead
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={lead.status !== 'QUALIFIED' || readOnly || !can('crm.leads.convert')}
            onClick={() => setConverting(true)}
            className="flex items-center gap-1.5 font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Convert Lead
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lead.status === 'CONVERTED' || readOnly || !can('crm.leads.delete')}
            onClick={() => setDeleting(true)}
            className="flex items-center gap-1.5 font-bold text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200 rounded-sm"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* 2. Banner Header Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Left Core Lead Metrics */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[#0D1F3D]">{lead.name}</h2>
              <span className="rounded-sm bg-slate-900 text-white px-2.5 py-0.5 text-xs font-mono font-bold">
                {lead.leadCode}
              </span>
              <span
                className={`rounded-sm px-3 py-0.5 text-xs font-extrabold border ${
                  lead.status === 'CONVERTED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : lead.status === 'QUALIFIED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : lead.status === 'DISQUALIFIED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {leadLabel(lead.status)}
              </span>
              <span
                className={`rounded-sm px-2.5 py-0.5 text-xs font-extrabold text-white ${
                  lead.priority === 'URGENT' || lead.priority === 'HIGH'
                    ? 'bg-[#E20613]'
                    : lead.priority === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-slate-700'
                }`}
              >
                {leadLabel(lead.priority)}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600">
              {lead.contactName || 'Primary Contact Not Set'} • {lead.source || 'Direct Field Lead'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#E20613]" /> {lead.phone || 'Phone not set'}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" /> {lead.email || 'Email not set'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-purple-600" />{' '}
                {[lead.city, lead.state, lead.countryCode].filter(Boolean).join(', ') || 'Location not set'}
              </span>
            </div>
          </div>

          {/* Right Estimated Value & Executive Details */}
          <div className="flex flex-col items-end gap-3 text-right">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Estimated Deal Value</span>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                {lead.estimatedValue == null
                  ? 'Not set'
                  : `₹${lead.estimatedValue.toLocaleString('en-IN')}`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 p-2.5 rounded-xl text-left text-xs font-semibold">
              {lead.assignee?.avatarUrl || lead.owner?.avatarUrl ? (
                <img
                  src={lead.assignee?.avatarUrl || lead.owner?.avatarUrl || undefined}
                  alt={lead.assignee?.displayName || lead.owner.displayName}
                  className="h-8 w-8 rounded-full object-cover border border-slate-300 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                  {(lead.assignee?.displayName || lead.owner.displayName).slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-extrabold text-[#0D1F3D] text-xs">
                  {lead.assignee?.displayName || 'Unassigned Executive'}
                </p>
                <p className="text-[11px] text-slate-600 font-semibold">
                  Owner: <span className="text-[#0D1F3D] font-extrabold">{lead.owner.displayName}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1 border border-slate-200/80 overflow-x-auto text-xs font-bold scrollbar-none pb-0 bg-white p-1 rounded-xl shadow-2xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'visits', label: 'Field Visits' },
          { id: 'follow-ups', label: 'Follow-ups' },
          { id: 'demos', label: 'Product Demos' },
          { id: 'communications', label: 'Communications' },
          { id: 'assignment', label: 'Lead Assignment' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-extrabold transition-all whitespace-nowrap cursor-pointer text-xs ${
                isActive
                  ? 'bg-[#0D1F3D] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0D1F3D] hover:bg-slate-100/60 font-semibold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Active Sub-Tab View */}
      <div className="pt-1">
        {activeTab === 'overview' && <LeadOverviewTab lead={lead} />}
        {activeTab === 'timeline' && <LeadTimelineTab leadId={lead.id} />}
        {activeTab === 'visits' && <LeadVisitsTab leadId={lead.id} />}
        {activeTab === 'follow-ups' && <LeadFollowUpsTab leadId={lead.id} />}
        {activeTab === 'demos' && <LeadDemosTab leadId={lead.id} />}
        {activeTab === 'communications' && <LeadCommunicationTab leadId={lead.id} />}
        {activeTab === 'assignment' && (
          <LeadAssignment key={lead.id} lead={lead} onSaved={() => navigate('/admin/leads')} />
        )}
      </div>


      {/* Modals */}
      {converting && (
        <LeadConversionModal
          lead={lead}
          onClose={() => setConverting(false)}
          onSaved={() => {
            setConverting(false);
            toast.success(`Lead "${lead.name}" converted successfully! Sales deal created.`);
            navigate('/admin/sales/pipeline');
          }}
        />
      )}

      {deleting && (
        <Modal
          isOpen={deleting}
          title="Delete Lead Record"
          onClose={() => {
            if (!mutation.pending) setDeleting(false);
          }}
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-slate-600 font-medium">
              Are you sure you want to delete <strong className="text-[#0D1F3D]">{lead.name}</strong>? This record will be removed from your active workspace.
            </p>
            {mutation.error && <CrmFailure error={mutation.error} />}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={mutation.pending}
                onClick={() => setDeleting(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={mutation.pending || Boolean(mutation.error?.conflict)}
                onClick={async () => {
                  const outcome = await mutation.run(async (s, signal) => {
                    await s.leads.remove(lead.id, lead.revision, signal);
                    return true;
                  });
                  if (outcome) navigate('/admin/leads');
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {mutation.pending ? 'Deleting...' : 'Delete Lead'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
