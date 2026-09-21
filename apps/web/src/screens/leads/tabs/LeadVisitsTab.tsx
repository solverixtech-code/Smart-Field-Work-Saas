import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle2, Camera, Plus, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useCrmQuery, useCrmMutation } from '../../../features/crm/CrmContext';
import { CrmFailure } from '../../../features/crm/CrmControls';
import { LeadVisitDto } from '../../../features/crm/lead.types';
import { toast } from 'sonner';

export function LeadVisitsTab({ leadId }: { leadId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [outcome, setOutcome] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  const mutation = useCrmMutation();
  const query = useCrmQuery('lead-visits:' + leadId, (s, signal) =>
    s.leads.visits(leadId, signal)
  );

  const visits = query.data || [];

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !purpose.trim()) {
      toast.error('Please enter visit location and purpose');
      return;
    }

    const success = await mutation.run(async (s, signal) => {
      await s.leads.createVisit(
        leadId,
        {
          location: location.trim(),
          purpose: purpose.trim(),
          outcome: outcome.trim() || 'Site meeting completed successfully',
          durationMinutes,
          status: 'COMPLETED',
        },
        signal
      );
      return true;
    });

    if (success) {
      toast.success('Field visit logged successfully!');
      setShowModal(false);
      setLocation('');
      setPurpose('');
      setOutcome('');
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
            <MapPin className="h-4 w-4 text-rose-600" />
            <span>Field Executive Geotagged Visit Logs</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            GPS verified check-ins, site meeting outcomes, and geotagged client office photos.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowModal(true)}
          className="font-bold flex items-center gap-1.5 shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="h-4 w-4" /> Log Field Visit
        </Button>
      </div>

      {query.loading && visits.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
          <p>Loading field visits...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
          <MapPin className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-extrabold text-[#0D1F3D]">No Field Visits Logged Yet</p>
          <p className="text-xs font-semibold text-slate-500">
            Record on-site client visits, GPS check-in times, and meeting outcomes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit: LeadVisitDto) => (
            <div
              key={visit.id}
              className="rounded-sm border border-slate-200 bg-slate-50/50 p-5 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs flex items-center justify-center border border-slate-300">
                    {visit.executiveName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D] text-sm">
                      {visit.executiveName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Checked in: {new Date(visit.checkInTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 font-extrabold text-[10px]">
                    {visit.status}
                  </span>
                  <span className="rounded-sm bg-slate-100 text-slate-700 px-2 py-0.5 font-bold text-[10px]">
                    ⏱️ {visit.durationMinutes} Mins
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-semibold text-slate-700">
                <p className="flex items-center gap-1.5 text-[#0D1F3D] font-extrabold text-xs">
                  <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />{' '}
                  {visit.location}
                </p>
                <div className="p-3 rounded-sm bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold block">
                    Purpose & Outcome
                  </span>
                  <p className="text-[#0D1F3D] leading-relaxed font-extrabold text-xs">
                    {visit.purpose}
                  </p>
                  <p className="text-slate-600 leading-snug font-semibold">{visit.outcome}</p>
                </div>
              </div>

              {/* Site Photos */}
              {visit.photos && visit.photos.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5 text-blue-600" /> Geotagged Site Photos ({visit.photos.length})
                  </span>
                  <div className="flex items-center gap-3">
                    {visit.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Site Visit"
                        className="h-20 w-28 rounded-sm object-cover border border-slate-200 shadow-xs hover:opacity-95 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Visit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title="Log Field Executive Visit"
          onClose={() => setShowModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateVisit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Visit Location / Address *
              </label>
              <Input
                type="text"
                placeholder="e.g. Andheri East Office, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Meeting Purpose *
              </label>
              <Input
                type="text"
                placeholder="e.g. Initial Requirements & Demonstration"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Meeting Outcome / Key Takeaway
              </label>
              <textarea
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none min-h-[80px]"
                placeholder="Client requested quote for 25 user licenses..."
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Duration (Minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
                {mutation.pending ? 'Saving...' : 'Save Visit Record'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
