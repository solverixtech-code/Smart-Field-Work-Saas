import React, { useState } from 'react';
import { Clock, Plus, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DatePicker } from '../../../components/ui/DatePicker';
import { useCrmQuery, useCrmMutation } from '../../../features/crm/CrmContext';
import { CrmFailure } from '../../../features/crm/CrmControls';
import { LeadFollowUpDto } from '../../../features/crm/lead.types';
import { toast } from 'sonner';

export function LeadFollowUpsTab({ leadId }: { leadId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('11:30 AM');
  const [notes, setNotes] = useState('');

  const mutation = useCrmMutation();
  const query = useCrmQuery('lead-followups:' + leadId, (s, signal) =>
    s.leads.followUps(leadId, signal)
  );

  const followUps = query.data || [];

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter follow-up title');
      return;
    }

    const success = await mutation.run(async (s, signal) => {
      await s.leads.createFollowUp(
        leadId,
        {
          title: title.trim(),
          scheduledDate,
          scheduledTime,
          notes: notes.trim() || undefined,
        },
        signal
      );
      return true;
    });

    if (success) {
      toast.success('Follow-up scheduled successfully!');
      setShowModal(false);
      setTitle('');
      setNotes('');
      query.reload();
    }
  };

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

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowModal(true)}
          className="font-bold flex items-center gap-1.5 shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="h-4 w-4" /> Add New Follow-up
        </Button>
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
                  <span className="font-extrabold text-[#0D1F3D] text-sm">{item.title}</span>
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

              {item.status === 'Pending' && (
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

      {/* Schedule Follow-up Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title="Schedule Follow-up Task"
          onClose={() => setShowModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateFollowUp} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Follow-up Action / Title *
              </label>
              <Input
                type="text"
                placeholder="e.g. Call VP Sales to review commercial proposal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Scheduled Date *
                </label>
                <DatePicker
                  value={scheduledDate}
                  onChange={(val) => setScheduledDate(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Time Slot *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 11:30 AM"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Instruction Notes / Discussion Points
              </label>
              <textarea
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none min-h-[80px]"
                placeholder="Confirm legal approval for SLA terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={mutation.pending}
                className="bg-[#0D1F3D] text-white hover:bg-slate-800 font-bold"
              >
                {mutation.pending ? 'Scheduling...' : 'Schedule Follow-up'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
