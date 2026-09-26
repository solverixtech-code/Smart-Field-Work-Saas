import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Play,
  Download,
  Search,
  Filter,
  MoreVertical,
  Volume2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { getCallLogs, CallLogItem } from './telecaller.api';
import { StartCallingModal } from './modals/StartCallingModal';

export const CallsPage: React.FC = () => {
  const [logs, setLogs] = useState<CallLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState('2025-05-26');

  // Active Menu / Modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [playingCall, setPlayingCall] = useState<CallLogItem | null>(null);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [selectedLeadForDial, setSelectedLeadForDial] = useState<{ leadName: string; company: string; phone: string } | null>(null);

  useEffect(() => {
    getCallLogs().then((res) => {
      setLogs(res);
      setLoading(false);
    });
  }, []);

  const formatDuration = (secs: number) => {
    if (secs === 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phone.includes(searchQuery) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || log.callType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStartDialer = (log?: CallLogItem) => {
    if (log) {
      setSelectedLeadForDial({
        leadName: log.leadName,
        company: log.company,
        phone: log.phone,
      });
    } else {
      setSelectedLeadForDial({
        leadName: 'Khushwant Kaur',
        company: 'Solverix Technologies',
        phone: '+91 98765 43219',
      });
    }
    setDialerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1F3D]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
            Call Activity & Logs
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            Track outbound calls, review recorded conversations, call dispositions, and live dialer queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
            <DatePicker value={selectedDate} onChange={setSelectedDate} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting Call Logs (CSV)...')}
            className="flex items-center gap-2 font-semibold"
          >
            <Download className="h-4 w-4" /> Export Logs
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleStartDialer()}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <PhoneCall className="h-4 w-4" /> Start Dialer
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Calls Logged"
          value="142 Calls"
          subValue="+12% vs yesterday"
          icon={PhoneCall}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Connected & Answered"
          value="118 Connected"
          subValue="83.1% Connect Rate"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Avg Call Duration"
          value="3m 45s"
          subValue="02h 46m total talk time"
          icon={Clock}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Demos & Conversions"
          value="28 Converted"
          subValue="18.4% Conversion Rate"
          icon={PhoneOutgoing}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lead name, company, phone, or call ID..."
              className="w-full rounded-sm border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
          >
            <option value="ALL">All Call Statuses</option>
            <option value="Connected">Connected</option>
            <option value="Missed">Missed</option>
            <option value="Busy / No Answer">Busy / No Answer</option>
            <option value="Voicemail">Voicemail</option>
          </select>

          {/* Call Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
          >
            <option value="ALL">All Call Types</option>
            <option value="Outbound Sales">Outbound Sales</option>
            <option value="Inbound Lead">Inbound Lead</option>
            <option value="Follow-up Call">Follow-up Call</option>
            <option value="Demo Booking">Demo Booking</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-600">
          Showing <span className="text-[#0D1F3D]">{filteredLogs.length}</span> of {logs.length} calls
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-sm border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-700">
                <th className="py-3 px-4">Lead / Company</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Call Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Disposition & Notes</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-semibold">
                    No calls found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Lead / Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#0D1F3D] text-xs">{item.leadName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.company}</div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                      {item.phone}
                    </td>

                    {/* Call Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {item.callType === 'Outbound Sales' && <PhoneOutgoing className="h-3 w-3 text-blue-600" />}
                        {item.callType === 'Inbound Lead' && <PhoneIncoming className="h-3 w-3 text-emerald-600" />}
                        {item.callType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-extrabold border ${
                          item.status === 'Connected'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Missed'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status === 'Connected' && <CheckCircle2 className="h-3 w-3" />}
                        {item.status === 'Missed' && <XCircle className="h-3 w-3" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                      {formatDuration(item.durationSeconds)}
                    </td>

                    {/* Disposition & Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-[#0D1F3D] truncate">{item.disposition}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.notes}</div>
                    </td>

                    {/* Logged By */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.loggedBy}
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                      {item.timeCaptured}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.hasRecording && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPlayingCall(item)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            title="Play Recording"
                          >
                            <Play className="h-3.5 w-3.5" /> Listen
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartDialer(item)}
                          className="text-xs font-bold text-[#0D1F3D]"
                        >
                          Redial
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recording Playback Modal */}
      <Modal
        isOpen={playingCall !== null}
        onClose={() => setPlayingCall(null)}
        title="Call Audio Recording"
        maxWidth="max-w-md"
      >
        {playingCall && (
          <div className="space-y-4 font-sans">
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#0D1F3D]">{playingCall.leadName}</h4>
                <p className="text-xs text-slate-500 font-medium">{playingCall.company} • {playingCall.phone}</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{formatDuration(playingCall.durationSeconds)}</span>
            </div>

            {/* Audio Player Waveform Simulation */}
            <div className="rounded-sm border border-slate-200 bg-[#0D1F3D] p-5 text-white flex flex-col items-center justify-center space-y-3">
              <Volume2 className="h-8 w-8 text-emerald-400 animate-pulse" />
              <div className="w-full flex items-center gap-1 justify-center h-8">
                <span className="w-1 bg-emerald-400 h-4 rounded-full animate-bounce" />
                <span className="w-1 bg-emerald-400 h-6 rounded-full animate-bounce delay-75" />
                <span className="w-1 bg-emerald-400 h-8 rounded-full animate-bounce delay-100" />
                <span className="w-1 bg-emerald-400 h-5 rounded-full animate-bounce delay-150" />
                <span className="w-1 bg-emerald-400 h-7 rounded-full animate-bounce delay-200" />
                <span className="w-1 bg-emerald-400 h-3 rounded-full animate-bounce delay-300" />
              </div>
              <p className="text-xs font-mono text-slate-300">Playback 01:14 / {formatDuration(playingCall.durationSeconds)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Call Notes & Disposition:</label>
              <div className="rounded-sm border border-slate-200 p-3 bg-white text-xs text-slate-700">
                <p className="font-bold text-[#0D1F3D]">{playingCall.disposition}</p>
                <p className="text-slate-600 mt-1">{playingCall.notes}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setPlayingCall(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Interactive Call Dialer Modal */}
      <StartCallingModal
        isOpen={dialerOpen}
        onClose={() => setDialerOpen(false)}
        leadName={selectedLeadForDial?.leadName}
        company={selectedLeadForDial?.company}
        phone={selectedLeadForDial?.phone}
      />
    </div>
  );
};

export default CallsPage;
