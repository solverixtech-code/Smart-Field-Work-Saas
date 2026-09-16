import { MessageSquare, Phone, Mail, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const plannedChannels = [
  { label: 'Phone calls', icon: Phone, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
  { label: 'Email exchanges', icon: Mail, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
  { label: 'WhatsApp messages', icon: Send, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
];

export function LeadCommunicationTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <span>Call, Email & WhatsApp Communication Logs</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Communication integrations are planned as a separate CRM activity module. This lead screen does not show sample activity.
          </p>
        </div>

        <Button variant="accent" size="sm" disabled className="font-bold flex items-center gap-1.5 shadow-xs">
          Log Communication
        </Button>
      </div>

      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
          <MessageSquare className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">No communication logs yet</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Once the communication activity backend is added, real calls, emails, and WhatsApp records will appear here.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {plannedChannels.map(({ label, icon: Icon, tone }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-bold ${tone}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
