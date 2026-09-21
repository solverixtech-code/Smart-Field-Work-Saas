import React, { useState } from 'react';
import { Video, Plus, Star, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DatePicker } from '../../../components/ui/DatePicker';
import { useCrmQuery, useCrmMutation } from '../../../features/crm/CrmContext';
import { CrmFailure } from '../../../features/crm/CrmControls';
import { LeadDemoDto } from '../../../features/crm/lead.types';
import { toast } from 'sonner';

export function LeadDemosTab({ leadId }: { leadId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [demoTitle, setDemoTitle] = useState('Solverix Smart Field Work Platform Walkthrough');
  const [demoDate, setDemoDate] = useState(new Date().toISOString().split('T')[0]);
  const [demoMode, setDemoMode] = useState('Virtual Google Meet');
  const [attendeesCount, setAttendeesCount] = useState(3);
  const [feedbackRating, setFeedbackRating] = useState(5.0);
  const [keyQuestions, setKeyQuestions] = useState('');

  const mutation = useCrmMutation();
  const query = useCrmQuery('lead-demos:' + leadId, (s, signal) =>
    s.leads.demos(leadId, signal)
  );

  const demos = query.data || [];

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoTitle.trim()) {
      toast.error('Please enter demo title');
      return;
    }

    const success = await mutation.run(async (s, signal) => {
      await s.leads.createDemo(
        leadId,
        {
          demoTitle: demoTitle.trim(),
          demoDate,
          demoMode,
          attendeesCount,
          feedbackRating,
          keyQuestions: keyQuestions.trim() || undefined,
          status: 'COMPLETED',
        },
        signal
      );
      return true;
    });

    if (success) {
      toast.success('Product demo record saved!');
      setShowModal(false);
      setKeyQuestions('');
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
            <Video className="h-4 w-4 text-indigo-600" />
            <span>Product Walkthrough & Demo History</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Recorded demo sessions, client feedback ratings, attendee counts, and key technical questions asked.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowModal(true)}
          className="font-bold flex items-center gap-1.5 shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="h-4 w-4" /> Schedule Product Demo
        </Button>
      </div>

      {query.loading && demos.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
          <p>Loading demo history...</p>
        </div>
      ) : demos.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
          <Video className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-extrabold text-[#0D1F3D]">No Product Demos Conducted Yet</p>
          <p className="text-xs font-semibold text-slate-500">
            Schedule a virtual or on-site demo to walk the lead through Solverix platform features.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {demos.map((demo: LeadDemoDto) => (
            <div
              key={demo.id}
              className="rounded-sm border border-slate-200 bg-slate-50/60 p-5 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <h4 className="font-extrabold text-[#0D1F3D] text-sm">
                    {demo.demoTitle}
                  </h4>
                  <p className="text-slate-500 text-[11px] font-semibold">
                    {demo.demoDate} • {demo.demoMode}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-sm text-[11px]">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{' '}
                    {demo.feedbackRating} / 5 Rating
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-500 font-extrabold block">
                    Conducted By
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-[#0D1F3D] text-white font-extrabold text-[10px] flex items-center justify-center border border-slate-300">
                      {demo.conductedByName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-[#0D1F3D]">
                      {demo.conductedByName}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-extrabold block">
                    Client Attendees
                  </span>
                  <span className="font-extrabold text-[#0D1F3D] flex items-center gap-1 mt-1">
                    <Users className="h-3.5 w-3.5 text-blue-600" />{' '}
                    {demo.attendeesCount} Key Decision Makers
                  </span>
                </div>
              </div>

              {demo.keyQuestions && (
                <div className="p-3 rounded-sm bg-white border border-slate-200/80 text-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold block">
                    Client Questions & Feedback
                  </span>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {demo.keyQuestions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Product Demo Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title="Record Product Demo Session"
          onClose={() => setShowModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateDemo} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Demo Session Title *
              </label>
              <Input
                type="text"
                value={demoTitle}
                onChange={(e) => setDemoTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Demo Date *
                </label>
                <DatePicker value={demoDate} onChange={(val) => setDemoDate(val)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Demo Mode
                </label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                  value={demoMode}
                  onChange={(e) => setDemoMode(e.target.value)}
                >
                  <option value="Virtual Google Meet">Virtual Google Meet</option>
                  <option value="Virtual Zoom Call">Virtual Zoom Call</option>
                  <option value="Virtual Microsoft Teams">Virtual Microsoft Teams</option>
                  <option value="On-Site Client HQ Office">On-Site Client HQ Office</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Attendees Count
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Feedback Rating (1.0 - 5.0)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min={1}
                  max={5}
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Key Questions & Client Feedback
              </label>
              <textarea
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none min-h-[80px]"
                placeholder="Client asked about offline sync speed and battery usage..."
                value={keyQuestions}
                onChange={(e) => setKeyQuestions(e.target.value)}
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
                {mutation.pending ? 'Saving...' : 'Save Demo Record'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
