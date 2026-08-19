import React, { useState } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Phone, Mail, Plus, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadCommunications } from '../leadsData';

export function LeadCommunicationTab() {
  const [commChannel, setCommChannel] = useState<'Call' | 'Email' | 'WhatsApp'>('Call');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter a subject or title for the communication log.');
      return;
    }
    toast.success(`${commChannel} communication logged successfully!`);
    setShowLogForm(false);
    setSubject('');
    setDetails('');
  };

  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
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
          className="font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Log Communication
        </Button>
      </div>

      {/* Log Form Dialog Container */}
      {showLogForm && (
        <form onSubmit={handleSaveLog} className="rounded-sm border border-teal-200 bg-teal-50/40 p-5 space-y-4 text-xs font-semibold animate-fadeIn">
          <h4 className="font-extrabold text-[#0D1F3D] text-sm">Log New Communication Activity</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Communication Channel</label>
              <select
                value={commChannel}
                onChange={(e) => setCommChannel(e.target.value as any)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D]"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email Exchange</option>
                <option value="WhatsApp">WhatsApp Message</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject / Topic *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Discussed pricing discount"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Notes & Summary</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter key details discussed with client..."
              className="w-full rounded-sm border border-slate-200 bg-white p-3 font-semibold text-[#0D1F3D]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowLogForm(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit" className="font-bold shadow-xs">
              Save Log
            </Button>
          </div>
        </form>
      )}

      {/* Communications Stream */}
      <div className="space-y-3">
        {mockLeadCommunications.map((comm) => (
          <div key={comm.id} className="rounded-sm border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs font-semibold">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
                  comm.channel === 'Call' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  comm.channel === 'Email' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {comm.channel} ({comm.direction})
                </span>
                <span className="font-extrabold text-[#0D1F3D] text-sm">{comm.subject}</span>
              </div>
              <span className="text-slate-400 font-normal">{comm.timestamp}</span>
            </div>

            <p className="text-slate-700 leading-relaxed font-normal">{comm.details}</p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <img src={comm.loggedByAvatar} alt={comm.loggedBy} className="h-5 w-5 rounded-full object-cover border" />
              <span className="text-[11px] font-bold text-slate-700">Logged by {comm.loggedBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
