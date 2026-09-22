import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useCrm, useCrmQuery, useCrmMutation } from '../../../features/crm/CrmContext';
import { CrmFailure } from '../../../features/crm/CrmControls';
import { LeadFollowUpDto } from '../../../features/crm/lead.types';
import { useAppSelector } from '../../../store';
import { FollowUpFormModal } from '../../followups/FollowUpFormModal';
import { toast } from 'sonner';

export function LeadFollowUpsTab({ leadId, leadName }: { leadId: string; leadName: string }) {
  const { can, readOnly } = useCrm();
  const canManage = (can('crm.followups.manage') || can('crm.leads.update')) && !readOnly;
  const membershipId = useAppSelector((state) => state.authorization.tenant?.membershipId);
  const [showModal, setShowModal] = useState(false);

  const mutation = useCrmMutation();
  const query = useCrmQuery('lead-followups:' + leadId, (s, signal) =>
    s.leads.followUps(leadId, signal)
  );

  const followUps = query.data || [];

  const handleMarkComplete = async (item: LeadFollowUpDto) => {
    const success = await mutation.run(async (s, signal) => {
      await s.leads.updateFollowUp(
        leadId,
        item.id,
        { status: 'Completed' },
        signal
      );
      return true;
    });

    if (success) {
      toast.success(`Follow-up "${item.title}" marked as completed!`);
      query.reload();
    }
  };

  if (query.error) {
    return <CrmFailure error={query.error} retry={query.reload} />;
  }

  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Scheduled Follow-ups & Reminders</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Set upcoming call schedules, proposal review meetings, and automated reminder alerts.
          </p>
        </div>

        {canManage && <Button
          variant="accent"
          size="sm"
          onClick={() => setShowModal(true)}
          className="font-bold flex items-center gap-1.5 shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="h-4 w-4" /> Add New Follow-up
        </Button>}
      </div>

      {query.loading && followUps.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
          <p>Loading follow-up tasks...</p>
        </div>
      ) : followUps.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
          <Clock className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-extrabold text-[#0D1F3D]">No Follow-ups Scheduled</p>
          <p className="text-xs font-semibold text-slate-500">
            Schedule follow-up calls or reminders to keep leads engaged.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((item: LeadFollowUpDto) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-slate-200 bg-slate-50/60 p-4 text-xs font-semibold"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {can('crm.followups.view') && (can('crm.leads.update') || item.assignedMembershipId === membershipId) ? <Link to={`/admin/follow-ups/${item.id}`} className="font-extrabold text-[#0D1F3D] text-sm hover:underline">{item.title}</Link> : <span className="font-extrabold text-[#0D1F3D] text-sm">{item.title}</span>}
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
                      item.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : item.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.type && (
                    <span className="rounded-sm bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200 uppercase">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 font-semibold">
                  Scheduled: <span className="text-[#0D1F3D] font-extrabold">{item.scheduledDate}</span> at{' '}
                  <span className="text-[#0D1F3D] font-extrabold">{item.scheduledTime}</span> • Assigned to{' '}
                  <span className="text-[#0D1F3D] font-extrabold">{item.assignedToName}</span>
                </p>
                {item.notes && (
                  <p className="text-slate-700 font-medium italic mt-1 bg-white p-2 rounded-md border border-slate-200/60">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {item.status === 'Pending' && canManage && (can('crm.leads.update') || item.assignedMembershipId === membershipId) && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={mutation.pending}
                  onClick={() => handleMarkComplete(item)}
                  className="font-bold border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Mark Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {mutation.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{mutation.error.message}</p>}

      <FollowUpFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={query.reload}
        initialLeadId={leadId}
        initialLeadName={leadName}
      />
    </div>
  );
}
