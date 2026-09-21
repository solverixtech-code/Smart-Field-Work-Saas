import React, { useState } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Phone, Mail, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCrmQuery, useCrmMutation } from '../../../features/crm/CrmContext';
import { CrmFailure } from '../../../features/crm/CrmControls';
import { LeadCommunicationDto } from '../../../features/crm/lead.types';

export function LeadCommunicationTab({ leadId }: { leadId: string }) {
  const [commChannel, setCommChannel] = useState<'Call' | 'Email' | 'WhatsApp'>('Call');
  const [direction, setDirection] = useState<'Outbound' | 'Inbound'>('Outbound');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const mutation = useCrmMutation();
  const query = useCrmQuery('lead-communications:' + leadId, (s, signal) =>
    s.leads.communications(leadId, signal)
  );

  const communications = query.data || [];

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter a subject or topic for the communication log.');
      return;
    }

    const success = await mutation.run(async (s, signal) => {
      await s.leads.createCommunication(
        leadId,
        {
          channel: commChannel,
          direction,
          subject: subject.trim(),
          details: details.trim() || undefined,
        },
        signal
      );
      return true;
    });

    if (success) {
      toast.success(`${commChannel} communication logged successfully!`);
      setShowLogForm(false);
      setSubject('');
      setDetails('');
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
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <span>Call, Email & WhatsApp Communication Logs</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Log inbound/outbound calls, email exchanges, WhatsApp messages, and official documentation links.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowLogForm(!showLogForm)}
          className="font-bold flex items-center gap-1.5 shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="h-4 w-4" /> Log Communication
        </Button>
      </div>

      {/* Log Form Dialog Container */}
      {showLogForm && (
        <form
          onSubmit={handleSaveLog}
          className="rounded-sm border border-teal-200 bg-teal-50/40 p-5 space-y-4 text-xs font-semibold animate-fadeIn"
        >
          <h4 className="font-extrabold text-[#0D1F3D] text-sm">Log New Communication Activity</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-500 block mb-1">Communication Channel</label>
              <select
                value={commChannel}
                onChange={(e) => setCommChannel(e.target.value as any)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D] text-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email Exchange</option>
                <option value="WhatsApp">WhatsApp Message</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D] text-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="Outbound">Outbound (Executive to Client)</option>
                <option value="Inbound">Inbound (Client to Executive)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">Subject / Topic *</label>
              <Input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Discussed pricing discount"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-500 block mb-1">Notes & Key Discussion Summary</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter key details discussed with client..."
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-[#0D1F3D] font-semibold placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowLogForm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={mutation.pending}
              className="bg-[#0D1F3D] text-white hover:bg-slate-800 font-bold"
            >
              {mutation.pending ? 'Saving...' : 'Save Log'}
            </Button>
          </div>
        </form>
      )}

      {/* Communications Stream */}
      {query.loading && communications.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
          <p>Loading communication history...</p>
        </div>
      ) : communications.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
          <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-extrabold text-[#0D1F3D]">No Communication Logs Recorded</p>
          <p className="text-xs font-semibold text-slate-500">
            Log outbound or inbound calls, emails, and WhatsApp conversations with this lead.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map((comm: LeadCommunicationDto) => (
            <div
              key={comm.id}
              className="rounded-sm border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs font-semibold"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
                      comm.channel === 'Call'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : comm.channel === 'Email'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {comm.channel} ({comm.direction})
                  </span>
                  <span className="font-extrabold text-[#0D1F3D] text-sm">{comm.subject}</span>
                </div>
                <span className="text-slate-500 font-semibold text-[11px]">
                  {new Date(comm.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              {comm.details && (
                <p className="text-slate-700 leading-relaxed font-semibold bg-white p-2.5 rounded-sm border border-slate-200/70">
                  {comm.details}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <div className="h-5 w-5 rounded-full bg-[#0D1F3D] text-white font-extrabold text-[10px] flex items-center justify-center border border-slate-300">
                  {comm.loggedByName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-extrabold text-slate-700">
                  Logged by {comm.loggedByName}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
